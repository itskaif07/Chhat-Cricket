import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Player } from '../../../shared/models/player.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RetrievePlayersService } from '../../../services/retrievePlayer/retrieve-players-service';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';

@Component({
  selector: 'app-limited-select-players',
  imports: [CommonModule],
  templateUrl: './select-players.html',
  styleUrl: './select-players.css',
})
export class LimitedSelectPlayers implements OnInit {
  constructor(
    private RetrievePlayersService: RetrievePlayersService,
    private cdr: ChangeDetectorRef,
    private matchSetupService: MatchSetupService,
    private router: Router,
  ) {}

  players: Player[] = [];

  selectedPlayers: string[] = [];
  displayPlayers:string[] = []

  teamA: Player[] = [];
  teamB: Player[] = [];

  captainA: Player | null = null;
  captainB: Player | null = null;

  currentTurn: 'A' | 'B' = 'A';

  ngOnInit() {
    this.getPlayers();
  }

  async getPlayers() {
    try {
      this.RetrievePlayersService.getAllPlayers().subscribe((data:any)=>{
        this.players = data
      })
      this.cdr.detectChanges();
    } catch (e) {
      console.log(e);
    }
  }

  selectPlayer(player: Player) {
    const playerId = player.id;

    if (!playerId) return;

    // REMOVE FROM TEAM A
    if (this.teamA.some(p => p.id === playerId)) {

      this.teamA = this.teamA.filter(
        p => p.id !== playerId
      );

      this.selectedPlayers =
        this.selectedPlayers.filter(
          id => id !== playerId
        );

      return;
    }

    // REMOVE FROM TEAM B
    if (this.teamB.some(p => p.id === playerId)) {

      this.teamB = this.teamB.filter(
        p => p.id !== playerId
      );

      this.selectedPlayers =
        this.selectedPlayers.filter(
          id => id !== playerId
        );

      return;
    }

    // ADD TO CURRENT TEAM

    if (this.currentTurn === 'A') {

      this.teamA.push(player);

    } else {

      this.teamB.push(player);

    }

    this.selectedPlayers.push(playerId);
  }

  getAvailablePlayers() {
    if (this.currentTurn === 'A') {
      return this.players;
    }

    return this.players.filter(
      player =>
        !this.teamA.some(
          p => p.id === player.id
        )
    );
  }

  goToTeamB(){
    this.currentTurn = 'B'
  }



  getSelectionOrder(player: Player) {
    if (!player.id) return 0;

    return this.selectedPlayers.indexOf(player.id) + 1;
  }

  goToNextPage() {
    if (this.selectedPlayers.length < 4) return;

    this.matchSetupService.setTeams(this.teamA, this.teamB);
    this.getCaptains();
    this.saveMatchSetup();
    this.router.navigate(['/limited/toss']);
  }

  reset() {
    this.selectedPlayers = [];
    this.teamA = [];
    this.teamB = [];
    this.currentTurn = 'A';
  }

  getCaptains() {
    this.captainA = this.matchSetupService.getTeamACaptain();
    this.captainB = this.matchSetupService.getTeamBCaptain();
  }

  saveMatchSetup() {
    localStorage.setItem(
      'lastMatchSetup',
      JSON.stringify({
        teamA: this.teamA,
        teamB: this.teamB,
        teamACaptain: this.captainA,
        teamBCaptain: this.captainB,
      }),
    );
  }
}
