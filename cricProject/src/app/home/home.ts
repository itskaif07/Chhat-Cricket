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

retrieveMatches(){

  this.matchService
  .retrieveMatches()
  .subscribe((data)=>{

    this.matchesCount = data.length
    this.matches = data
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

            totalMatches: 0

          }

        }

        this.careerStats[playerId].totalRuns +=
          stats.runs || 0

        this.careerStats[playerId].totalWickets +=
          stats.wickets || 0

        this.careerStats[playerId].totalBallsFaced +=
          stats.balls || 0

        this.careerStats[playerId].totalMatches +=
          stats.matches || 0



      })

    })

  })

  this.getOrangeCap()
  this.getPurpleCap()
 

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

}
