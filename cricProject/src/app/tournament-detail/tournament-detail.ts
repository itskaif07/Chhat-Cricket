import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from '../shared/models/player.model';
import { RetrievePlayersService } from '../services/retrievePlayer/retrieve-players-service';
import { MatchSetupService } from '../services/MatchSetup/match-setup-service';
import { AuctionPlayer, TournamentRecord, TournamentService } from '../services/tournament/tournament-service';
import { MatchService } from '../services/matchService/match-service';

@Component({
  selector: 'app-tournament-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './tournament-detail.html',
  styleUrl: './tournament-detail.css',
})
export class TournamentDetail implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService,
    private playerService: RetrievePlayersService,
    private matchService: MatchService,
    private matchSetup: MatchSetupService,
    private cdr: ChangeDetectorRef,
  ) {}

  private subscriptions: Subscription[] = [];
  tournament?: TournamentRecord;
  players: Player[] = [];
  matches: any[] = [];
  loading = true;
  savingAuction = false;
  auctionTeam: 'A' | 'B' = 'A';
  auctionPrice = 0;
  error = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/tournaments']);
      return;
    }

    this.subscriptions.push(this.tournamentService.getTournament(id).subscribe({
      next: (tournament) => {
        this.tournament = tournament;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'This tournament could not be found.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    }));
    this.subscriptions.push(this.playerService.getAllPlayers().subscribe((players) => {
      this.players = players || [];
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.matchService.retrieveMatches().subscribe((matches: any[]) => {
      this.matches = matches || [];
      this.cdr.detectChanges();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  get tournamentMatches() {
    return this.matches.filter((match) => match.tournamentId === this.tournament?.id);
  }

  get teamAWins() {
    return this.tournamentMatches.filter((match) => match.winningTeam === 'A').length;
  }

  get teamBWins() {
    return this.tournamentMatches.filter((match) => match.winningTeam === 'B').length;
  }

  get isComplete() {
    return !!this.tournament && (this.teamAWins >= this.tournament.winsToWin || this.teamBWins >= this.tournament.winsToWin || this.tournamentMatches.length >= this.tournament.matchLimit);
  }

  get championName() {
    if (!this.tournament || !this.isComplete || this.teamAWins === this.teamBWins) return '';
    return this.teamAWins > this.teamBWins ? this.tournament.teamAName : this.tournament.teamBName;
  }

  get totalRuns() {
    return this.tournamentMatches.reduce((total, match) => total + Number(match.innings?.[0]?.firstInningsTotalRuns || 0) + Number(match.innings?.[1]?.secondInningsTotalRuns || 0), 0);
  }

  get totalWickets() {
    return this.tournamentMatches.reduce((total, match) => total + Number(match.innings?.[0]?.firstInningsTotalWickets || 0) + Number(match.innings?.[1]?.secondInningsTotalWickets || 0), 0);
  }

  get leaders() {
    const records = new Map<string, any>();
    this.tournamentMatches.forEach((match) => {
      (match.innings || []).forEach((innings: any) => {
        Object.entries(innings.playerStats || {}).forEach(([id, stats]: [string, any]) => {
          const player = records.get(id) || { id, name: stats.playerName || 'Unknown Player', photo: stats.playerPhoto || '', runs: 0, wickets: 0, balls: 0, conceded: 0, motm: 0 };
          player.runs += Number(stats.runs || 0);
          player.wickets += Number(stats.wickets || 0);
          player.balls += Number(stats.ballsDelivered || 0);
          player.conceded += Number(stats.runsConceded || 0);
          records.set(id, player);
        });
      });
      if (match.motm?.playerId) {
        const player = records.get(match.motm.playerId) || { id: match.motm.playerId, name: match.motm.playerName, photo: match.motm.playerPhoto || '', runs: 0, wickets: 0, balls: 0, conceded: 0, motm: 0 };
        player.motm++;
        records.set(match.motm.playerId, player);
      }
    });
    const all = [...records.values()];
    return {
      runs: [...all].filter((player) => player.runs).sort((a, b) => b.runs - a.runs).slice(0, 3),
      wickets: [...all].filter((player) => player.wickets).sort((a, b) => b.wickets - a.wickets || this.economy(a) - this.economy(b)).slice(0, 3),
      economy: [...all].filter((player) => player.balls >= 6).sort((a, b) => this.economy(a) - this.economy(b)).slice(0, 3),
      motm: [...all].filter((player) => player.motm).sort((a, b) => b.motm - a.motm).slice(0, 3),
    };
  }

  get availableAuctionPlayers() {
    const selected = new Set([...(this.tournament?.teamAPlayers || []), ...(this.tournament?.teamBPlayers || [])].map((player) => player.id));
    return this.players.filter((player) => player.id && !selected.has(player.id));
  }

  status() {
    if (!this.tournament) return '';
    if (this.isComplete) return 'Completed';
    const today = this.localDateKey(new Date());
    return this.tournament.date > today ? 'Upcoming' : this.tournament.date < today ? 'Awaiting results' : 'Match day';
  }

  async addAuctionPlayer(player: Player) {
    if (!this.tournament?.id || !player.id || this.savingAuction) return;
    const key = this.auctionTeam === 'A' ? 'teamAPlayers' : 'teamBPlayers';
    const roster = [...this.tournament[key]];
    if (roster.length >= 6) {
      this.error = 'Each auction squad can have a maximum of 6 players.';
      return;
    }
    this.savingAuction = true;
    this.error = '';
    const entry: AuctionPlayer = { id: player.id, displayName: player.displayName, photoURL: player.photoURL || '', price: Number(this.auctionPrice || 0) };
    try {
      await this.tournamentService.updateTournament(this.tournament.id, { [key]: [...roster, entry] });
      this.auctionPrice = 0;
    } catch {
      this.error = 'Auction player could not be saved.';
    } finally {
      this.savingAuction = false;
    }
  }

  async removeAuctionPlayer(team: 'A' | 'B', playerId: string) {
    if (!this.tournament?.id) return;
    const key = team === 'A' ? 'teamAPlayers' : 'teamBPlayers';
    await this.tournamentService.updateTournament(this.tournament.id, { [key]: this.tournament[key].filter((player) => player.id !== playerId) });
  }

  startTournamentMatch(type: 'limited' | 'unlimited') {
    if (!this.tournament?.id) return;
    this.matchSetup.setTournamentContext(this.tournament.id);
    this.router.navigate([`/${type}/welcome`]);
  }

  economy(player: any) {
    return player.balls ? player.conceded / (player.balls / 6) : Infinity;
  }

  formatOvers(balls: number) {
    return `${Math.floor(balls / 6)}.${balls % 6}`;
  }

  formatDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private localDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
