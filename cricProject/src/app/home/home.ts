import { Component, NgZone } from '@angular/core';
import {Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from '@angular/fire/auth'


@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  user: User | null = null


  constructor(

  private auth: Auth,

  private ngZone: NgZone

) {

  onAuthStateChanged(this.auth, (user) => {

    this.ngZone.run(() => {

      this.user = user;

    });

  });

}
}
