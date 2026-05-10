import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from '@angular/fire/auth'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cricProject');

  user: User | null = null

  constructor(private auth: Auth){
    onAuthStateChanged(this.auth, (user)=>{
      this.user = user
    })
  }

  logIn(){
    const provider = new GoogleAuthProvider()

    signInWithPopup(this.auth, provider).then(() =>{
      console.log('Logged In')
    })
    .catch((e) =>{
      console.log("Error: " + e)
    })
  }

  logOut(){
    signOut(this.auth)
  }
}
