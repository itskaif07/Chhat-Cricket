import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';
import { Player } from '../../../shared/models/player.model';

@Component({
  selector: 'app-toss-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './toss-page.html',
  styleUrl: './toss-page.css',
})
export class TossPage {

  constructor(private cdr: ChangeDetectorRef, private matchSetupService: MatchSetupService){}

  tossResult:string = ''
  isTossing:boolean = false
  isTossSkipped:boolean = false
  TeamAChoice: "H" | "T" | "" = ""
  tossWinner: "A" | "B" | "" = ""
  decisionTeam: "A" | "B" | "" = ""
  tossDecision: "bat" | "bowl" | "" = ""
  battingTeam: "A" | "B" | "" = ""

  totalPlayers: Player[] = []
  tossWinnerTeam: Player[] = []

  


  tossCoin(){
    if (!this.TeamAChoice || this.isTossing) return;

    this.isTossing = true
    this.tossResult = ''
    this.tossWinner = ''
    this.decisionTeam = ''
    this.tossDecision = ''
    this.battingTeam = ''

    setTimeout(() => {
      this.tossResult = Math.random() > 0.5 ? 'H' : 'T'
      this.tossWinner = this.tossResult === this.TeamAChoice ? 'A' : 'B'
        this.matchSetupService
    .setMatchTossWinner(this.tossWinner)
      this.decisionTeam = this.tossWinner
      this.isTossing = false
      this.cdr.detectChanges()
    }, 1000);
    
    this.cdr.detectChanges()
  }

  skipToss() {
    this.isTossSkipped = true
    this.tossResult = ''
    this.tossWinner = ''
    this.decisionTeam = ''
    this.tossDecision = ''
    this.battingTeam = ''
  }

chooseDecision(
  decision: "bat" | "bowl"
) {

  if (!this.decisionTeam) return;

  this.tossDecision = decision

  if (decision === 'bat') {

    this.battingTeam =
      this.decisionTeam

  }

  else {

    this.battingTeam =
      this.decisionTeam === 'A'
      ? 'B'
      : 'A'

  }

  this.matchSetupService
    .setFirstBattingTeam(
      this.battingTeam
    )

}

  selectBattingTeam(team: "A" | "B") {
    this.battingTeam = team
    this.matchSetupService.firstBattingTeam = team
  }


}
