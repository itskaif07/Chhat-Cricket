import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';
import { collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { Router, RouterLink } from '@angular/router';
import { MatchService } from '../services/matchService/match-service';
import { Player } from '../shared/models/player.model';
import { OfflinePersistanceService } from '../services/offline-persistance/offline-persistance-service';
import { DismissalRankingService } from '../services/dismissalRankingService/dismissal-ranking-service';
import { CommonModule } from '@angular/common';
import { SeoService } from '../seoService/seo-service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  user: User | null = null;
  loading: boolean = false
  playersCount: number = 0;
  matchesCount: number = 0;
  matches: any = 0;
  totalRuns = 0;
  totalWickets = 0;
  careerStats: any = {};
  orangeCap: any;
  purpleCap: any;
  bestStrikeRate: number = 0;
  bestStrikeRatePlayer: any = null;
  bestEconomyPlayer: any = null;
  bestEconomy: number = 0;
  bestBattingAveragePlayer: any = null;
  bestBattingAverage: number = 0;
  bestBowlingAveragePlayer: any = null;
  bestBowlingAverage: number = 0;
  bestBowlingStrikeRatePlayer: any = null;
  bestBowlingStrikeRate: number = 0;
  highestScore: number = 0;
  highestScorePlayer: any = null;
  bestFiguresPlayer: any = null;
  bestFigures: string = '';
  mostFoursPlayer: any = null;
  mostFours: number = 0;
  mostSixesPlayer: any = null;
  mostSixes: number = 0;
  mostFiftiesPlayer: any = null;
  mostFifties: number = 0;
  mostHattricksPlayer: any = null;
  mosthattricks: number = 0;
  mostHundreds: number = 0;
  mostHundredsPlayer: any = null;
  mostFifers: number = 0;
  mostFifersPlayer: any = null;
  mostCatches: number = 0;
  mostCatchesPlayer: any = null;
  mostMotmPlayer: any = null;
  mostMotm: number = 0;
  mostWides: number = 0;
  mostWidesPlayer: any = null;
  mostNoBallsPlayer: any = null
  mostNoBalls: number = 0;
  mostMaidens: number = 0
  mostMaidensPlayer: any = null

  recordMode: 'personal' | 'allTime' = 'personal'

  selectedH2HBatsmanId = '';
  selectedH2HBowlerId = '';

  selectedH2HBatsman: any = null;
  selectedH2HBowler: any = null;





  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private matchService: MatchService,
    private offlinePersistence: OfflinePersistanceService,
    private dismissalRankingService: DismissalRankingService,
    private seoService: SeoService,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.setSEO()
    setTimeout(() => {
      this.retrievePlayers();
      this.retrieveMatches();
    });
  }
 

  setSEO() {
    this.seoService.setPage('Chhat Cricket | Rooftop Cricket Score & Player Stats',
      'Track rooftop cricket matches, player statistics, scorecards, match history and rankings with Chhat Cricket.',
      '/')
  }

  async retrievePlayers() {
    this.loading = true
    try {
      const playersRef = collection(this.firestore, 'players');
      const snapshot = await getDocs(playersRef);
      const players = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.playersCount = players.length;
      this.loading = false
      this.cdr.detectChanges();
    } catch (error) {
      console.log(error);
      this.loading = false
    }
  }

  startUnlimitedMatch() {
    const savedMatch = this.offlinePersistence.loadMatch<any>();

    if (savedMatch && savedMatch.matchType !== 'limited') {
      this.router.navigate(['/unlimited/live-match']);
      return;
    }

    this.router.navigate(['/unlimited/welcome']);
  }

  startLimitedMatch() {
    const savedMatch = this.offlinePersistence.loadMatch<any>();

    if (savedMatch?.matchType === 'limited') {
      this.router.navigate(['/limited/live-match']);
      return;
    }

    this.router.navigate(['/limited/welcome']);
  }

  //Platform Stats

  retrieveMatches() {
    this.loading = true
    this.matchService.retrieveMatches().subscribe((data) => {
      this.matchesCount = data.length;
      this.matches = data;
      this.aggregateTotalRuns();
      this.aggregateTotalWickets();
      this.aggregateCareerStats();
      this.loading = false
      this.cdr.detectChanges();
    });
  }

  aggregateTotalRuns() {
    this.totalRuns = 0;

    if (this.matches) {
      this.matches.forEach((match: any) => {
        match.innings.forEach((innings: any) => {
          if (innings.inning === 1) {
            this.totalRuns += innings.firstInningsTotalRuns || 0;
          }

          if (innings.inning === 2) {
            this.totalRuns += innings.secondInningsTotalRuns || 0;
          }
        });
      });
    }
  }

  aggregateTotalWickets() {
    this.totalWickets = 0;

    if (this.matches) {
      this.matches.forEach((match: any) => {
        match.innings.forEach((innings: any) => {

          Object.values(innings.playerStats || {}).forEach((stats: any) => {
            this.totalWickets += stats.wickets || 0;
          });

        });
      });
    }
  }

  // Player Stats

  aggregateCareerStats() {
    this.careerStats = {};


    this.matches.forEach((match: any) => {
      const matchPlayers = new Set<string>();
      match.innings.forEach((innings: any, i: number) => {


        Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: any) => {
          matchPlayers.add(playerId);

          if (!this.careerStats[playerId]) {
            this.careerStats[playerId] = {
              playerId,

              playerName: stats.playerName,

              playerPhoto: stats.playerPhoto,

              totalRuns: 0,

              totalInnings: 0,

              totalWickets: 0,

              totalBallsFaced: 0,

              totalMatches: 0,

              totalRunsConceded: 0,

              totalBallsDelivered: 0,

              dismissed: 0,

              dismissals: {
                bowled: 0,
                caught: 0,
                offside: 0,
                'retired-out': 0
              },

              totalFours: 0,

              totalSixes: 0,

              totalFifties: 0,

              totalHundreds: 0,

              totalHattricks: 0,

              totalFifers: 0,

              totalCatches: 0,

              totalMotm: 0,

              totalWides: 0,

              totalNoBalls: 0,

              totalMaidens: 0,

            };
          }

          if (stats.dismissalType === 'bowled') {
            this.careerStats[playerId].dismissals.bowled++;
          }

          if (stats.dismissalType === 'caught') {
            this.careerStats[playerId].dismissals.caught++;
          }

          if (stats.dismissalType === 'offside') {
            this.careerStats[playerId].dismissals.offside++;
          }

          if (stats.dismissalType === 'retired-out') {
            this.careerStats[playerId].dismissals['retired-out']++;
          }

          this.careerStats[playerId].totalRuns += stats.runs || 0;

          this.careerStats[playerId].totalWickets += stats.wickets || 0;

          this.careerStats[playerId].totalBallsFaced += stats.ballsFaced || 0;


          this.careerStats[playerId].totalInnings += stats.innings || 0;

          this.careerStats[playerId].totalRunsConceded += stats.runsConceded || 0;

          this.careerStats[playerId].totalBallsDelivered += stats.ballsDelivered || 0;

          this.careerStats[playerId].totalFours += stats.fours || 0;

          this.careerStats[playerId].totalSixes += stats.sixes || 0;

          this.careerStats[playerId].totalMaidens += stats.maiden || 0;

          this.careerStats[playerId].totalFifties += stats.fifty || 0;

          this.careerStats[playerId].totalHundreds += stats.hundred || 0;

          this.careerStats[playerId].totalHattricks += stats.hatTricks || 0;

          this.careerStats[playerId].totalFifers += stats.fifer || 0;

          this.careerStats[playerId].totalWides += stats.wides || 0;

          this.careerStats[playerId].totalNoBalls += stats.noBalls || 0;

          this.careerStats[playerId].dismissed += stats.dismissalType ? 1 : 0;

          if (stats.caughtBy?.id) {
            const catcherId = stats.caughtBy.id;

            if (this.careerStats[catcherId]) {
              this.careerStats[catcherId].totalCatches++;
            }
          }
        });
      });

      matchPlayers.forEach((playerId: string) => {
        this.careerStats[playerId].totalMatches++;
      });

      if (match.motm?.playerId) {
        const motmId = match.motm.playerId;

        if (this.careerStats[motmId]) {
          this.careerStats[motmId].totalMotm = (this.careerStats[motmId].totalMotm || 0) + 1;
        }
      }



      this.dismissalRankingService.setCareerStats(this.careerStats)
    }
    );

    this.updateDismissalSummary()
    this.getOrangeCap();
    this.getPurpleCap();
    this.getStrikeRate();
    this.getEconomy();
    this.getBattingAverage();
    this.getBowlingAverage();
    this.getBowlingStrikeRate()
    this.getHighestScore();
    this.getBestFigures();
    this.getMostFours();
    this.getMostSixes();
    this.getMostFifties();
    this.getMostHattricks();
    this.getMostHundreds();
    this.getMostFifers();
    this.getMostCatches();
    this.getMostMotm();
    this.getMostWides()
    this.getMostNoBalls()
    this.getMostMaidens()
    this.cdr.detectChanges();
  }

  getOrangeCap() {
    this.orangeCap = Object.values(this.careerStats).sort(
      (a: any, b: any) => b.totalRuns - a.totalRuns,
    )[0];
  }

  getPurpleCap() {
    this.purpleCap = Object.values(this.careerStats).sort(
      (a: any, b: any) => b.totalWickets - a.totalWickets,
    )[0];
  }

  getStrikeRate() {
    const MIN_BALLS = 30;

    const players = Object.values(this.careerStats).filter(
      (player: any) => player.totalBallsFaced >= MIN_BALLS
    );

    if (players.length === 0) {
      this.bestStrikeRate = 0;
      this.bestStrikeRatePlayer = null;
      return;
    }

    this.bestStrikeRatePlayer = players.reduce((winner: any, challenger: any) => {

      const winnerSR =
        (winner.totalRuns / winner.totalBallsFaced) * 100;

      const challengerSR =
        (challenger.totalRuns / challenger.totalBallsFaced) * 100;

      // Higher Strike Rate
      if (challengerSR > winnerSR) return challenger;
      if (challengerSR < winnerSR) return winner;

      // More innings
      if (challenger.totalInnings > winner.totalInnings) return challenger;
      if (challenger.totalInnings < winner.totalInnings) return winner;

      // More balls faced
      if (challenger.totalBallsFaced > winner.totalBallsFaced) return challenger;
      if (challenger.totalBallsFaced < winner.totalBallsFaced) return winner;

      // More runs
      if (challenger.totalRuns > winner.totalRuns) return challenger;
      if (challenger.totalRuns < winner.totalRuns) return winner;

      return winner;
    });

    this.bestStrikeRate =
      (this.bestStrikeRatePlayer.totalRuns /
        this.bestStrikeRatePlayer.totalBallsFaced) * 100;
  }

  getEconomy() {

    if (!this.careerStats) {
      return;
    }

    const MIN_BALLS = 30;

    const players = Object.values(this.careerStats).filter(
      (player: any) => player.totalBallsDelivered >= MIN_BALLS
    );

    if (players.length === 0) {
      this.bestEconomy = 0;
      this.bestEconomyPlayer = null;
      return;
    }

    this.bestEconomyPlayer = players.reduce((winner: any, challenger: any) => {

      const winnerEconomy =
        winner.totalRunsConceded / (winner.totalBallsDelivered / 6);

      const challengerEconomy =
        challenger.totalRunsConceded / (challenger.totalBallsDelivered / 6);

      // Better Economy (Lower)
      if (challengerEconomy < winnerEconomy) return challenger;
      if (challengerEconomy > winnerEconomy) return winner;

      const winnerAverage =
        winner.totalWickets > 0
          ? winner.totalRunsConceded / winner.totalWickets
          : Infinity;

      const challengerAverage =
        challenger.totalWickets > 0
          ? challenger.totalRunsConceded / challenger.totalWickets
          : Infinity;

      // Better Bowling Average (Lower)
      if (challengerAverage < winnerAverage) return challenger;
      if (challengerAverage > winnerAverage) return winner;

      // More Balls Bowled
      if (challenger.totalBallsDelivered > winner.totalBallsDelivered)
        return challenger;
      if (challenger.totalBallsDelivered < winner.totalBallsDelivered)
        return winner;

      // Fewer Runs Conceded
      if (challenger.totalRunsConceded < winner.totalRunsConceded)
        return challenger;
      if (challenger.totalRunsConceded > winner.totalRunsConceded)
        return winner;

      return winner;
    });

    this.bestEconomy =
      this.bestEconomyPlayer.totalRunsConceded /
      (this.bestEconomyPlayer.totalBallsDelivered / 6);
  }

  getBattingAverage() {
    if (!this.careerStats) {
      return;
    }

    let players = Object.values(this.careerStats).filter((player: any) => player.totalBallsFaced >= 30)

    if (players.length === 0) {
      return;
    }

    this.bestBattingAveragePlayer = players.reduce((prev: any, next: any) => {
      let prevPlayerAverage = prev.dismissed > 0 ? prev.totalRuns / prev.dismissed : prev.totalRuns;
      let nextPlayerAverage = next.dismissed > 0 ? next.totalRuns / next.dismissed : next.totalRuns;

      return nextPlayerAverage > prevPlayerAverage ? next : prev;
    });

    this.bestBattingAverage =
      this.bestBattingAveragePlayer.dismissed > 0
        ? this.bestBattingAveragePlayer.totalRuns / this.bestBattingAveragePlayer.dismissed
        : this.bestBattingAveragePlayer.totalRuns;
  }

  getBowlingAverage() {
    if (!this.careerStats) {
      return;
    }

    let players = Object.values(this.careerStats).filter((player: any) => player.totalBallsDelivered >= 30)

    if (players.length === 0) {
      return;
    }

    this.bestBowlingAveragePlayer = players.reduce((prev: any, next: any) => {
      const prevAverage =
        prev.totalWickets > 0 ? prev.totalRunsConceded / prev.totalWickets : Infinity;

      const nextAverage =
        next.totalWickets > 0 ? next.totalRunsConceded / next.totalWickets : Infinity;

      return nextAverage < prevAverage ? next : prev;
    });

    this.bestBowlingAverage =
      this.bestBowlingAveragePlayer.totalWickets > 0
        ? this.bestBowlingAveragePlayer.totalRunsConceded /
        this.bestBowlingAveragePlayer.totalWickets
        : 0;

  }

  getBowlingStrikeRate() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats).filter(
      (player: any) =>
        player.totalBallsDelivered >= 36 &&
        player.totalWickets > 0
    );

    if (players.length === 0) {
      return;
    }

    this.bestBowlingStrikeRatePlayer = players.reduce(
      (prev: any, next: any) => {

        const prevStrikeRate =
          prev.totalBallsDelivered / prev.totalWickets;

        const nextStrikeRate =
          next.totalBallsDelivered / next.totalWickets;

        return nextStrikeRate < prevStrikeRate ? next : prev;
      }
    );

    this.bestBowlingStrikeRate =
      this.bestBowlingStrikeRatePlayer.totalBallsDelivered /
      this.bestBowlingStrikeRatePlayer.totalWickets;
  }

  getHighestScore() {
    this.highestScore = 0;
    this.highestScorePlayer = null;

    this.matches.forEach((match: any) => {
      (match.innings || []).forEach((inning: any) => {
        Object.values(inning.playerStats || {}).forEach((player: any) => {
          const currentRuns = Number(player.runs || 0);
          const currentBalls = Number(player.ballsFaced ?? Infinity);
          const bestBalls = Number(
            this.highestScorePlayer?.ballsFaced ?? Infinity
          );

          if (
            currentRuns > this.highestScore ||
            (
              currentRuns === this.highestScore &&
              currentRuns > 0 &&
              currentBalls < bestBalls
            )
          ) {
            this.highestScore = currentRuns;
            this.highestScorePlayer = player;
          }
        });
      });
    });
  }

  getBestFigures() {
    this.bestFiguresPlayer = null;
    this.bestFigures = '';

    this.matches.forEach((match: any) => {
      match.innings.forEach((inning: any) => {
        Object.values(inning.playerStats || {}).forEach((player: any) => {
          const currentWickets = player.wickets || 0;
          const currentRuns = player.runsConceded || 0;

          const bestWickets = this.bestFiguresPlayer?.wickets || 0;

          const bestRuns = this.bestFiguresPlayer?.runsConceded || Infinity;

          if (
            currentWickets > bestWickets ||
            (currentWickets === bestWickets && currentRuns < bestRuns)
          ) {
            this.bestFiguresPlayer = player;
            this.bestFigures = currentWickets + '/' + currentRuns;
          }
        });
      });
    });
  }

  getMostWides() {
    if (!this.careerStats) {
      return
    }

    const players = Object.values(this.careerStats)

    if (players.length === 0) {
      return
    }

    this.mostWidesPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalWides > winner.totalWides ? challenger : winner
    })

    this.mostWides = this.mostWidesPlayer.totalWides
  }

  getMostNoBalls() {
    if (!this.careerStats) {
      return
    }

    const players = Object.values(this.careerStats)

    if (players.length === 0) {
      return
    }

    this.mostNoBallsPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalNoBalls > winner.totalNoBalls ? challenger : winner
    })

    this.mostNoBalls = this.mostNoBallsPlayer.totalNoBalls
  }

  getMostFours() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostFoursPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalFours > winner.totalFours ? challenger : winner;
    });

    this.mostFours = this.mostFoursPlayer.totalFours;
  }

  getMostSixes() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostSixesPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalSixes > winner.totalSixes ? challenger : winner;
    });

    this.mostSixes = this.mostSixesPlayer.totalSixes;
  }

  getMostMaidens() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostMaidensPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalMaidens > winner.totalMaidens ? challenger : winner;
    });

    this.mostMaidens = this.mostMaidensPlayer.totalMaidens;
  }


  getMostFifties() {
    const players: any[] = Object.values(this.careerStats).filter(
      (player: any) => player.totalFifties > 0
    );

    if (players.length === 0) {
      this.mostFifties = 0;
      this.mostFiftiesPlayer = null;
      return;
    }

    this.mostFiftiesPlayer = players.reduce(
      (winner: any, challenger: any) => {
        // 1. More half-centuries ranks higher
        if (challenger.totalFifties > winner.totalFifties) {
          return challenger;
        }

        if (challenger.totalFifties < winner.totalFifties) {
          return winner;
        }

        // 2. If tied, fewer innings ranks higher
        if (challenger.totalInnings < winner.totalInnings) {
          return challenger;
        }

        if (challenger.totalInnings > winner.totalInnings) {
          return winner;
        }

        // 3. If still tied, higher batting average ranks higher
        const winnerAverage =
          winner.dismissed > 0
            ? winner.totalRuns / winner.dismissed
            : winner.totalRuns;

        const challengerAverage =
          challenger.dismissed > 0
            ? challenger.totalRuns / challenger.dismissed
            : challenger.totalRuns;

        return challengerAverage > winnerAverage
          ? challenger
          : winner;
      }
    );

    this.mostFifties = this.mostFiftiesPlayer.totalFifties;
  }

  getMostHundreds() {
    const players: any[] = Object.values(this.careerStats).filter(
      (player: any) => player.totalHundreds > 0
    );

    if (players.length === 0) {
      this.mostHundreds = 0;
      this.mostHundredsPlayer = null;
      return;
    }

    this.mostHundredsPlayer = players.reduce(
      (winner: any, challenger: any) => {
        // 1. More centuries ranks higher
        if (challenger.totalHundreds > winner.totalHundreds) {
          return challenger;
        }

        if (challenger.totalHundreds < winner.totalHundreds) {
          return winner;
        }

        // 2. Tie: fewer innings ranks higher
        if (challenger.totalInnings < winner.totalInnings) {
          return challenger;
        }

        if (challenger.totalInnings > winner.totalInnings) {
          return winner;
        }

        // 3. Tie: higher batting average ranks higher
        const winnerAverage =
          winner.dismissed > 0
            ? winner.totalRuns / winner.dismissed
            : winner.totalRuns;

        const challengerAverage =
          challenger.dismissed > 0
            ? challenger.totalRuns / challenger.dismissed
            : challenger.totalRuns;

        if (challengerAverage > winnerAverage) {
          return challenger;
        }

        if (challengerAverage < winnerAverage) {
          return winner;
        }

        // 4. Tie: fewer balls faced ranks higher
        if (challenger.totalBallsFaced < winner.totalBallsFaced) {
          return challenger;
        }

        return winner;
      }
    );

    this.mostHundreds = this.mostHundredsPlayer.totalHundreds;
  }

  getMostCatches() {
    const players: any[] = Object.values(this.careerStats).filter(
      (player: any) => player.totalCatches > 0
    );

    if (players.length === 0) {
      this.mostCatches = 0;
      this.mostCatchesPlayer = null;
      return;
    }

    this.mostCatchesPlayer = players.reduce(
      (winner: any, challenger: any) => {
        // 1. More catches ranks higher
        if (challenger.totalCatches !== winner.totalCatches) {
          return challenger.totalCatches > winner.totalCatches
            ? challenger
            : winner;
        }

        // 2. Tie: fewer matches ranks higher
        if (challenger.totalMatches !== winner.totalMatches) {
          return challenger.totalMatches < winner.totalMatches
            ? challenger
            : winner;
        }


        return winner;
      }
    );

    this.mostCatches = this.mostCatchesPlayer.totalCatches;
  }

  getMostFifers() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostFifersPlayer = players.reduce(
      (winner: any, challenger: any) => {

        if (challenger.totalFifers > winner.totalFifers) {
          return challenger;
        }

        if (
          challenger.totalFifers === winner.totalFifers &&
          challenger.totalInnings < winner.totalInnings
        ) {
          return challenger;
        }

        if (
          challenger.totalFifers === winner.totalFifers &&
          challenger.totalInnings === winner.totalInnings &&
          challenger.totalWickets > winner.totalWickets
        ) {
          return challenger;
        }

        return winner;
      }
    );

    this.mostFifers = this.mostFifersPlayer.totalFifers;
  }

  getMostHattricks() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostHattricksPlayer = players.reduce(
      (winner: any, challenger: any) => {

        if (challenger.totalHattricks > winner.totalHattricks) {
          return challenger;
        }

        if (
          challenger.totalHattricks === winner.totalHattricks &&
          challenger.totalInnings < winner.totalInnings
        ) {
          return challenger;
        }

        if (
          challenger.totalHattricks === winner.totalHattricks &&
          challenger.totalInnings === winner.totalInnings &&
          challenger.totalWickets > winner.totalWickets
        ) {
          return challenger;
        }



        return winner;
      }
    );

    this.mosthattricks = this.mostHattricksPlayer.totalHattricks;
  }

  getMostMotm() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostMotmPlayer = players.reduce(
      (winner: any, challenger: any) => {
        if (challenger.totalMotm > winner.totalMotm) {
          return challenger;
        }

        if (
          challenger.totalMotm === winner.totalMotm &&
          challenger.totalInnings < winner.totalInnings
        ) {
          return challenger;
        }

        if (
          challenger.totalMotm === winner.totalMotm &&
          challenger.totalInnings === winner.totalInnings &&
          challenger.totalRuns > winner.totalRuns
        ) {
          return challenger;
        }

        if (
          challenger.totalMotm === winner.totalMotm &&
          challenger.totalInnings === winner.totalInnings &&
          challenger.totalRuns === winner.totalRuns &&
          challenger.totalWickets > winner.totalWickets
        ) {
          return challenger;
        }

        return winner;
      }
    );

    this.mostMotm = this.mostMotmPlayer.totalMotm;
  }

  dismissalSummary = [
    {
      type: 'bowled',
      count: 0,
      percentage: 0,
      route: '/dismissal-rankings/'
    },
    {
      type: 'caught',
      count: 0,
      percentage: 0,
      route: '/dismissal-rankings/'
    },
    {
      type: 'offside',
      count: 0,
      percentage: 0,
      route: '/dismissal-rankings/'
    },
    {
      type: 'retired-out',
      count: 0,
      percentage: 0,
      route: '/dismissal-rankings/'
    }
  ];

  updateDismissalSummary() {

    let bowled = 0;
    let caught = 0;
    let offside = 0;
    let retiredOut = 0;

    Object.values(this.careerStats).forEach((player: any) => {

      bowled += player.dismissals?.bowled || 0;
      caught += player.dismissals?.caught || 0;
      offside += player.dismissals?.offside || 0;
      retiredOut += player.dismissals?.['retired-out'] || 0;

    });

    const total = bowled + caught + offside + retiredOut;

    this.dismissalSummary = [
      {
        type: 'bowled',
        count: bowled,
        percentage: total > 0 ? (bowled / total) * 100 : 0,
        route: '/dismissal-rankings/'
      },
      {
        type: 'caught',
        count: caught,
        percentage: total > 0 ? (caught / total) * 100 : 0,
        route: '/dismissal-rankings/'
      },
      {
        type: 'offside',
        count: offside,
        percentage: total > 0 ? (offside / total) * 100 : 0,
        route: '/dismissal-rankings/'
      },
      {
        type: 'retired Out',
        count: retiredOut,
        percentage: total > 0 ? (retiredOut / total) * 100 : 0,
        route: '/dismissal-rankings/'
      }
    ];
  }
}
