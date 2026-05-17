import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Player } from '../../../shared/models/player.model';
import { Firestore, getDocs, orderBy, query } from '@angular/fire/firestore';
import { collection, doc } from  '@angular/fire/firestore';
import id from '@angular/common/locales/id';

@Component({
  selector: 'app-leftover-player',
  imports: [RouterLink, CommonModule],
  templateUrl: './leftover-player.html',
  styleUrl: './leftover-player.css',
})
export class LeftoverPlayer implements OnInit {

  reservedPlayerExist: boolean = false
  players: Player[] = []



  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef){}

  ngOnInit(){
    this.getPlayers()
  }




async  getPlayers(){

    const playerRef = collection(this.firestore, 'players')

    const q = query(playerRef, orderBy('displayName', 'asc'))

   const snapshot = await getDocs(q)

   this.players = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()

   })) as Player[]

   this.cdr.detectChanges()

  }


  
}
