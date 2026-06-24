import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchService } from '../services/matchService/match-service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-rankings',
  imports: [RouterLink],
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
  isBattingRanking = false
  isBowlingRanking = false
  isEconomyRanking = false
  isExtraRanking = false
  isOtherRanking = false

  ngOnInit() {
    this.rankingType = this.route.snapshot.paramMap.get('type') || '';
    this.setTitle();
    this.CheckRankingCategory()
    this.getRankings();
  }

  getRankings() {
    this.loading = true
    this.matchService.retrieveMatches().subscribe((matches: any[]) => {
      this.aggregateCareerStats(matches);
      this.loading = false
      // console.log(matches)
    });
  }

  CheckRankingCategory() {

    this.isBattingRanking = false;
    this.isBowlingRanking = false;
    this.isOtherRanking = false;

    if (
      [
        'runs',
        'fours',
        'sixes',
        'fifties',
        'hundreds',
        'strike-rate',
        'batting-average',
        'highest-score'
      ].includes(this.rankingType)
    ) {

      this.isBattingRanking = true;

    }
    else if (
      [
        'wickets',
        'bowling-average',
        'best-figures',
        'five-fers',
        'hat-tricks',
      ].includes(this.rankingType)
    ) {

      this.isBowlingRanking = true;

    }
    else if (['economy'].includes(this.rankingType)) {
      this.isEconomyRanking = true
    }
    else if (
      [
        'wides',
        'no-balls',
      ].includes(this.rankingType)
    ) {
      this.isExtraRanking = true
    }
    else {
      this.isOtherRanking = true;
    }
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

      case 'wides':
        this.title = 'Most Wides Given'
        break

      case 'no-balls':
        this.title = 'Most No Balls Given'
        break

      default:
        this.title = 'Rankings';
    }
  }

  aggregateCareerStats(matches: any[]) {
    this.loading = true
    this.careerStats = {};

    matches.forEach((match: any) => {

      const matchPlayers = new Set<string>();

      match.innings.forEach((innings: any) => {
        Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: any) => {

          matchPlayers.add(playerId);

          if (!this.careerStats[playerId]) {
            this.careerStats[playerId] = {
              playerId,

              playerName: stats.playerName,

              playerPhoto: stats.playerPhoto,

              totalMatches: 0,

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

              totalHattricks: 0,

              totalWides: 0,

              totalNoBalls: 0
            };
          }


          this.careerStats[playerId].totalRuns += stats.runs || 0;

          this.careerStats[playerId].totalWickets += stats.wickets || 0;


          this.careerStats[playerId].totalInnings += stats.innings || 0;

          this.careerStats[playerId].totalWides += stats.wides || 0;

          this.careerStats[playerId].totalNoBalls += stats.noBalls || 0;

          this.careerStats[playerId].totalRunsConceded += stats.runsConceded || 0;

          this.careerStats[playerId].dismissed += stats.dismissalType ? 1 : 0;

          this.careerStats[playerId].totalBallsFaced += stats.ballsFaced || 0;

          this.careerStats[playerId].totalBallsBowled += stats.ballsDelivered || 0;

          this.careerStats[playerId].totalFours += stats.fours || 0;

          this.careerStats[playerId].totalSixes += stats.sixes || 0;

          this.careerStats[playerId].totalFifties += stats.fifty || 0;

          this.careerStats[playerId].totalHundreds += stats.hundred || 0;

          this.careerStats[playerId].totalHattricks += stats.hatTricks || 0;

          this.careerStats[playerId].totalFiveFers += stats.fifer || 0;


          if (stats.caughtBy?.id) {
            const catcherId = stats.caughtBy.id;

            if (this.careerStats[catcherId]) {
              this.careerStats[catcherId].totalCatches++;
            }
          }

          this.careerStats[playerId].highestScore =
            Math.max(
              this.careerStats[playerId].highestScore,
              stats.runs || 0
            );


          this.getBestFigures(stats, playerId)



        });

      }
      );





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

      matchPlayers.forEach((playerId: any) => {
        this.careerStats[playerId].totalMatches++;
      });

    });



    this.players = Object.values(this.careerStats);

    this.sortPlayers();
    this.loading = false
    this.cdr.detectChanges();
  }

  convertToOvers(totalDeliveries: number) {

    const overs = Math.floor(totalDeliveries / 6);
    const balls = totalDeliveries % 6;

    return `${overs}.${balls}`;
  }

  sortPlayers() {
    switch (this.rankingType) {
      case 'runs':
        this.players.sort(
          (a: any, b: any) => b.totalRuns - a.totalRuns || a.totalInnings - b.totalInnings || this.getStrikeRate(b) - this.getStrikeRate(a),
        );

        break;

      case 'wickets':
        this.players.sort(
          (a: any, b: any) => b.totalWickets - a.totalWickets || this.getEconomy(a) - this.getEconomy(b)
        );

        break;

      case 'fours':
        this.players.sort(
          (a: any, b: any) => b.totalFours - a.totalFours || a.totalInnings - b.totalInnings || b.totalRuns - a.totalRuns || this.getStrikeRate(b) - this.getStrikeRate(a),
        );

        break;

      case 'sixes':
        this.players.sort(
          (a: any, b: any) => b.totalSixes - a.totalSixes || a.totalInnings - b.totalInnings || b.totalRuns - a.totalRuns || this.getStrikeRate(b) - this.getStrikeRate(a),
        );

        break;

      case 'wides':
        this.players.sort(
          (a: any, b: any) => b.totalWides - a.totalWides || a.totalMatches - b.totalMatches || b.totalRunsConceded - a.totalRunsConceded,
        );

        break;

      case 'no-balls':
        this.players.sort(
          (a: any, b: any) => b.totalNoBalls - a.totalNoBalls || a.totalMatches - b.totalMatches || b.totalRunsConceded - a.totalRunsConceded,
        );

        break;

      case 'fifties':

        this.players = this.players.filter(
          (player) => player.totalFifties > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.totalFifties - a.totalFifties ||
            a.totalInnings - b.totalInnings ||
            this.getBattingAverage(b) - this.getBattingAverage(a),
        );

        break;


      case 'hundreds':

        this.players = this.players.filter(
          (player) => player.totalHundreds > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.totalHundreds - a.totalHundreds ||
            a.totalInnings - b.totalInnings ||
            this.getBattingAverage(b) - this.getBattingAverage(a),
        );

        break;

      case 'mvp':
        this.players.sort(
          (a: any, b: any) => b.totalMotm - a.totalMotm || a.totalMatches - b.totalMatches || a.totalInnings - b.totalInnings || b.totalRuns - a.totalRuns || b.totalWickets - a.totalWickets,
        );

        break;

      case 'catches':
        this.players.sort(
          (a: any, b: any) => b.totalCatches - a.totalCatches || a.totalMatches - b.totalMatches || this.getBowlingAverage(a) - this.getBowlingAverage(b) || this.getEconomy(a) - this.getEconomy(b),
        );

        break;

      case 'strike-rate':
        this.players = this.players.filter((player) => player.totalBallsFaced >= 30);

        this.players.sort(
          (a: any, b: any) =>
            this.getStrikeRate(b) - this.getStrikeRate(a) || b.totalInnings - a.totalInnings || b.totalBallsFaced - a.totalBallsFaced || b.totalRuns - a.totalRuns,
        );

        break;

      case 'economy':
        this.players = this.players.filter((player) => player.totalBallsBowled >= 30);
        this.players.sort((a: any, b: any) => this.getEconomy(a) - this.getEconomy(b) || this.getBowlingAverage(a) - this.getBowlingAverage(b) || b.totalBallsBowled - a.totalBallsBowled || a.totalRunsConceded - b.totalRunsConceded);
        break;

      case 'batting-average':
        this.players = this.players.filter((player) => player.totalBallsFaced >= 30);

        this.players.sort(
          (a: any, b: any) =>
            this.getBattingAverage(b) - this.getBattingAverage(a) || b.totalInnings - a.totalInnings || b.totalBallsFaced - a.totalBallsFaced || b.totalRuns - a.totalRuns,
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
            this.getBowlingAverage(a) - this.getBowlingAverage(b) || this.getEconomy(a) - this.getEconomy(b) || b.totalBallsBowled - a.totalBallsBowled ||
            a.totalRunsConceded - b.totalRunsConceded
        );
        break;

      case 'highest-score':
        this.players = this.players.filter(
          (player) => player.highestScore > 0
        );
        
        this.players.sort(
          (a: any, b: any) =>
            b.highestScore - a.highestScore ||
            a.totalInnings - b.totalInnings ||
            b.totalRuns - a.totalRuns ||
            this.getBattingAverage(b) - this.getBattingAverage(a)
        );
        break;

      case 'best-figures':
        this.players = this.players.filter(
          (player) => player.totalWickets > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.bestFiguresWickets - a.bestFiguresWickets ||
            a.bestFiguresRuns - b.bestFiguresRuns ||
            this.getEconomy(a) - this.getEconomy(b) ||
            this.getBowlingAverage(a) - this.getBowlingAverage(b)
        );

        break;

      case 'five-fers':
        this.players = this.players.filter(
          (player) => player.totalFiveFers > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.totalFiveFers - a.totalFiveFers || b.totalWickets - a.totalWickets || this.getEconomy(a) - this.getEconomy(b)
        );

        break;

      case 'hat-tricks':
        this.players = this.players.filter(
          (player) => player.totalHattricks > 0
        );

        this.players.sort(
          (a: any, b: any) =>
            b.totalHattricks - a.totalHattricks ||
            b.totalWickets - a.totalWickets || this.getEconomy(a) - this.getEconomy(b)
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

      case 'wides':
        return player.totalWides;

      case 'no-balls':
        return player.totalNoBalls;

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
