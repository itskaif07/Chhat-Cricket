import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Player } from '../../../shared/models/player.model';
import { collection, Firestore, getDocs, orderBy, query } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-select-players',
  imports: [CommonModule, RouterLink],
  templateUrl: './select-players.html',
  styleUrl: './select-players.css',
})
export class SelectPlayers implements OnInit
{

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef){}

  players: Player[] = []

  selectedPlayers: string[] = []

  teamA: Player[] = []
  teamB: Player[] = []

  currentTurn: 'A' | 'B' = 'A';

  ngOnInit(){
    this.getPlayers()
  }

selectPlayer(player: Player) {

  const playerId = player.id;

  if (!playerId) return;

  // =====================
  // UNDO TEAM A
  // =====================

  if (this.teamA.some(p => p.id === playerId)) {

    this.teamA =
      this.teamA.filter(p => p.id !== playerId);

    this.selectedPlayers =
      this.selectedPlayers.filter(id => id !== playerId);

    this.currentTurn = 'A';


    return;

  }

  // =====================
  // UNDO TEAM B
  // =====================

  if (this.teamB.some(p => p.id === playerId)) {

    this.teamB =
      this.teamB.filter(p => p.id !== playerId);

    this.selectedPlayers =
      this.selectedPlayers.filter(id => id !== playerId);

    this.currentTurn = 'B';


    return;

  }

  // =====================
  // NEW SELECTION
  // =====================

  if (this.currentTurn === 'A') {

    this.teamA.push(player);

    this.currentTurn = 'B';

  }

  else {

    this.teamB.push(player);

    this.currentTurn = 'A';

  }

  this.selectedPlayers.push(playerId);


}

 async getPlayers(){

  try{
    
    const playersRef = collection(this.firestore, 'players')

    const q = query(playersRef, orderBy('displayName', 'asc'))

    const snapshot = await getDocs(q)

    this.players = snapshot.docs.map(doc =>({
      id: doc.id,
      ...doc.data()
      
    })) as Player[]
  
    this.cdr.detectChanges()
    
  }
  catch(e){
    console.log(e)
  }
  }

}
