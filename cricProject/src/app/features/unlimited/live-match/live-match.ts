import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';
import { Player } from '../../../shared/models/player.model';
import { CommonModule } from '@angular/common';
import { PlayerStats } from '../../../shared/models/playerStats.model'
import se from '@angular/common/locales/se';
import fa from '@angular/common/locales/fa';

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
  outPlayersIds:string[] = []
  playerStats:{[playerId:string]:PlayerStats} = {}

  tossWinner: 'A' | 'B' | '' = ''
  battingFirst: 'A' | 'B' | '' = ''
  bowlingFirst: 'A' | 'B' | '' = ''
  currentInnings: 1 | 2 = 1
  isInningsOver: boolean = false

  showBatsmenDialog:boolean = true
  showBowlerDialog:boolean = false
  isWicketFallen = false
  isOverComplete = false


  currentBatsman:Player | null = null
  currentBowler:Player | null = null

  selectedBatsman:Player | null = null
  selectedBowler:Player | null = null


  //scores

  totalRuns: number = 0
  totalWickets: number = 0
  totalDeliveries: number = 0
  recentDeliveries: {value:string, type:string}[] = []
  lastAction:string = ''

  currentBatsmanRuns: number = 0
  currentBatsmanBalls: number = 0

  currentBowlerWickets:number = 0
  currentBowlerBalls:number = 0
  currentBowlerRunsConceded:number = 0

  ngOnInit(){
    this.getAllSelectedPlayers()
    this.initializePlayerStats()
  }

  getAllSelectedPlayers(){
  this.allSelectedPlayers =  this.matchSetupService.getSelectedPlayers()
  this.teamA = this.matchSetupService.getTeamA()
  this.teamB = this.matchSetupService.getTeamB()
  this.tossWinner = this.matchSetupService.tossWinner
  this.battingFirst = this.matchSetupService.firstBattingTeam
  this.cdr.detectChanges()
  }

  initializePlayerStats(){

  const allPlayers = [
    ...this.teamA,
    ...this.teamB
  ]

  allPlayers.forEach(player => {

    if(player.id){

      this.playerStats[player.id] = {

        playerId: player.id,
        playerName: player.displayName,
        matches: 1,
        innings: 0,
        runs: 0,
        ballsFaced: 0,
        wickets: 0,
        ballsDelivered:0,
        fours: 0,
        sixes: 0,
        runsConceded: 0

      }

    }

  })

}


//To show the dialog box of players of the team that is batting and bowling first

get currentBattingTeam():Player[]{
 if(this.currentInnings === 1){
  return this.battingFirst === 'A' ? this.teamA : this.teamB
 }

 return this.battingFirst === 'A' ? this.teamB : this.teamA
}

get currentBowlingTeam():Player[]{
 if(this.currentInnings === 1){
  return this.battingFirst === 'A' ? this.teamB : this.teamA
 }

 return this.battingFirst === 'A'? this.teamA : this.teamB
}

get availableBowlers(): Player[]{
 return this.currentBowlingTeam.filter(player => player?.id !== this.currentBowler?.id)
}


get availableBatsmen(): Player[] {
  return this.currentBattingTeam.filter(
    player => !this.outPlayersIds.includes(player.id!)
  )
}

get maxWickets(){
  return this.currentBattingTeam.length
}

 selectBatsman(player: Player){
  this.selectedBatsman = player
 }

 selectBowler(player: Player){
  if(player === this.selectedBowler){
    return
  }
  this.selectedBowler = player 
 }


 //confirm selection

 confirmBatsman(){
  this.currentBatsman = this.selectedBatsman
  this.showBatsmenDialog = false
  
  if(!this.isWicketFallen){
    this.showBowlerDialog = true
  }
  this.isWicketFallen = false
  if(this.selectedBatsman?.id){
  this.playerStats[this.selectedBatsman?.id].innings += 1
  }
 }

 confirmBowler(){
  this.currentBowler = this.selectedBowler
  this.showBowlerDialog = false
  this.isOverComplete = false
 }

 // Score


 addDot(){
   this.totalDeliveries += 1
   this.currentBatsmanBalls += 1
   this.currentBowlerBalls += 1
   this.lastAction = '0'
   this.recentDeliveries.unshift({value:'0', type:'dot'})

   if(this.currentBatsman?.id && this.currentBowler?.id){
    
  this.playerStats[this.currentBatsman?.id].ballsFaced += 1
  this.playerStats[this.currentBowler?.id].ballsDelivered += 1
   }

   this.manageRecentDeliveries()
   this.manageOversChange()
   console.log(this.playerStats)
  }
  
  addFour(){
    this.totalRuns += 4
    this.totalDeliveries += 1
    this.currentBatsmanRuns += 4
    this.currentBatsmanBalls += 1
    this.currentBowlerBalls += 1
    this.currentBowlerRunsConceded += 4
    this.lastAction = '4'
    this.recentDeliveries.unshift({value:'4', type:'four'})

    if(this.currentBatsman?.id && this.currentBowler?.id){
      this.playerStats[this.currentBatsman?.id].runs += 4
      
      this.playerStats[this.currentBatsman?.id].ballsFaced += 1
      this.playerStats[this.currentBatsman?.id].fours += 1
      
      this.playerStats[this.currentBowler?.id].ballsDelivered += 1
      this.playerStats[this.currentBowler?.id].runsConceded += 4
    }

    this.manageRecentDeliveries()
    this.manageOversChange()
}

