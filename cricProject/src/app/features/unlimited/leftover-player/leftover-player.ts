import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Player } from '../../../shared/models/player.model';
import { RetrievePlayersService } from '../../../services/retrievePlayer/retrieve-players-service';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';

@Component({
  selector: 'app-leftover-player',
  imports: [RouterLink, CommonModule],
  templateUrl: './leftover-player.html',
  styleUrl: './leftover-player.css',
})
export class LeftoverPlayer implements OnInit {
  reservedPlayerExist: boolean = false;
  players: Player[] = [];
  leftOverPlayers: Player[] = [];
  selectedPlayers: Player[] = [];
  selectedLeftOverPlayer: Player | null = null;

  constructor(
    private retrievePlayersService: RetrievePlayersService,
    private cdr: ChangeDetectorRef,
    private matchSetupService: MatchSetupService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getPlayers();
  }

  getLeftOverPlayers() {
    try {
      this.selectedPlayers = this.matchSetupService.getSelectedPlayers();
      const selectedPlayersIds = this.selectedPlayers.map((player) => player.id);
      this.leftOverPlayers = this.players.filter(
        (player) => !selectedPlayersIds.includes(player.id),
      );
      this.cdr.detectChanges();
    } catch (e) {
      console.log(e);
    }
  }

  async getPlayers() {
    try {
      this.players = await this.retrievePlayersService.getAllPlayers();
      this.getLeftOverPlayers();
      this.cdr.detectChanges();
    } catch (e) {
      console.log(e);
    }
  }

  selectLeftOverPlayer(player: Player) {
    this.selectedLeftOverPlayer = player;
    this.cdr.detectChanges();
  }

  startMatch() {
    if (this.selectedLeftOverPlayer) {
      this.matchSetupService.setLeftOverPlayerToBattingTeam(this.selectedLeftOverPlayer);
    }

    this.router.navigate(['/unlimited/live-match']);
  }
}
