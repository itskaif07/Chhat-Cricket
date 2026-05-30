import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/matchService/match-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage implements OnInit {

constructor(private matchService:MatchService, private cdr: ChangeDetectorRef){}

  Math = Math
matches:any[] = []

ngOnInit(){
  this.getMatches()
}

 getMatches(){
   this.matchService.retrieveMatches().subscribe((data:any)=>{
  this.matches = data
  this.cdr.detectChanges()
  console.log(data)
})
}

formatDate(timestamp:number){

  return new Date(
    timestamp
  ).toLocaleDateString(
    'en-IN',
    {
      day:'numeric',
      month:'short',
      year:'numeric'
    }
  )

}

getMatchTime(timestamp:number){

  return new Date(
    timestamp
  ).toLocaleTimeString(
    'en-IN',
    {
      hour:'numeric',
      minute:'2-digit',

      hour12:true
    }
  )

}

}
