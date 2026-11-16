import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchService } from '../../services/matchService/match-service';
import { MatchSetupService } from '../../services/MatchSetup/match-setup-service';
import { Player } from '../../shared/models/player.model';
import { SeoService } from '../../seoService/seo-service';

@Component({
  selector: 'app-scorecard',
  imports: [RouterLink],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css',
})
export class Scorecard implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private cdr: ChangeDetectorRef,
    private seoService: SeoService
  ) { }

  matchData: any = [];
  selectedInnings: any;
  Object = Object;
  captainA: Player | null = null;
  captainB: Player | null = null;
  loading = false;
  isSquadsDialogOpen = false;
  isCommentaryOpen = false;
  commentaryByInnings: Record<number, any[]> = {};

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.loading = true;

    try {
      const id = this.route.snapshot.paramMap.get('id');

      if (id) {
        this.matchService.getMatchById(id).subscribe((data) => {
          this.matchData = data;
          console.log(data)
          this.selectedInnings = this.matchData?.innings?.[0] ?? null;
          this.getCaptains();
          this.buildCommentary();
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    } catch (e) {
      this.loading = false;
      console.log(e);
    }
  }

  openSquadsDialog() {
    this.isSquadsDialogOpen = true;
  }

  closeSquadsDialog() {
    this.isSquadsDialogOpen = false;
  }


  private getSelectedInningsDeliveries(): any[] {
    const inningNumber = Number(this.selectedInnings?.inning);

    return (this.matchData?.deliveries || []).filter(
      (delivery: any) => Number(delivery.innings) === inningNumber
    );
  }

  private getTeamContainingPlayer(playerId: string): Player[] {
    if (!playerId) return [];

    const teamA: Player[] = this.matchData?.teamA || [];
    const teamB: Player[] = this.matchData?.teamB || [];

    if (teamA.some(player => player.id === playerId)) {
      return teamA;
    }

    if (teamB.some(player => player.id === playerId)) {
      return teamB;
    }

    return [];
  }

  getDidNotBatPlayers(): Player[] {
    const deliveries = this.getSelectedInningsDeliveries();

    if (!deliveries.length) return [];

    const firstDelivery = deliveries[0];

    const battingTeam = this.getTeamContainingPlayer(
      firstDelivery.batsmanId
    );

    const battedIds = new Set<string>(
      deliveries
        .map((delivery: any) => delivery.batsmanId)
        .filter(Boolean)
    );

    // Also account for players who were selected to bat
    // but have no delivery record.
    const stats = this.selectedInnings?.playerStats || {};

    Object.entries(stats).forEach(([playerId, value]: [string, any]) => {
      if (
        value.innings > 0 ||
        value.dismissalType ||
        value.runs > 0 ||
        value.ballsFaced > 0
      ) {
        battedIds.add(playerId);
      }
    });

    return battingTeam.filter(
      player => player.id && !battedIds.has(player.id)
    );
  }

  getDidNotBowlPlayers(): Player[] {
    const deliveries = this.getSelectedInningsDeliveries();

    if (!deliveries.length) return [];

    const firstDelivery = deliveries[0];

    const bowlingTeam = this.getTeamContainingPlayer(
      firstDelivery.bowlerId
    );

    const bowledIds = new Set<string>(
      deliveries
        .map((delivery: any) => delivery.bowlerId)
        .filter(Boolean)
    );

    // Include anyone with recorded bowling activity.
    const stats = this.selectedInnings?.playerStats || {};

    Object.entries(stats).forEach(([playerId, value]: [string, any]) => {
      if (
        value.ballsDelivered > 0 ||
        value.wides > 0 ||
        value.noBalls > 0 ||
        value.runsConceded > 0 ||
        value.wickets > 0
      ) {
        bowledIds.add(playerId);
      }
    });

    return bowlingTeam.filter(
      player => player.id && !bowledIds.has(player.id)
    );
  }


  totalExtras(wide: any, noBall: any) {
    const wides = Number(wide || 0);
    const noBalls = Number(noBall || 0);
    return wides + noBalls;
  }


  buildCommentary() {
    const players: Player[] = [
      ...(this.matchData?.teamA || []),
      ...(this.matchData?.teamB || [])
    ];

    const playerNames = new Map<string, string>();

    players.forEach(player => {
      if (player.id) {
        playerNames.set(player.id, player.displayName);
      }
    });

    const deliveries = [
      ...(this.matchData?.deliveries || [])
    ].sort(
      (a: any, b: any) =>
        Number(a.deliveryNumber || 0) -
        Number(b.deliveryNumber || 0)
    );

    const grouped: Record<number, any[]> = {};

    deliveries.forEach((delivery: any) => {
      const innings = Number(delivery.innings || 1);

      if (!grouped[innings]) {
        grouped[innings] = [];
      }

      const overNumber = Number(delivery.overNumber);
      const ballNumber = Number(delivery.ballNumber);

      // Stored overNumber starts at 1.
      // Cricket notation starts at 0.
      const overLabel =
        overNumber > 0 && ballNumber > 0
          ? `${overNumber - 1}.${ballNumber}`
          : '-';

      grouped[innings].push({
        ...delivery,
        overLabel,
        bowlerName:
          playerNames.get(delivery.bowlerId) || 'Unknown Bowler',
        batterName:
          playerNames.get(delivery.batsmanId) || 'Unknown Batter',
        commentary: this.getDeliveryCommentary(delivery, playerNames)
      });
    });

    this.commentaryByInnings = grouped;
  }

  getDeliveryCommentary(
    delivery: any,
    playerNames: Map<string, string>
  ): string {

    const type = String(delivery.type || '').toLowerCase();
    const batterRuns = Number(delivery.batterRuns || 0);
    const totalRuns = Number(delivery.totalRuns || 0);

    // WICKET
    if (delivery.wicket || type === 'wicket') {

      const dismissal = String(
        delivery.dismissalType || ''
      ).toLowerCase();

      switch (dismissal) {
        case 'bowled':
          return 'WICKET! Bowled';

        case 'caught': {
          const catcher = playerNames.get(delivery.caughtById);

          return catcher
            ? `WICKET! Caught by ${catcher}`
            : 'WICKET! Caught';
        }

        case 'offside':
          return 'WICKET! Offside';

        case 'retired-out':
          return 'Retired Out';

        case 'retired-hurt':
          return 'Retired Hurt';

        default:
          return 'WICKET!';
      }
    }

    // COMMON DELIVERY TYPES
    switch (type) {

      case 'dot':
        return 'Dot Ball';

      case 'four':
        return 'FOUR!';

      case 'six':
        return 'SIX!';

      case 'wide':
        return 'Wide Ball';

      case 'noball':
        if (batterRuns === 4) return 'No Ball + Four';
        if (batterRuns === 6) return 'No Ball + Six';

        return 'No Ball';
    }

    // RUNS
    if (batterRuns === 1) return '1 Run';
    if (batterRuns === 2) return '2 Runs';
    if (batterRuns === 3) return '3 Runs';
    if (batterRuns === 4) return 'FOUR!';
    if (batterRuns === 6) return 'SIX!';

    if (batterRuns > 0) {
      return `${batterRuns} Runs`;
    }

    if (totalRuns > 0) {
      return `${totalRuns} Extra Runs`;
    }

    return delivery.legalBall ? 'Dot Ball' : 'Extra';
  }

  toggleCommentary() {
    this.isCommentaryOpen = !this.isCommentaryOpen;
  }


  getPlayers(playerStats: any): any[] {
    return Object.entries(playerStats || {}).map(([id, player]: any) => ({
      id,
      ...player,
    }));
  }

  setInnings(index: number) {
    this.selectedInnings = this.matchData.innings[index];
  }

  getOvers(balls: number): string {
    const overs = Math.floor(balls / 6);
    const deliveries = balls % 6;

    return `${overs}.${deliveries}`;
  }


  getBatters(playerStats: any) {
    return Object.values(playerStats || {}).filter(
      (player: any) => player.ballsFaced > 0 || player.dismissalType,
    );
  }

  getBowlers(playerStats: any) {
    return Object.values(playerStats || {}).filter((player: any) => player.ballsDelivered > 0);
  }

  getCaptains() {
    this.captainA = this.matchData.teamACaptain;
    this.captainB = this.matchData.teamBCaptain;
  }

  getDismissalText(player: any): string {
    if (!player.dismissalType) {
      return 'Not Out';
    }

    if (player.dismissalType === 'caught') {
      if (player.caughtBy.displayName === player.dismissedBy) {
        return `c & b ${player.dismissedBy}`;
      }

      return `c ${player.caughtBy.displayName} b ${player.dismissedBy}`;
    }

    if (player.dismissalType === 'bowled') {
      return `b ${player.dismissedBy}`;
    }

    if (player.dismissalType === 'offside') {
      return `offside b ${player.dismissedBy}`;
    }

    if (player.dismissalType === 'retired-hurt') {
      return 'Retired Hurt';
    }

    if (player.dismissalType === 'retired-out') {
      return 'Retired Out';
    }

    return player.dismissalType;
  }
}
