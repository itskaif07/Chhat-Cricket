import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
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
  constructor(
    private cdr: ChangeDetectorRef,
    private matchSetupService: MatchSetupService,
  ) {
    this.teamACaptain = this.matchSetupService.getTeamACaptain();

    this.teamBCaptain = this.matchSetupService.getTeamBCaptain();
  }

  battingTeam: 'A' | 'B' | '' = '';

  teamACaptain: Player | null = null;

  teamBCaptain: Player | null = null;

  selectBattingTeam(team: 'A' | 'B') {
    this.battingTeam = team;
    this.matchSetupService.setFirstBattingTeam(team);
    this.matchSetupService.setFirstBowlingTeam(team === 'A' ? 'B' : 'A');
    this.cdr.detectChanges();
  }
}
