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


  calculateCareerH2H(): void {

    const batsman = this.selectedPlayers.batsman;
    const bowler = this.selectedPlayers.bowler;

    if (!batsman || !bowler) {
      this.resetH2H();
      return;
    }

    // All deliveries between this batsman and bowler
    const h2hDeliveries = this.matches
      .flatMap((match: any) => match.deliveries || [])
      .filter((delivery: any) =>
        delivery.batsmanId === batsman.id &&
        delivery.bowlerId === bowler.id
      );

    // No recorded H2H data
    if (h2hDeliveries.length === 0) {
      this.resetH2H();
      return;
    }

    // -----------------------------
    // BASIC BATTING STATS
    // -----------------------------

    const balls = h2hDeliveries.filter(
      (delivery: any) => delivery.legalBall
    ).length;

    const runs = h2hDeliveries.reduce(
      (total: number, delivery: any) =>
        total + (delivery.batterRuns || 0),
      0
    );

    const fours = h2hDeliveries.filter(
      (delivery: any) =>
        delivery.type === 'four' ||
        delivery.batterRuns === 4
    ).length;

    const sixes = h2hDeliveries.filter(
      (delivery: any) =>
        delivery.type === 'six' ||
        delivery.batterRuns === 6
    ).length;


    // -----------------------------
    // WICKETS
    // -----------------------------

    const wicketDeliveries = h2hDeliveries.filter(
      (delivery: any) =>
        delivery.wicket === true &&
        delivery.dismissedBatsmanId === batsman.id &&
        (
          delivery.dismissalType === 'bowled' ||
          delivery.dismissalType === 'caught' ||
          delivery.dismissalType === 'offside'
        )
    );

    const wickets = wicketDeliveries.length;


    // -----------------------------
    // DISMISSAL BREAKDOWN
    // -----------------------------

    const bowled = wicketDeliveries.filter(
      (delivery: any) =>
        delivery.dismissalType === 'bowled'
    ).length;

    const caught = wicketDeliveries.filter(
      (delivery: any) =>
        delivery.dismissalType === 'caught'
    ).length;

    const offside = wicketDeliveries.filter(
      (delivery: any) =>
        delivery.dismissalType === 'offside'
    ).length;


    // -----------------------------
    // BOWLING STATS
    // -----------------------------

    const runsConceded = h2hDeliveries.reduce(
      (total: number, delivery: any) =>
        total + (delivery.totalRuns || 0),
      0
    );


    // -----------------------------
    // UNIQUE INNINGS
    // -----------------------------

    const inningsSet = new Set<string>();

    this.matches.forEach((match: any) => {

      const deliveries = match.deliveries || [];

      deliveries.forEach((delivery: any) => {

        if (
          delivery.batsmanId === batsman.id &&
          delivery.bowlerId === bowler.id
        ) {

          const matchId =
            match.id ||
            match.createdAt ||
            'unknown';

          inningsSet.add(
            `${matchId}-${delivery.innings}`
          );

        }

      });

    });

    const innings = inningsSet.size;


    // -----------------------------
    // CALCULATIONS
    // -----------------------------

    const strikeRate =
      balls > 0
        ? (runs / balls) * 100
        : 0;

    const battingAverage =
      wickets > 0
        ? runs / wickets
        : 0;

    const economy =
      balls > 0
        ? runsConceded / (balls / 6)
        : 0;

    const bowlingStrikeRate =
      wickets > 0
        ? balls / wickets
        : 0;

    const bowlingAverage =
      wickets > 0
        ? runsConceded / wickets
        : 0;


    // -----------------------------
    // UPDATE UI
    // -----------------------------

    this.careerH2H = {

      innings,

      // Batting
      balls,
      runs,
      fours,
      sixes,
      strikeRate,
      battingAverage,

      // Bowling
      runsConceded,
      wickets,
      dismissalTypes: {
        bowled,
        caught,
        offside
      },
      economy,
      bowlingStrikeRate,
      bowlingAverage
    };

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