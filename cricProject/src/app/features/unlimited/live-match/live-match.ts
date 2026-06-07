import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';
import { Player } from '../../../shared/models/player.model';
import { CommonModule } from '@angular/common';
import { PlayerStats } from '../../../shared/models/playerStats.model'
import { Router, RouterLink } from '@angular/router';
import { MatchService } from '../../../services/matchService/match-service';
import { OfflinePersistanceService } from '../../../services/offline-persistance/offline-persistance-service';

@Component({
  selector: 'app-live-match',
  imports: [CommonModule],
  templateUrl: './live-match.html',
  styleUrl: './live-match.css',
})
export class LiveMatch implements OnInit {

  constructor(private matchSetupService: MatchSetupService, private cdr: ChangeDetectorRef, private matchService: MatchService, private router:Router, 
    private offlinePersistanceService: OfflinePersistanceService){}

  allSelectedPlayers: Player[] = []
  teamA: Player[] = []
  teamB:Player[] = []
  outPlayersIds:string[] = []
  playerStats:{[playerId:string]:PlayerStats} = {}
  
  tossWinner: 'A' | 'B' | '' = ''
  battingFirst: 'A' | 'B' | '' = ''
  bowlingFirst: 'A' | 'B' | '' = ''
  
  currentInnings: 1 | 2 = 1
  firstInningRuns:number = 0
  firstInningsBalls:number = 0
  firstInningsWickets:number = 0
  firstInningsPlayerStats:Record<string, PlayerStats> = {}
  
  isInningsOver: boolean = false
  showBatsmenDialog:boolean = true
  showBowlerDialog:boolean = false
  isWicketFallen = false
  isOverComplete = false
  canUndo:boolean = false
  isShowingScoreCard:boolean = false
  isDismissalDialogOpen:boolean = false
  isShowingCatchingDialog:boolean = false
  showHatTrickAnimation = false

  captainA:Player | null = null
  captainB:Player | null = null


  dismissalType:'caught'|'bowled'|'offside'| null = null
  matchResult:'won'|'lost'|'tie'| null = null


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

  Math = Math


  ngOnInit(){
     const restored =
    this.restoreMatchState();

  if(restored){
    return;
  }

  this.getAllSelectedPlayers();
  this.initializePlayerStats();
  this.getCaptains();
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
        playerPhoto: player.photoURL || '',
        matches: 1,
        innings: 0,
        runs: 0,
        ballsFaced: 0,
        wickets: 0,
        ballsDelivered:0,
        fours: 0,
        sixes: 0,
        runsConceded: 0,
        dismissalType: null,
        caughtBy: null,
        dismissedBy:'',
        hatTricks:0,
        maiden:0,
        fifer: 0,
        hasScoredFifty:false,
        fifty: 0,
        hasScoredHundred:false,
        hundred:0,
      }

    }

  })

}



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

