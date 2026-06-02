import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import {Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from '@angular/fire/auth'
import { collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';
import { MatchService } from '../services/matchService/match-service';


@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  user: User | null = null
  playersCount: number = 0
  matchesCount:number = 0
  matches:any = 0
  totalRuns = 0
  totalWickets = 0
  careerStats:any = {}
  orangeCap:any
  purpleCap:any
  bestStrikeRate:number = 0
  bestStrikeRatePlayer:any = null
  bestEconomyPlayer:any = null
  bestEconomy:number = 0
  bestBattingAveragePlayer:any = null
  bestBattingAverage:number = 0
  bestBowlingAveragePlayer:any = null
  bestBowlingAverage:number = 0



  constructor( private auth: Auth, private firestore: Firestore, private cdr: ChangeDetectorRef, private matchService:MatchService) {

  onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      cdr.detectChanges()
  });
}

ngOnInit(){
  setTimeout(() => {
    this.retrievePlayers()
    this.retrieveMatches()
  });
}

async retrievePlayers() {

  try {

    const playersRef = collection(this.firestore, 'players');
    const snapshot = await getDocs(playersRef);
    const players = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    this.playersCount = players.length
    this.cdr.detectChanges()
  }

  catch(error) {
    console.log(error);
  }

}

//Platform Stats

retrieveMatches(){

  this.matchService
  .retrieveMatches()
  .subscribe((data)=>{

    this.matchesCount = data.length
    this.matches = data
    console.log(data)
    this.aggregateTotalRuns()
    this.aggregateTotalWickets()
    this.aggregateCareerStats()
    this.cdr.detectChanges()

  })

}

aggregateTotalRuns(){

  this.totalRuns = 0

  if(this.matches){

    this.matches.forEach((match:any) => {

      match.innings.forEach((innings:any) => {

        if(innings.inning === 1){
          this.totalRuns += innings.firstInningsTotalRuns || 0
        }

        if(innings.inning === 2){
          this.totalRuns += innings.secondInningsTotalRuns || 0
        }

      })

    })

  }

}


aggregateTotalWickets(){
  if(this.matches){
    this.matches.forEach((match:any) =>{
      match.innings.forEach((innings:any)=>{
        if(innings.inning == 1){
          this.totalWickets += innings.firstInningsTotalWickets || 0
        }

        if(innings.inning == 2){
          this.totalWickets += innings.firstInningsTotalWickets || 0
        }
      })
    })
  }
}

// Player Stats


aggregateCareerStats(){

  this.matches.forEach((match:any)=>{

    match.innings.forEach((innings:any)=>{

      Object.entries(
        innings.playerStats || {}
      ).forEach(([playerId, stats]:any)=>{

        if(!this.careerStats[playerId]){

          this.careerStats[playerId] = {

            playerId,

            playerName: stats.playerName,

            playerPhoto: stats.playerPhoto,

            totalRuns: 0,

            totalWickets: 0,

            totalBallsFaced: 0,

            totalMatches: 0,

            totalRunsConceded: 0,

            totalBallsDelivered: 0,

            dismissed: 0


          }

        }

        this.careerStats[playerId].totalRuns +=
          stats.runs || 0

        this.careerStats[playerId].totalWickets +=
          stats.wickets || 0

        this.careerStats[playerId].totalBallsFaced +=
          stats.ballsFaced || 0

        this.careerStats[playerId].totalMatches +=
          stats.matches || 0

        this.careerStats[playerId].totalRunsConceded +=
          stats.runsConceded || 0

        this.careerStats[playerId].totalBallsDelivered +=
          stats.ballsDelivered || 0

        this.careerStats[playerId].dismissed += stats.dismissalType ? 1 : 0


      })

    })

  })

  this.getOrangeCap()
  this.getPurpleCap()
  this.getStrikeRate()
  this.getEconomy()
  this.getBattingAverage()
  this.getBowlingAverage()
  this.cdr.detectChanges()
 

}

getOrangeCap(){

  this.orangeCap = Object.values(this.careerStats)
    .sort(
      (a:any,b:any)=>
      b.totalRuns - a.totalRuns
    )[0]

}

getPurpleCap(){

  this.purpleCap = Object.values(this.careerStats)
    .sort(
      (a:any,b:any)=>
      b.totalWickets - a.totalWickets
    )[0]

}

getStrikeRate() {

  if (!this.careerStats) return;

  const players = Object.values(this.careerStats);

  this.bestStrikeRatePlayer = players.reduce(
    (winner: any, challenger: any) => {

      const winnerSR =
        (winner.totalRuns / winner.totalBallsFaced) * 100;

      const challengerSR =
        (challenger.totalRuns / challenger.totalBallsFaced) * 100;

      return challengerSR > winnerSR
        ? challenger
        : winner;

    }
  );

  this.bestStrikeRate =
    (
      this.bestStrikeRatePlayer.totalRuns /
      this.bestStrikeRatePlayer.totalBallsFaced
    ) * 100;

}

getEconomy(){
  if(!this.careerStats){
    return
  }

  let players = Object.values(this.careerStats)

  this.bestEconomyPlayer = players.reduce(
  (winner:any, challenger:any) => {

    const winnerEconomy =
      winner.totalBallsDelivered > 0
        ? winner.totalRunsConceded /
          (winner.totalBallsDelivered / 6)
        : Infinity;

    const challengerEconomy =
      challenger.totalBallsDelivered > 0
        ? challenger.totalRunsConceded /
          (challenger.totalBallsDelivered / 6)
        : Infinity;


    return challengerEconomy < winnerEconomy
      ? challenger
      : winner;
  }
);

this.bestEconomy = this.bestEconomyPlayer.totalRunsConceded / (this.bestEconomyPlayer.totalBallsDelivered/6)

}

getBattingAverage(){
  if(!this.careerStats){
    return
  }

  let players = Object.values(this.careerStats)

  this.bestBattingAveragePlayer = players.reduce((prev:any, next:any)=>{
    let prevPlayerAverage = prev.dismissed > 0 ? (prev.totalRuns / prev.dismissed) : prev.totalRuns
    let nextPlayerAverage = next.dismissed > 0 ? (next.totalRuns / next.dismissed) : next.totalRuns

    return nextPlayerAverage > prevPlayerAverage ? next : prev
  })

  this.bestBattingAverage = this.bestBattingAveragePlayer.dismissed > 0 ? (this.bestBattingAveragePlayer.totalRuns / this.bestBattingAveragePlayer.dismissed) : this.bestBattingAveragePlayer.totalRuns

}

getBowlingAverage(){
  if(!this.careerStats){
    return
  }

  let players = Object.values(this.careerStats)

 this.bestBowlingAveragePlayer = players.reduce(
  (prev: any, next: any) => {

    const prevAverage =
      prev.totalWickets > 0
        ? prev.totalRunsConceded / prev.totalWickets
        : Infinity;

    const nextAverage =
      next.totalWickets > 0
        ? next.totalRunsConceded / next.totalWickets
        : Infinity;

    return nextAverage < prevAverage
      ? next
      : prev;
  }
);

this.bestBowlingAverage =
  this.bestBowlingAveragePlayer.totalWickets > 0
    ? this.bestBowlingAveragePlayer.totalRunsConceded /
      this.bestBowlingAveragePlayer.totalWickets
    : 0;

}

}
