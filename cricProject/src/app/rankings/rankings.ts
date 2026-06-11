import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/matchService/match-service';

@Component({
  selector: 'app-rankings',
  imports: [],
  templateUrl: './rankings.html',
  styleUrl: './rankings.css',
})
export class Rankings implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private cdr: ChangeDetectorRef,
  ) { }

  rankingType: string = '';
  title = '';
  valueField = '';
  players: any[] = [];
  careerStats: any = {};
  loading: boolean = false

  ngOnInit() {
    this.rankingType = this.route.snapshot.paramMap.get('type') || '';
    this.setTitle();
    this.getRankings();
  }

  getRankings() {
    this.loading = true
    this.matchService.retrieveMatches().subscribe((matches: any[]) => {
      this.aggregateCareerStats(matches);
      this.loading = false
      console.log(matches)
    });
  }

  setTitle() {
    switch (this.rankingType) {
      case 'runs':
        this.title = 'Most Runs';
        break;

      case 'wickets':
        this.title = 'Most Wickets';
        break;

      case 'mvp':
        this.title = 'Most MVP Awards';
        break;


      case 'fours':
        this.title = 'Fours';
        break;


      case 'sixes':
        this.title = 'Sixes';
        break;

      case 'fifties':
        this.title = 'Half-Centuries';
        break;

      case 'hundreds':
        this.title = 'Tons';
        break;

      case 'catches':
        this.title = 'Most Catches';
        break;

      case 'strike-rate':
        this.title = 'Strike Rate';
        break;

      case 'economy':
        this.title = 'Economy';
        break;

      case 'batting-average':
        this.title = 'Batting Average';
        break;

      case 'bowling-average':
        this.title = 'Bowling Average'
        break

      case 'highest-score':
        this.title = 'Highest Score'
        break

      case 'best-figures':
        this.title = 'Best Figures'
        break

      case 'five-fers':
        this.title = 'Five Wicket Hauls'
        break

      case 'hat-tricks':
        this.title = 'Hat-tricks'
        break

      default:
        this.title = 'Rankings';
    }
  }

  aggregateCareerStats(matches: any[]) {
    this.loading = true
    this.careerStats = {};
    const highestScores: any = {};

    matches.forEach((match: any) => {
      match.innings.forEach((innings: any) => {
        Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: any) => {
          if (!this.careerStats[playerId]) {
            this.careerStats[playerId] = {
              playerId,

              playerName: stats.playerName,

              playerPhoto: stats.playerPhoto,

              totalRuns: 0,

              totalWickets: 0,

              totalInnings: 0,

              totalCatches: 0,

              totalMotm: 0,

              totalBallsFaced: 0,

              totalBallsBowled: 0,

              totalRunsConceded: 0,

              dismissed: 0,

              totalFours: 0,

              totalSixes: 0,

              totalFifties: 0,

              totalHundreds: 0,

              highestScore: 0,

              bestFiguresWickets: 0,

              bestFiguresRuns: 999,

              totalFiveFers: 0,

              totalHattricks: 0
            };
          }

          this.careerStats[playerId].totalRuns += stats.runs || 0;

          this.careerStats[playerId].totalWickets += stats.wickets || 0;

          this.careerStats[playerId].totalInnings += stats.innings || 0;

          this.careerStats[playerId].totalCatches += stats.caughtBy ? 1 : 0 || 0;

          this.careerStats[playerId].totalRunsConceded += stats.runsConceded || 0;

          this.careerStats[playerId].dismissed += stats.dismissalType ? 1 : 0;

          this.careerStats[playerId].totalBallsFaced += stats.ballsFaced || 0;

          this.careerStats[playerId].totalBallsBowled += stats.ballsDelivered || 0;

          this.careerStats[playerId].totalFours += stats.fours || 0;

          this.careerStats[playerId].totalSixes += stats.sixes || 0;

          this.careerStats[playerId].totalFifties += stats.fifty || 0;

          this.careerStats[playerId].totalHundreds += stats.hundred || 0;

          this.careerStats[playerId].totalHattricks += stats.hatTricks || 0;

          this.careerStats[playerId].highestScore =
            Math.max(
              this.careerStats[playerId].highestScore,
              stats.runs || 0
            );

          this.getBestFigures(stats, playerId)

          this.careerStats[playerId].totalFiveFers += stats.fifer || 0;



        });
      });

      



      const motmPlayerId =
        match.motm?.playerId;

      if (
        motmPlayerId &&
        this.careerStats[motmPlayerId]
      ) {

        this.careerStats[
          motmPlayerId
        ].totalMotm++;

      }

    });



    this.players = Object.values(this.careerStats);

    this.sortPlayers();
    this.loading = false
    this.cdr.detectChanges();
  }

  sortPlayers() {
    switch (this.rankingType) {
      case 'runs':
        this.players.sort(
          (a: any, b: any) => b.totalRuns - a.totalRuns || a.totalInnings - b.totalInnings,
        );

        break;

      case 'wickets':
        this.players.sort(
          (a: any, b: any) => b.totalWickets - a.totalWickets || a.totalInnings - b.totalInnings,
        );

        break;

      case 'fours':
        this.players.sort(
          (a: any, b: any) => b.totalFours - a.totalFours || a.totalInnings - b.totalInnings,
        );

        break;

      case 'sixes':
        this.players.sort(
          (a: any, b: any) => b.totalSixes - a.totalSixes || a.totalInnings - b.totalInnings,
        );

        break;

      case 'fifties':
        this.players.sort(
          (a: any, b: any) => b.totalFifties - a.totalFifties || a.totalInnings - b.totalInnings,
        );

        break;

      case 'hundreds':
        this.players.sort(
          (a: any, b: any) => b.totalHundreds - a.totalHundreds || a.totalInnings - b.totalInnings,
        );

        break

      case 'mvp':
        this.players.sort(
          (a: any, b: any) => b.totalMotm - a.totalMotm || a.totalInnings - b.totalInnings || b.totalRuns - a.totalRuns || b.totalWickets - a.totalWickets,
        );

        break;

      case 'catches':
        this.players.sort(
          (a: any, b: any) => b.totalCatches - a.totalCatches || a.totalInnings - b.totalInnings,
        );

        break;

      case 'strike-rate':
        this.players = this.players.filter((player) => player.totalBallsFaced >= 30);

        this.players.sort(
          (a: any, b: any) =>
            this.getStrikeRate(b) - this.getStrikeRate(a) || b.totalBallsFaced - a.totalBallsFaced || b.totalInnings - a.totalInnings || b.totalRuns - a.totalRuns,
        );

        break;

      case 'economy':
        this.players = this.players.filter((player) => player.totalBallsBowled >= 30);
        this.players.sort((a: any, b: any) => this.getEconomy(a) - this.getEconomy(b) || b.totalBallsBowled - a.totalBallsBowled   || a.totalRunsConceded - b.totalRunsConceded);
        break;

      case 'batting-average':
        this.players = this.players.filter((player) => player.totalBallsFaced >= 30);

        this.players.sort(
          (a: any, b: any) =>
            this.getBattingAverage(b) - this.getBattingAverage(a) || b.totalBallsFaced - a.totalBallsFaced || b.totalInnings - a.totalInnings || b.totalRuns - a.totalRuns,
        );

        break;

      case 'bowling-average':
        this.players = this.players.filter(
          (player) =>
            player.totalBallsBowled >= 30 &&
            player.totalWickets > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            this.getBowlingAverage(a) - this.getBowlingAverage(b) || b.totalBallsBowled - a.totalBallsBowled ||
            a.totalRunsConceded - b.totalRunsConceded
        );
        break;

      case 'highest-score':
        this.players.sort(
          (a: any, b: any) =>
            b.highestScore - a.highestScore ||
            b.totalRuns - a.totalRuns ||
            a.totalInnings - b.totalInnings
        );
        break;

      case 'best-figures':
        this.players = this.players.filter(
          (player) => player.totalWickets > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.bestFiguresWickets - a.bestFiguresWickets ||
            a.bestFiguresRuns - b.bestFiguresRuns
        );

        break;

      case 'five-fers':
        this.players = this.players.filter(
          (player) => player.totalFiveFers > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.totalFiveFers - a.totalFiveFers || a.totalInnings - b.totalInnings ||
            b.totalWickets - a.totalWickets
        );

        break;

      case 'hat-tricks':
        this.players = this.players.filter(
          (player) => player.totalHattricks > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.totalHattricks - a.totalHattricks || a.totalInnings - b.totalInnings ||
            b.totalWickets - a.totalWickets
        );

        break;
    }
  }

  getStrikeRate(player: any) {
    if (!player.totalBallsFaced) return 0;

    return (player.totalRuns / player.totalBallsFaced) * 100;
  }

  getEconomy(player: any) {
    if (!player.totalBallsBowled) return 0;

    return player.totalRunsConceded / (player.totalBallsBowled / 6);
  }

  getBattingAverage(player: any) {
    if (!player.dismissed) return player.totalRuns;

    return player.totalRuns / player.dismissed;
  }

  getBowlingAverage(player: any) {
    if (!player.totalWickets) return 0;

    return player.totalRunsConceded / player.totalWickets;
  }

  getBestFigures(stats: any, playerId: any) {
    const currentWickets = stats.wickets || 0;
    const currentRuns = stats.runsConceded || 0;

    const bestWickets =
      this.careerStats[playerId].bestFiguresWickets;

    const bestRuns =
      this.careerStats[playerId].bestFiguresRuns;

    if (
      currentWickets > bestWickets ||
      (currentWickets === bestWickets &&
        currentRuns < bestRuns)
    ) {
      this.careerStats[playerId].bestFiguresWickets =
        currentWickets;

      this.careerStats[playerId].bestFiguresRuns =
        currentRuns;
    }
  }


  getRankValue(player: any) {

    switch (this.rankingType) {

      case 'runs':
        return player.totalRuns;

      case 'wickets':
        return player.totalWickets;

      case 'fours':
        return player.totalFours

      case 'sixes':
        return player.totalSixes

      case 'fifties':
        return player.totalFifties

      case 'hundreds':
        return player.totalHundreds

      case 'mvp':
        return player.totalMotm;

      case 'catches':
        return player.totalCatches;

      case 'strike-rate':
        return this.getStrikeRate(player)
          .toFixed(2);

      case 'economy':
        return this.getEconomy(player)
          .toFixed(2);

      case 'batting-average':
        return this.getBattingAverage(player).toFixed(2)

      case 'bowling-average':
        return this.getBowlingAverage(player).toFixed(2);

      case 'highest-score':
        console.log(player.highestScore)
        return player.highestScore

      case 'best-figures':
        return `${player.bestFiguresWickets}/${player.bestFiguresRuns}`;

      case 'five-fers':
        return player.totalFiveFers

      case 'hat-tricks':
        return player.totalHattricks

      default:
        return 0;

    }

  }

}