get currentBattingTeamName(): "A" | "B"{
  if(this.currentInnings === 1){
    return this.battingFirst === 'A' ? 'A' : 'B'
  }

  return this.battingFirst === 'A' ? 'B' : 'A' 
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

get runsNeeded(){

  if(this.currentInnings !== 2){
    return 0
  }

  return (
    this.firstInningRuns + 1
  ) - this.totalRuns

}

get matchResultMessage(){

  if(this.matchResult === 'won'){
    return 'Target chased successfully.'
  }

  if(this.matchResult === 'lost'){
    return 'The chase fell short.'
  }

  return 'Both teams finished level.'

}

get matchResultTitle(){

  if(this.matchResult === 'won'){
    return 'VICTORY'
  }

  if(this.matchResult === 'lost'){
    return 'DEFEAT'
  }

  return 'TIED'

}

get resultMessage(){

  const firstBattingTeam =
    this.battingFirst

  const secondBattingTeam =
    this.battingFirst === 'A'
    ? 'B'
    : 'A'

  // CHASING TEAM WON

  if(this.matchResult === 'won'){

    const wicketsLeft =
      this.maxWickets -
      this.totalWickets

    return `
      Team ${secondBattingTeam}
      won by
      ${wicketsLeft} wickets
    `

  }

  // DEFENDING TEAM WON

  if(this.matchResult === 'lost'){

    const runMargin =
      this.firstInningRuns -
      this.totalRuns

    return `
      Team ${firstBattingTeam}
      won by
      ${runMargin} runs
    `

  }

  return 'Match Tied'

}

get winningTeam(){

  if(this.matchResult === 'tie'){
    return null
  }

  // chasing team won

  if(this.matchResult === 'won'){

    return this.battingFirst === 'A'
      ? 'B'
      : 'A'

  }

  // defending team won

  return this.battingFirst

}

get Motm(){

  let bestPlayer = null
  let bestScore = 0

  const matchStats =
    this.buildMatchStats()

  for(const playerId in matchStats){

    const player =
      matchStats[playerId]

    const score =
      player.runs +
      (player.wickets * 20) -
      (player.runsConceded / 2)

    if(score > bestScore){

      bestScore = score
      bestPlayer = player

    }

  }

  return bestPlayer

}


getCaptains(){
  this.captainA = this.matchSetupService.getTeamACaptain()
  this.captainB = this.matchSetupService.getTeamBCaptain()
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
  this.saveMatchState();
 }

 confirmBowler(){
  this.currentBowler = this.selectedBowler
  this.showBowlerDialog = false
  this.isOverComplete = false
  this.saveMatchState();
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

    this.saveMatchState();
   this.manageOversChange()
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

    this.saveMatchState();
    this.manageBattingMilestone()
    this.manageOversChange()
    this.checkMatchResult()
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
  
    this.saveMatchState();
   this.manageBattingMilestone()
   this.manageOversChange()
   this.checkMatchResult()
  }
  
  
addWicket(){

  this.totalWickets += 1
  this.totalDeliveries += 1

  this.currentBatsmanBalls = 0
  this.currentBatsmanRuns = 0

  this.currentBowlerBalls += 1

  this.lastAction = 'W'

  this.isWicketFallen = true

  this.selectedBatsman = null

  this.recentDeliveries.unshift({
    value:'W',
    type:'wicket'
  })
  
  const isHatTrick = this.isHatTrick();

  
if (this.currentBowler?.id && isHatTrick) {
  this.playerStats[this.currentBowler.id].hatTricks++;
}



  this.saveMatchState();
  this.manageOversChange()

  this.isDismissalDialogOpen = true

  if(
    this.currentBatsman?.id
    &&
    this.currentBowler?.id
  ){

    this.playerStats[
      this.currentBowler.id
    ].wickets += 1

    this.playerStats[
      this.currentBowler.id
    ].ballsDelivered += 1

    this.playerStats[
      this.currentBatsman.id
    ].ballsFaced += 1

  }

  this.addFiveFers()


  if(this.currentBatsman){

    this.outPlayersIds.push(
      this.currentBatsman.id!
    )

  }

  this.dismissalType = null

}

selectDismissalType(type:'caught' | 'bowled' | 'offside' | null){

  this.dismissalType = type

    if(type === 'caught'){

    this.isShowingCatchingDialog = true
    return

  }

  if(this.currentBatsman?.id && this.currentBowler){

    this.playerStats[
      this.currentBatsman.id
    ].dismissalType = type

    this.playerStats[this.currentBatsman?.id].dismissedBy = this.currentBowler?.displayName || ''
    
  }
  
  this.continueAfterDismissal()
}

selectCaughtBy(player:Player){

  if(
    this.currentBatsman?.id
    &&
    this.currentBowler
  ){

    // SAVE DISMISSAL TYPE

    this.playerStats[
      this.currentBatsman.id
    ].dismissalType = 'caught'

    // SAVE BOWLER

    this.playerStats[
      this.currentBatsman.id
    ].dismissedBy =
    this.currentBowler.displayName || ''

    // SAVE FIELDER

    this.playerStats[
      this.currentBatsman.id
    ].caughtBy = player

  }

  // CLOSE DIALOG

  this.isShowingCatchingDialog = false

  // CONTINUE

  this.continueAfterDismissal()

}

continueAfterDismissal(){


  this.isDismissalDialogOpen = false

  this.checkMatchResult()

  // LAST WICKET

  if(this.totalWickets >= this.maxWickets){

    this.isInningsOver = true

    return

  }

  // OTHERWISE

  this.showBatsmenDialog = true

}

addFiveFers(){

  const bowler =
    this.playerStats[this.currentBowler?.id!];

  if(bowler.wickets === 5){
    bowler.fifer += 1;
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

manageBattingMilestone(){
  if(this.currentBatsman?.id){
  const currentBatter = this.playerStats[this.currentBatsman?.id]

    if(currentBatter.runs >= 50 && !currentBatter.hasScoredFifty){
      currentBatter.hasScoredFifty = true
      currentBatter.fifty += 1
    }

    if(currentBatter.runs >= 100 && !currentBatter.hasScoredHundred){
      currentBatter.hasScoredHundred = true
      currentBatter.hundred += 1
    }

  }
}

isHatTrick(): boolean {

  if(this.recentDeliveries.length < 3){
    return false;
  }

  const lastThree =
    this.recentDeliveries.slice(0, 3);

  const isHatTrick =
    lastThree.every(
      delivery => delivery.type === 'wicket'
    );

  if(!isHatTrick){
    return false;
  }

  // 4th consecutive wicket ko hat-trick mat banao

  if(
    this.recentDeliveries.length >= 4 &&
    this.recentDeliveries[3].type === 'wicket'
  ){
    return false;
  }

  return true;
}

undo(){
  if(this.lastAction === '4'){
    this.totalDeliveries -= 1
    this.totalRuns -= 4
    this.playerStats[this.currentBatsman?.id!].ballsFaced -= 1
    this.playerStats[this.currentBatsman?.id!].runs -= 4
    this.playerStats[this.currentBowler?.id!].runsConceded -= 4
    this.playerStats[this.currentBowler?.id!].ballsDelivered -= 1
    this.recentDeliveries.shift()
    this.saveMatchState();
  }
  else if(this.lastAction === '6'){
     this.totalDeliveries -= 1
    this.totalRuns -= 6
    this.playerStats[this.currentBatsman?.id!].ballsFaced -= 1
    this.playerStats[this.currentBatsman?.id!].runs -= 6
    this.playerStats[this.currentBowler?.id!].runsConceded -= 6
    this.playerStats[this.currentBowler?.id!].ballsDelivered -= 1
    this.recentDeliveries.shift()
    this.saveMatchState();
  }
  else if(this.lastAction === 'W'){
     this.totalDeliveries -= 1
    this.totalWickets -= 1
    this.playerStats[this.currentBatsman?.id!].ballsFaced -= 1
    this.playerStats[this.currentBowler?.id!].ballsDelivered -= 1
    this.playerStats[this.currentBowler?.id!].wickets -= 1
    
    this.recentDeliveries.shift()
    this.saveMatchState();
  }
  else if(this.lastAction === '0'){
    this.totalDeliveries -= 1
    this.totalRuns -= 0
    this.playerStats[this.currentBatsman?.id!].ballsFaced -= 1
    this.playerStats[this.currentBowler?.id!].ballsDelivered -= 1
    this.recentDeliveries.shift()
    this.saveMatchState();
  }
  else if(this.lastAction === 'WD'){
    this.recentDeliveries.shift()
    this.saveMatchState();
  }
  else if(this.lastAction === 'NB'){
    this.recentDeliveries.shift()
    this.saveMatchState();
  }

  this.lastAction = ''
  this.saveMatchState();

}


manageOversChange(){

  if(
    this.totalDeliveries % 6 === 0
    &&
    this.totalDeliveries > 0
  ){

    this.isOverComplete = true

    this.showBowlerDialog = true

    this.selectedBowler = null

    this.canUndo = false

    // MAIDEN OVER

    if(
      this.currentBowler?.id
      &&
      this.currentBowlerRunsConceded === 0
    ){

      this.playerStats[
        this.currentBowler.id
      ].maiden += 1

    }

    // RESET FOR NEXT OVER

    this.currentBowlerRunsConceded = 0

  }

  if(this.totalDeliveries % 6 === 1){

    this.canUndo = true

  }

}

saveMatchState() {

  this.offlinePersistanceService.saveMatch({

    allSelectedPlayers: this.allSelectedPlayers,
    teamA: this.teamA,
    teamB: this.teamB,

    tossWinner: this.tossWinner,
    battingFirst: this.battingFirst,

    currentInnings: this.currentInnings,

    firstInningRuns: this.firstInningRuns,
    firstInningsBalls: this.firstInningsBalls,
    firstInningsWickets: this.firstInningsWickets,
    firstInningsPlayerStats: this.firstInningsPlayerStats,

    playerStats: this.playerStats,

    totalRuns: this.totalRuns,
    totalWickets: this.totalWickets,
    totalDeliveries: this.totalDeliveries,

    outPlayersIds: this.outPlayersIds,
    recentDeliveries: this.recentDeliveries,

    currentBatsman: this.currentBatsman,
    currentBowler: this.currentBowler,

    selectedBatsman: this.selectedBatsman,
    selectedBowler: this.selectedBowler
  });

}

restoreMatchState() {

  const saved =
    this.offlinePersistanceService.loadMatch<any>();

  if (!saved) {
    return false;
  }

  Object.assign(this, saved);

  return true;
}

checkMatchResult(){

  if(this.currentInnings !== 2){
    return
  }

  // WIN

  if(this.totalRuns > this.firstInningRuns){

    this.matchResult = 'won'

    return

  }

  // LOSS

  if(
    this.totalRuns < this.firstInningRuns
    &&
    this.totalWickets >= this.maxWickets
  ){

    this.matchResult = 'lost'

    return

  }

  // TIE

  if(
    this.totalRuns === this.firstInningRuns
    &&
    this.totalWickets >= this.maxWickets
  ){

    this.matchResult = 'tie'

  }

}

startSecondInnings(){

  this.firstInningRuns =
    this.totalRuns

    this.firstInningsBalls = this.totalDeliveries
    this.firstInningsWickets = this.totalWickets

    this.firstInningsPlayerStats = structuredClone(this.playerStats)

    this.playerStats = {}
    this.initializePlayerStats()

  this.currentInnings = 2

  this.isDismissalDialogOpen = false
  this.totalRuns = 0
  this.totalWickets = 0
  this.totalDeliveries = 0

  this.currentBatsman = null
  this.currentBowler = null

  this.selectedBatsman = null
  this.selectedBowler = null

  this.outPlayersIds = []

  this.recentDeliveries = []

  this.isWicketFallen = false
  this.isOverComplete = false

  this.showBowlerDialog = false
  this.showBatsmenDialog = true
  this.isShowingCatchingDialog = false
  this.dismissalType = null
  this.saveMatchState();

}

buildMatchStats(){

  const matchStats =
    structuredClone(
      this.firstInningsPlayerStats
    )

  for(const playerId in this.playerStats){

    const first =
      matchStats[playerId]

    const second =
      this.playerStats[playerId]

    first.runs += second.runs
    first.wickets += second.wickets
    first.ballsFaced += second.ballsFaced
    first.ballsDelivered += second.ballsDelivered
    first.runsConceded += second.runsConceded
    first.fours += second.fours
    first.sixes += second.sixes

  }

  return matchStats

}

 buildMatchObject(){

  

  return {

    createdAt: Date.now(),

    year: new Date().getFullYear(),
    teamA: this.teamA,
    teamB: this.teamB,
    motm: this.Motm,
    teamACaptain: this.captainA,
    teamBCaptain: this.captainB,

    innings: [

      {

        inning: 1,

        firstInningsTotalRuns:
        this.firstInningRuns,
        firstInningsTotalBalls: this.firstInningsBalls,
        firstInningsTotalWickets: this.firstInningsWickets,

        playerStats:
        this.firstInningsPlayerStats

      },

      {

        inning: 2,

        secondInningsTotalRuns:
        this.totalRuns,
        secondInningsTotalWickets: this.totalWickets,
        secondInningsTotalBalls: this.totalDeliveries,

        playerStats:
        this.playerStats

      }

    ]

  }

}

async saveCompletedMatch(){

  try{

    const matchData =
      this.buildMatchObject()

    await this.matchService
    .saveMatch(matchData)

    this.offlinePersistanceService.clearMatch();

    this.router.navigate(['/'])

  }

  catch(error){

    console.log(
      'Error Saving Match',
      error
    )

  }

}

 
}