addSix(){
  this.totalRuns += 6
  this.totalDeliveries += 1
  this.currentBatsmanRuns += 6
  this.currentBatsmanBalls += 1
  this.currentBowlerBalls += 1
  this.currentBowlerRunsConceded += 6
  this.lastAction = '6'
  this.recentDeliveries.unshift({value:'6', type:'six'})

    if(this.currentBatsman?.id && this.currentBowler?.id){
      this.playerStats[this.currentBatsman?.id].runs += 6
      
this.playerStats[this.currentBatsman?.id].ballsFaced += 1
      this.playerStats[this.currentBatsman?.id].sixes += 1
      
this.playerStats[this.currentBowler?.id].ballsDelivered += 1
      this.playerStats[this.currentBowler?.id].runsConceded += 6
    }
  
   this.manageRecentDeliveries()
   this.manageOversChange()
  }
  
  
  addWicket(){
    this.totalWickets += 1
    this.totalDeliveries += 1
    this.currentBatsmanBalls = 0
    this.currentBatsmanRuns = 0
    this.currentBowlerBalls += 1
    this.lastAction = 'W'
    this.showBatsmenDialog = true
    this.isWicketFallen = true
    this.selectedBatsman = null
    this.recentDeliveries.unshift({value:'W', type:'wicket'})
    this.manageRecentDeliveries()
    this.manageOversChange()

      if(this.currentBatsman?.id && this.currentBowler?.id){
      this.playerStats[this.currentBowler?.id].wickets += 1
      
        this.playerStats[this.currentBowler?.id].ballsDelivered += 1
        this.playerStats[this.currentBatsman?.id].ballsFaced += 1
    }

    if(this.currentBatsman){
    this.outPlayersIds.push(this.currentBatsman.id!)
    }

    if(this.totalWickets >= this.maxWickets){
      this.isInningsOver = true
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
    this.recentDeliveries.shift()
  }
  else if(this.lastAction === '6'){
     this.totalDeliveries -= 1
    this.totalRuns -= 6
    this.recentDeliveries.shift()
  }
  else if(this.lastAction === 'W'){
     this.totalDeliveries -= 1
    this.totalWickets -= 1
    this.recentDeliveries.shift()
  }
  else if(this.lastAction === '0'){
    this.totalDeliveries -= 1
    this.totalRuns -= 0
    this.recentDeliveries.shift()
  }
  else if(this.lastAction === 'WD'){
    this.recentDeliveries.shift()
  }
  else if(this.lastAction === 'NB'){
    this.recentDeliveries.shift()
  }

  this.lastAction = ''

}

manageRecentDeliveries(){
  if(this.recentDeliveries.length > 12){
    this.recentDeliveries.pop()
  }
}

manageOversChange(){

  if(this.totalDeliveries % 6 === 0 &&
     this.totalDeliveries > 0){

    this.isOverComplete = true
    this.showBowlerDialog = true
    this.selectedBowler = null

  }

}

get currentBowlerOvers(): string {

  if(!this.currentBowler?.id){
    return '0.0'
  }

  const balls =
    this.playerStats[
      this.currentBowler.id
    ]?.ballsDelivered || 0

  const overs = Math.floor(balls / 6)

  const remainingBalls = balls % 6

  return `${overs}.${remainingBalls}`

}

get currentBowlerEconomy(): string {

  if(!this.currentBowler?.id){
    return '0.00'
  }

  const stats =
    this.playerStats[this.currentBowler.id]

  if(!stats?.ballsDelivered){
    return '0.00'
  }

  const overs =
    stats.ballsDelivered / 6

  const economy =
    stats.runsConceded / overs

  return economy.toFixed(2)

}

get currentBatsmanStrikeRate(): string {

  if(!this.currentBatsman?.id){
    return '0.00'
  }

  const stats =
    this.playerStats[
      this.currentBatsman.id
    ]

  if(!stats?.ballsFaced){
    return '0.00'
  }

  const strikeRate =
    (stats.runs / stats.ballsFaced) * 100

  return strikeRate.toFixed(2)

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

