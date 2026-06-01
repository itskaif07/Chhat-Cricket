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



}
