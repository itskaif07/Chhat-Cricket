import { Component, OnInit } from '@angular/core';
import { DismissalRankingService } from '../services/dismissalRankingService/dismissal-ranking-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dismissal-ranking',
  imports: [CommonModule],
  templateUrl: './dismissal-ranking.html',
  styleUrl: './dismissal-ranking.css',
})
export class DismissalRanking implements OnInit {

  careerStats:any = null

  constructor(
    private dismissalRankingService: DismissalRankingService
  ) { }

  ngOnInit() {
    this.careerStats =
      this.dismissalRankingService.getCareerStats();

    this.loadDismissalRanking();
  }


  dismissalTypes = [
    {
      key: 'bowled',
      label: 'BOWLED'
    },
    {
      key: 'caught',
      label: 'CAUGHT'
    },
    {
      key: 'offside',
      label: 'OFFSIDE'
    },
    {
      key: 'retired-out',
      label: 'RETIRED OUT'
    }
  ];

  selectedDismissalType:
    | 'bowled'
    | 'caught'
    | 'offside'
    | 'retired-out' = 'bowled';

  selectedDismissalLabel = 'BOWLED';

  totalDismissals = 0;

  dismissalRanking: any[] = [];

  selectDismissalType(
    type: 'bowled' | 'caught' | 'offside' | 'retired-out'
  ) {
    this.selectedDismissalType = type;

    const selected = this.dismissalTypes.find(
      item => item.key === type
    );

    this.selectedDismissalLabel = selected?.label || '';

    this.loadDismissalRanking();
  }

  loadDismissalRanking() {

    const players = Object.values(this.careerStats) as any[];

    this.totalDismissals = players.reduce(
      (total, player) =>
        total + (player.dismissals?.[this.selectedDismissalType] || 0),
      0
    );

    this.dismissalRanking = players
      .map(player => {

        const count =
          player.dismissals?.[this.selectedDismissalType] || 0;

        return {
          playerId: player.playerId,
          playerName: player.playerName,
          playerPhoto: player.playerPhoto,
          count,
          percentage:
            this.totalDismissals > 0
              ? (count / this.totalDismissals) * 100
              : 0
        };

      })
      .sort((a, b) => b.count - a.count);
  }

}
