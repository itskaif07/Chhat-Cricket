import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/matchService/match-service';

@Component({
  selector: 'app-scorecard',
  imports: [],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css',
})
export class Scorecard implements OnInit{

  constructor(private route: ActivatedRoute, private matchService:MatchService, private cdr: ChangeDetectorRef){}

  matchData:any = []
  selectedInnings:any;
  Object = Object;

  ngOnInit(){

    this.getData()

}

getData(){
    const id =
  this.route.snapshot.paramMap.get('id')

  if(id){

    this.matchService
    .getMatchById(id)
    .subscribe((data)=>{

      console.log(data)

      this.matchData = data

      this.selectedInnings = this.matchData.innings[1]
      
      console.log(this.selectedInnings)
      this.cdr.detectChanges()
    })
    
  }


}

getPlayers(playerStats:any): any[] {

  return Object.values(playerStats || {})

}


setInnings(index:number){

  this.selectedInnings =
  this.matchData.innings[index]

  console.log(
    'INNING',
    index + 1,
    this.selectedInnings.playerStats
  )

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
