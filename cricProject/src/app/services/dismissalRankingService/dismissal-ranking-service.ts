import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DismissalRankingService {
  private careerStats: any = {};

  setCareerStats(stats: any) {
    this.careerStats = stats;
  }

  getCareerStats() {
    return this.careerStats;
  }
}
