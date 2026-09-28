import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatchService } from '../services/matchService/match-service';

type TournamentPlayer = {
  playerId: string;
  playerName: string;
  playerPhoto: string;
  runs: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  motmAwards: number;
};

@Component({
  selector: 'app-tournament',
  imports: [FormsModule, RouterLink],
  templateUrl: './tournament.html',
  styleUrl: './tournament.css',
})
export class Tournament implements OnInit, OnDestroy {
  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  private matchesSubscription?: Subscription;
  matches: any[] = [];
  selectedDate = '';
  loading = true;
  tournamentPlayers: TournamentPlayer[] = [];

  ngOnInit() {
    this.matchesSubscription = this.matchService.retrieveMatches().subscribe({
      next: (matches: any[]) => {
        this.matches = matches || [];
        if (!this.selectedDate && this.matches.length) {
          this.selectedDate = this.dateKey(this.matches[0].createdAt);
        }
        this.updateTournament();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy() {
    this.matchesSubscription?.unsubscribe();
  }

  get availableDates(): string[] {
    return [...new Set(this.matches.map((match) => this.dateKey(match.createdAt)))].sort((a, b) => b.localeCompare(a));
  }

  get tournamentMatches(): any[] {
    return this.matches.filter((match) => this.dateKey(match.createdAt) === this.selectedDate);
  }

  get totalRuns(): number {
    return this.tournamentMatches.reduce(
      (total, match) => total + Number(match.innings?.[0]?.firstInningsTotalRuns || 0) + Number(match.innings?.[1]?.secondInningsTotalRuns || 0),
      0,
    );
  }

  get totalWickets(): number {
    return this.tournamentMatches.reduce(
      (total, match) => total + Number(match.innings?.[0]?.firstInningsTotalWickets || 0) + Number(match.innings?.[1]?.secondInningsTotalWickets || 0),
      0,
    );
  }

  get topRunScorers(): TournamentPlayer[] {
    return [...this.tournamentPlayers].filter((player) => player.runs > 0).sort((a, b) => b.runs - a.runs || b.wickets - a.wickets).slice(0, 5);
  }

  get topWicketTakers(): TournamentPlayer[] {
    return [...this.tournamentPlayers].filter((player) => player.wickets > 0).sort((a, b) => b.wickets - a.wickets || this.economy(a) - this.economy(b)).slice(0, 5);
  }

  get bestEconomies(): TournamentPlayer[] {
    return [...this.tournamentPlayers]
      .filter((player) => player.ballsBowled >= 6)
      .sort((a, b) => this.economy(a) - this.economy(b) || b.wickets - a.wickets || b.ballsBowled - a.ballsBowled)
      .slice(0, 5);
  }

  get mostMotm(): TournamentPlayer[] {
    return [...this.tournamentPlayers].filter((player) => player.motmAwards > 0).sort((a, b) => b.motmAwards - a.motmAwards || b.runs - a.runs || b.wickets - a.wickets).slice(0, 5);
  }

  onDateChange() {
    this.updateTournament();
  }

  updateTournament() {
    const players = new Map<string, TournamentPlayer>();
    this.tournamentMatches.forEach((match) => {
      (match.innings || []).forEach((innings: any) => {
        Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: [string, any]) => {
          const player = this.getOrCreatePlayer(players, playerId, stats);
          player.runs += Number(stats.runs || 0);
          player.wickets += Number(stats.wickets || 0);
          player.ballsBowled += Number(stats.ballsDelivered || 0);
          player.runsConceded += Number(stats.runsConceded || 0);
        });
      });
      if (match.motm?.playerId) {
        this.getOrCreatePlayer(players, match.motm.playerId, match.motm).motmAwards++;
      }
    });
    this.tournamentPlayers = [...players.values()];
  }

  getOrCreatePlayer(players: Map<string, TournamentPlayer>, playerId: string, stats: any): TournamentPlayer {
    const existing = players.get(playerId);
    if (existing) return existing;
    const player: TournamentPlayer = {
      playerId,
      playerName: stats.playerName || 'Unknown Player',
      playerPhoto: stats.playerPhoto || '',
      runs: 0,
      wickets: 0,
      ballsBowled: 0,
      runsConceded: 0,
      motmAwards: 0,
    };
    players.set(playerId, player);
    return player;
  }

  economy(player: TournamentPlayer): number {
    return player.ballsBowled ? player.runsConceded / (player.ballsBowled / 6) : Number.POSITIVE_INFINITY;
  }

  formatOvers(balls: number): string {
    return `${Math.floor(balls / 6)}.${balls % 6}`;
  }

  formatDate(date: string): string {
    if (!date) return 'Choose a date';
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getMatchTime(timestamp: any): string {
    return this.asDate(timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  dateKey(timestamp: any): string {
    const date = this.asDate(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private asDate(timestamp: any): Date {
    if (timestamp?.toDate) return timestamp.toDate();
    if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  }
}
