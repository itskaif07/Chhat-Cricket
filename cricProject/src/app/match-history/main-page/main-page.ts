import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/matchService/match-service';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage implements OnInit {

constructor(private matchService:MatchService){}

  Math = Math
matches:any[] = []

ngOnInit(){
  this.getMatches()
  console.log('fsdfas')
}

 getMatches(){
   this.matchService.retrieveMatches().subscribe((data:any)=>{
  this.matches = data
  console.log(data)
})

}

}
