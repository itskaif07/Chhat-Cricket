import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  HeadToHeadSelection,
  HeadToHeadStats
} from '../shared/models/headtohead.model';

import { Player } from '../shared/models/player.model';

import { RetrievePlayersService } from '../services/retrievePlayer/retrieve-players-service';
import { MatchService } from '../services/matchService/match-service';

@Component({
  selector: 'app-head-to-head',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './head-to-head.html',
  styleUrl: './head-to-head.css',
})
export class HeadToHead implements OnInit {

  constructor(
    private playerService: RetrievePlayersService,
    private matchService: MatchService
  ) { }

  players: Player[] = [];
  matches: any[] = []


  // Selected players
  selectedPlayers: HeadToHeadSelection = {
    batsman: null,
    bowler: null
  };


  // Career H2H data
  careerH2H: HeadToHeadStats = {
    innings: 0,

    // Batting
    balls: 0,
    runs: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    battingAverage: 0,

    // Bowling
    runsConceded: 0,
    wickets: 0,
    dismissalTypes: {
      bowled: 0,
      caught: 0,
      offside: 0,
    },
    economy: 0,
    bowlingStrikeRate: 0,
    bowlingAverage: 0,
  };


  // Selector state
  isBatsmanSelectorOpen = false;
  isBowlerSelectorOpen = false;


  ngOnInit(): void {
    this.loadPlayers();

  }


  // Load all players
  loadPlayers(): void {

    this.playerService.getAllPlayers().subscribe({
      next: (players) => {
        this.players = players;
        // console.log(players)
        this.loadMatches()
      },

      error: (error) => {
        console.error('Failed to load players:', error);
      }
    });

  }

  getLatestMatch(): any | null {
    if (!this.matches || this.matches.length === 0) {
      return null;
    }

    return this.matches.reduce((latest, current) => {
      return current.createdAt > latest.createdAt
        ? current
        : latest;
    });
  }

  inspectLatestMatch(): void {

    const latestMatch = this.getLatestMatch();

    if (!latestMatch) {
      console.log('No match found');
      return;
    }

    console.log('LATEST MATCH:', latestMatch);

    this.findDeliveries(latestMatch);

  }

  findDeliveries(obj: any, path = 'match'): void {

    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {

      obj.forEach((item, index) => {
        this.findDeliveries(item, `${path}[${index}]`);
      });

      return;
    }

    Object.keys(obj).forEach(key => {

      const value = obj[key];

      if (key.toLowerCase().includes('deliver')) {

        console.log(`FOUND: ${path}.${key}`);
        console.log(value);

      }

      if (value && typeof value === 'object') {
        this.findDeliveries(value, `${path}.${key}`);
      }

    });
  }

  loadMatches(): void {
    this.matchService.retrieveMatches().subscribe({
      next: (data: any[]) => {

        this.matches = data;

        const latestMatch = this.getLatestMatch();

      },
      error: (error) => {
        console.error('Failed to load matches:', error);
      }
    });
  }


  // Open batsman selector
  openBatsmanSelector(): void {
    this.isBatsmanSelectorOpen = true;
  }


  // Open bowler selector
  openBowlerSelector(): void {
    this.isBowlerSelectorOpen = true;
  }


  // Select batsman
  selectBatsman(player: Player): void {
    this.selectedPlayers.batsman = player;
    this.isBatsmanSelectorOpen = false;
    this.calculateCareerH2H();
  }


  // Select bowler
  selectBowler(player: Player): void {
    this.selectedPlayers.bowler = player;
    this.isBowlerSelectorOpen = false;
    this.calculateCareerH2H();
  }


  // Close selectors
  closePlayerSelector(): void {
    this.isBatsmanSelectorOpen = false;
    this.isBowlerSelectorOpen = false;

  }


  // Calculate H2H
  calculateCareerH2H(): void {

    if (
      !this.selectedPlayers.batsman ||
      !this.selectedPlayers.bowler
    ) {
      this.resetH2H();
      return;
    }


  }


  // Reset H2H
  resetH2H(): void {

    this.careerH2H = {
      innings: 0,

      // Batting
      balls: 0,
      runs: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      battingAverage: 0,

      // Bowling
      runsConceded: 0,
      wickets: 0,
      dismissalTypes: {
        bowled: 0,
        caught: 0,
        offside: 0,
      },
      economy: 0,
      bowlingStrikeRate: 0,
      bowlingAverage: 0,
    };

  }

}