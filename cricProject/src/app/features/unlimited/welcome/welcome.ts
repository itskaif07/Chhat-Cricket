import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';
import { Player } from '../../../shared/models/player.model';

type SavedMatchSetup = {
  teamA: Player[];
  teamB: Player[];
  teamACaptain?: Player | null;
  teamBCaptain?: Player | null;
}

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit {

  hasPreviousSetup = false
  previousSetup: SavedMatchSetup | null = null

  constructor(
    private matchSetupService: MatchSetupService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPreviousSetup()
  }

  loadPreviousSetup() {
    const savedSetup =
      localStorage.getItem('lastMatchSetup')

    if (!savedSetup) return;

    try {
      const parsedSetup =
        JSON.parse(savedSetup) as SavedMatchSetup

      if (
        parsedSetup.teamA?.length &&
        parsedSetup.teamB?.length
      ) {
        this.previousSetup = parsedSetup
        this.hasPreviousSetup = true
      }
    }
    catch(error) {
      console.log(error)
      localStorage.removeItem('lastMatchSetup')
    }
  }

  continuePreviousSetup() {
    if (!this.previousSetup) return;

    this.matchSetupService.restoreTeams(
      this.previousSetup.teamA,
      this.previousSetup.teamB,
      this.previousSetup.teamACaptain || null,
      this.previousSetup.teamBCaptain || null
    )

    this.router.navigate(['/unlimited/toss'])
  }

  startNewSetup() {
    this.router.navigate(['/unlimited/select-players'])
  }

}
