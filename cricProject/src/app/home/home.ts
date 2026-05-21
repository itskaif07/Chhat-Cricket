import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import {Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from '@angular/fire/auth'
import { collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  user: User | null = null
  playersCount: number = 0


  constructor( private auth: Auth, private ngZone: NgZone, private firestore: Firestore, private cdr: ChangeDetectorRef) {

  onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      cdr.detectChanges()
  });
}

ngOnInit(){
  setTimeout(() => {
    this.retrievePlayers()
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

}
