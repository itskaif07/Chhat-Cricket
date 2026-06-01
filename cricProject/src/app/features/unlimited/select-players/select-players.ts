import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Player } from '../../../shared/models/player.model';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";
import { RetrievePlayersService } from '../../../services/retrievePlayer/retrieve-players-service';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';

@Component({
  selector: 'app-select-players',
  imports: [CommonModule],
  templateUrl: './select-players.html',
  styleUrl: './select-players.css',
})
export class SelectPlayers implements OnInit
{

  constructor(private RetrievePlayersService: RetrievePlayersService, private cdr: ChangeDetectorRef, private matchSetupService: MatchSetupService, private router: Router){}

  players: Player[] = []

  selectedPlayers: string[] = []

  teamA: Player[] = []
  teamB: Player[] = []

  currentTurn: 'A' | 'B' = 'A';

  ngOnInit(){
    this.getPlayers()
  }

   async getPlayers(){

  try{
    
   this.players = await this.RetrievePlayersService.getAllPlayers()
    this.cdr.detectChanges()
    
  }
  catch(e){
    console.log(e)
  }
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

getSelectionOrder(player:Player){

  if(!player.id) return 0

  return this.selectedPlayers.indexOf(player.id) + 1

}

goToTossPage(){
  if (this.selectedPlayers.length < 4) return;

  this.matchSetupService.setTeams(this.teamA, this.teamB)
  this.router.navigate(['/unlimited/toss'])
}

reset(){
  this.selectedPlayers = []
  this.teamA = []
  this.teamB = []
  this.currentTurn = 'A'
}




}
