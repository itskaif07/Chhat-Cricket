import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/matchService/match-service';
import { MatchSetupService } from '../../services/MatchSetup/match-setup-service';
import { Player } from '../../shared/models/player.model';

@Component({
  selector: 'app-scorecard',
  imports: [],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css',
})
export class Scorecard implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private cdr: ChangeDetectorRef,
  ) {}

  matchData: any = [];
  selectedInnings: any;
  Object = Object;
  captainA: Player | null = null;
  captainB: Player | null = null;
  loading = false;

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

          // console.log(data);
          this.selectedInnings = this.matchData.innings[0];

          this.getCaptains();
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    } catch (e) {
      this.loading = false;
      console.log(e);
    }
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
      return `b ${player.dismissedBy}`;
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
