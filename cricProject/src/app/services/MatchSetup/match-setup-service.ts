import { Injectable } from '@angular/core';
import { Player } from '../../shared/models/player.model';

@Injectable({
  providedIn: 'root',
})
export class MatchSetupService {

  teamA: Player[] = []
  teamB: Player[] = []
  tossWinner: 'A' | 'B' | '' = '';
  firstBattingTeam: 'A' | 'B' | '' = '';

  selectedPlayers: Player[] = []

  setMatchTossWinner(team: 'A'|'B' | ''){
    this.tossWinner = team
  }

  setFirstBattingTeam(team: 'A'|'B'|''){
    this.firstBattingTeam = team
  }


  setTeams(teamA:Player[], teamB:Player[]){
    this.teamA = teamA
    this.teamB = teamB

    this.selectedPlayers = [...teamA, ...teamB]
  }

  setLeftOverPlayer(player: Player){
    if(this.tossWinner ==='A'){
      this.teamA.push(player)
    }
    else if(this.tossWinner === 'B'){
      this.teamB.push(player)
    }

    this.selectedPlayers = [...this.teamA, ...this.teamB]
  }

  setLeftOverPlayerInTeamA(player: Player){
    const alreadyExists = this.teamA.some(teamPlayer => teamPlayer.id === player.id)

    if (!alreadyExists) {
      this.teamA.push(player)
    }

    this.selectedPlayers = [...this.teamA, ...this.teamB]
  }
 

  getTeamA(){
    return this.teamA
  }

  getTeamB(){
    return this.teamB
  }

  getSelectedPlayers(){
    return this.selectedPlayers
  }
}
