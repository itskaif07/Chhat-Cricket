import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/matchService/match-service';
import { MatchSetupService } from '../../services/MatchSetup/match-setup-service';
import { Player } from '../../shared/models/player.model';

@Component({
  selector: 'app-scorecard',
  imports: [],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css',
})
export class Scorecard implements OnInit{

  constructor(private route: ActivatedRoute, private matchService:MatchService, private cdr: ChangeDetectorRef, private matchSetupService:MatchSetupService){}

  matchData:any = []
  selectedInnings:any;
  Object = Object;
  captainA:Player | null = null
  captainB:Player | null = null

  ngOnInit(){

    this.getData()

}

getData(){

  try{
    const id =
  this.route.snapshot.paramMap.get('id')

  if(id){

    this.matchService
    .getMatchById(id)
    .subscribe((data)=>{


      this.matchData = data

      this.selectedInnings = this.matchData.innings[1]
      
      this.getCaptains()
      this.cdr.detectChanges()
    })
    
  }

}
catch(e){
  console.log(e)
}


}

getPlayers(playerStats:any): any[] {

  return Object.values(playerStats || {})

}


setInnings(index:number){

  this.selectedInnings =
  this.matchData.innings[index]

}

getOvers(balls: number): string {

  const overs = Math.floor(balls / 6);
  const deliveries = balls % 6;

  return `${overs}.${deliveries}`;

}

getBatters(playerStats:any){

  return Object.values(playerStats || {})
  .filter((player:any)=>

    player.ballsFaced > 0 ||

    player.dismissalType

  )

}

getBowlers(playerStats:any){

  return Object.values(playerStats || {})
  .filter((player:any)=>

    player.ballsDelivered > 0

  )

}

getCaptains(){
 this.captainA = this.matchSetupService.getTeamACaptain()
 this.captainB = this.matchSetupService.getTeamBCaptain()

 console.log(this.captainA)
}


getDismissalText(player: any): string {

  if (!player.dismissalType) {
    return 'Not Out';
  }

  if (player.dismissalType === 'caught') {

    if (player.caughtBy === player.dismissedBy) {
      return `c & b ${player.dismissedBy}`;
    }

    return `c ${player.caughtBy} b ${player.dismissedBy}`;
  }

  if (player.dismissalType === 'bowled') {
    return `b ${player.dismissedBy}`;
  }

  if(player.dismissalType === 'offside'){
    return `b ${player.dismissedBy}`
  }

  return player.dismissalType;
}

}
