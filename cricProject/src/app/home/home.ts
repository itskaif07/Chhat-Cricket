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
import { RouterLink } from '@angular/router';
import { MatchService } from '../services/matchService/match-service';
import { Player } from '../shared/models/player.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
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


  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private matchService: MatchService,
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      cdr.detectChanges();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.retrievePlayers();
      this.retrieveMatches();
    });
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

  //Platform Stats

  retrieveMatches() {
    this.loading = true
    this.matchService.retrieveMatches().subscribe((data) => {
      this.matchesCount = data.length;
      this.matches = data;
      console.log(data);
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
          if (innings.inning == 1) {
            this.totalWickets += innings.firstInningsTotalWickets || 0;
          }

          if (innings.inning == 2) {
            this.totalWickets += innings.firstInningsTotalWickets || 0;
          }
        });
      });
    }
  }

  // Player Stats

  aggregateCareerStats() {
    this.careerStats = {};

    this.matches.forEach((match: any) => {
      match.innings.forEach((innings: any, i: number) => {
        Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: any) => {

          if (stats.hatTricks > 0) {
            console.log(match.id);
            console.log('innings', i + 1);
            console.log(stats);
          }

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

              totalFours: 0,

              totalSixes: 0,

              totalFifties: 0,

              totalHundreds: 0,

              totalHattricks: 0,

              totalFifers: 0,

              totalCatches: 0,

              totalMotm: 0,

              totalWides: 0,

              totalNoBalls: 0
            };
          }

          this.careerStats[playerId].totalRuns += stats.runs || 0;

          this.careerStats[playerId].totalWickets += stats.wickets || 0;

          this.careerStats[playerId].totalBallsFaced += stats.ballsFaced || 0;

          this.careerStats[playerId].totalMatches += stats.matches || 0;

          this.careerStats[playerId].totalInnings += stats.innings || 0;

          this.careerStats[playerId].totalRunsConceded += stats.runsConceded || 0;

          this.careerStats[playerId].totalBallsDelivered += stats.ballsDelivered || 0;

          this.careerStats[playerId].totalFours += stats.fours || 0;

          this.careerStats[playerId].totalSixes += stats.sixes || 0;

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

      if (match.motm?.playerId) {
        const motmId = match.motm.playerId;

        if (this.careerStats[motmId]) {
          this.careerStats[motmId].totalMotm = (this.careerStats[motmId].totalMotm || 0) + 1;
        }
      }



    });

    this.getOrangeCap();
    this.getPurpleCap();
    this.getStrikeRate();
    this.getEconomy();
    this.getBattingAverage();
    this.getBowlingAverage();
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
      (player: any) => player.totalBallsFaced >= MIN_BALLS,
    );

    if (players.length === 0) {
      this.bestStrikeRate = 0;
      this.bestStrikeRatePlayer = null;
      return;
    }

    this.bestStrikeRatePlayer = players.reduce(
      (winner: any, challenger: any) => {
        const winnerSR =
          (winner.totalRuns / winner.totalBallsFaced) * 100;

        const challengerSR =
          (challenger.totalRuns / challenger.totalBallsFaced) * 100;

        return challengerSR > winnerSR ? challenger : winner;
      }
    );

    this.bestStrikeRate =
      (this.bestStrikeRatePlayer.totalRuns /
        this.bestStrikeRatePlayer.totalBallsFaced) *
      100;
  }

  getEconomy() {
    if (!this.careerStats) {
      return;
    }

    let players = Object.values(this.careerStats).filter((player: any) => player.totalBallsDelivered >= 30);

    if (players.length === 0) {
      return;
    }

    this.bestEconomyPlayer = players.reduce((winner: any, challenger: any) => {
      const winnerEconomy =
        winner.totalBallsDelivered > 0
          ? winner.totalRunsConceded / (winner.totalBallsDelivered / 6)
          : Infinity;

      const challengerEconomy =
        challenger.totalBallsDelivered > 0
          ? challenger.totalRunsConceded / (challenger.totalBallsDelivered / 6)
          : Infinity;

      return challengerEconomy < winnerEconomy ? challenger : winner;
    });

    this.bestEconomy =
      this.bestEconomyPlayer.totalRunsConceded / (this.bestEconomyPlayer.totalBallsDelivered / 6);
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

  getHighestScore() {
    this.highestScore = 0;
    this.highestScorePlayer = null;

    this.matches.forEach((match: any) => {
      match.innings.forEach((inning: any) => {
        Object.values(inning.playerStats || {}).forEach((player: any) => {
          if (player.runs > this.highestScore) {
            this.highestScore = player.runs;
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

  getMostFifties() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostFiftiesPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalFifties > winner.totalFifties ? challenger : winner;
    });

    this.mostFifties = this.mostFiftiesPlayer.totalFifties;
  }

  getMostHundreds() {

    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostHundredsPlayer = players.reduce(
      (winner: any, challenger: any) => {

        if (
          challenger.totalHundreds >
          winner.totalHundreds
        ) {
          return challenger;
        }

        if (
          challenger.totalHundreds ===
          winner.totalHundreds
        ) {

          if (
            challenger.totalInnings <
            winner.totalInnings
          ) {
            return challenger;
          }

          if (
            challenger.totalInnings ===
            winner.totalInnings
          ) {

            if (
              challenger.totalBallsFaced <
              winner.totalBallsFaced
            ) {
              return challenger;
            }

            if (
              challenger.totalBallsFaced ===
              winner.totalBallsFaced
            ) {

              if (
                challenger.totalRuns >
                winner.totalRuns
              ) {
                return challenger;
              }

            }

          }

        }

        return winner;

      }
    );

    this.mostHundreds =
      this.mostHundredsPlayer.totalHundreds;

  }

  getMostCatches() {
    if (!this.careerStats) {
      return;
    }

    const players = Object.values(this.careerStats);

    if (players.length === 0) {
      return;
    }

    this.mostCatchesPlayer = players.reduce((winner: any, challenger: any) => {
      return challenger.totalCatches > winner.totalCatches ? challenger : winner;
    });

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
}
