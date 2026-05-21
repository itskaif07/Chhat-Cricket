import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';
import { Player } from '../../../shared/models/player.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-match',
  imports: [CommonModule],
  templateUrl: './live-match.html',
  styleUrl: './live-match.css',
})
export class LiveMatch implements OnInit {

  constructor(private matchSetupService: MatchSetupService, private cdr: ChangeDetectorRef){}

  allSelectedPlayers: Player[] = []
  teamA: Player[] = []
  teamB:Player[] = []
  tossWinner: 'A' | 'B' | '' = ''
  battingFirst: 'A' | 'B' | '' = ''
  showBatsmenDialog:boolean = true
  showBowlerDialog:boolean = false
  isWicketFallen = false
  currentBatsman:Player | null = null
  currentBowler:Player | null = null
  selectedBatsman:Player | null = null
  selectedBowler:Player | null = null
  currentBattingTeam:Player[] = []


  //scores

  totalRuns: number = 0
  totalWickets: number = 0
  totalDeliveries: number = 0
  recentDeliveries: {value:string, type:string}[] = []
  lastAction:string = ''

  ngOnInit(){
    this.getAllSelectedPlayers()
  }

  getAllSelectedPlayers(){
  this.allSelectedPlayers =  this.matchSetupService.getSelectedPlayers()
  this.teamA = this.matchSetupService.getTeamA()
  this.teamB = this.matchSetupService.getTeamB()
  this.tossWinner = this.matchSetupService.tossWinner
  this.battingFirst = this.matchSetupService.firstBattingTeam
  this.cdr.detectChanges()
  }

//To show the dialog box of players of the team that is batting first

 get showOpeningTeam(): Player[] {
  return this.battingFirst === 'A' ? this.teamA : this.teamB
 }

 // To select who is going to bat

 selectBatsman(player: Player){
  this.selectedBatsman = player
 }

 selectBowler(player: Player){
  this.selectedBowler = player 
 }


 // Score


 addDot(){
   this.totalRuns += 0
   this.totalDeliveries += 1
   this.lastAction = '0'
   this.recentDeliveries.unshift({value:'0', type:'dot'})
   if(this.recentDeliveries.length > 12){
     
     this.recentDeliveries.pop()
     
    }
    
    
  }
  
  addFour(){
    this.totalRuns += 4
    this.totalDeliveries += 1
    this.lastAction = '4'
    this.recentDeliveries.unshift({value:'4', type:'four'})

    if(this.recentDeliveries.length > 12){

  this.recentDeliveries.pop()

}
}

addSix(){
  this.totalRuns += 6
  this.totalDeliveries += 1
  this.lastAction = '6'
  this.recentDeliveries.unshift({value:'6', type:'six'})
  
    if(this.recentDeliveries.length > 12){

  this.recentDeliveries.pop()

}
  }
  
  
  addWicket(){
    this.totalWickets += 1
    this.totalDeliveries += 1
    this.lastAction = 'W'
    this.recentDeliveries.unshift({value:'W', type:'wicket'})
    
    if(this.recentDeliveries.length > 12){

  this.recentDeliveries.pop()

}
}

addWide(){
  this.recentDeliveries.unshift({value:'WD', type:'wide'})
  this.lastAction = 'WD'
  if(this.recentDeliveries.length > 12){
    this.recentDeliveries.pop()
    
  }
}

addNoBall(){
  this.recentDeliveries.unshift({value:'NB', type:'noball'})
  this.lastAction = 'NB'
  if(this.recentDeliveries.length > 12){
  this.recentDeliveries.pop()
}
}

undo(){
  if(this.lastAction === '4'){
    this.totalDeliveries -= 1
    this.totalRuns -= 4
    this.recentDeliveries.pop()
  }
  else if(this.lastAction === '6'){
     this.totalDeliveries -= 1
    this.totalRuns -= 6
    this.recentDeliveries.pop()
  }
  else if(this.lastAction === 'W'){
     this.totalDeliveries -= 1
    this.totalWickets -= 1
    this.recentDeliveries.pop()
  }
  else if(this.lastAction === '0'){
    this.totalDeliveries -= 1
    this.totalRuns -= 0
    this.recentDeliveries.pop()
  }
  else if(this.lastAction === 'WD'){
    this.recentDeliveries.shift()
  }
  else if(this.lastAction === 'NB'){
    this.recentDeliveries.shift()
  }

  this.lastAction = ''

}


get overs():string {
  const overs =  Math.floor(this.totalDeliveries/6)
  const balls = Math.floor(this.totalDeliveries%6)

  return `${overs}.${balls}`
}

get currentRunRate():string {
  if(this.totalDeliveries == 0){
    return '0.00'
  }

  const overs = this.totalDeliveries / 6
  const crr = this.totalRuns/overs

  return crr.toFixed(2)
}
 
}

