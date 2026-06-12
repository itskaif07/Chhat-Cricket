import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule, NgClass } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { RetrievePlayersService } from '../services/retrievePlayer/retrieve-players-service';
import { MatchService } from '../services/matchService/match-service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-info',
  imports: [FormsModule, CommonModule, NgClass],
  templateUrl: './player-info.html',
  styleUrl: './player-info.css',
})
export class PlayerInfo implements OnInit {
  player: any = null;
  stats: any = null;
  playerId = '';
  loading = false;
  adminId: string = 'BYoCGh5dXHSeTq73hWKFyZC1Upe2'
  isAdmin = false
  editingDisplayName = false;
  editedDisplayName = '';
  editingFullName = false
  editedFullName = ''
  editingPhoto = false
  editedPhoto = ''

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private retrievePlayerService: RetrievePlayersService,
    private matchService: MatchService,
    private auth: Auth,
    private fireStore: Firestore
  ) { }

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id') || '';

    onAuthStateChanged(this.auth, (user) => {
      this.isAdmin = user?.uid === this.adminId
    })

    this.getPlayer();
    this.getStats();
  }
  getPlayer() {
    this.loading = true;
    this.retrievePlayerService.getPlayer(this.playerId).subscribe((data: any) => {
      this.player = data;
      this.editedDisplayName = this.player.displayName
      this.editedFullName = this.player.fullName
      this.editedPhoto = this.player.photoURL
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  async UpdateDisplayName() {
    try {
      const playerRef = doc(this.fireStore, 'players', this.playerId)

      await updateDoc(playerRef, { displayName: this.editedDisplayName })
      this.player.displayName = this.editedDisplayName
      this.editingDisplayName = false
    }
    catch (e) {
      console.log(e)
    }

  }

  async UpdateFullName() {
    try {
      const playerRef = doc(this.fireStore, 'players', this.playerId)
      await updateDoc(playerRef, { fullName: this.editedFullName })
      this.player.fullName = this.editedFullName
      this.editingFullName = false
    }
    catch (e) {
      console.log(e)
    }
  }

  cancelDisplayNameEdit() {

    this.editedDisplayName =
      this.player.displayName;

    this.editingDisplayName =
      false;

  }

  cancelFullNameEdit() {

    this.editedFullName =
      this.player.fullName;

    this.editingFullName =
      false;

  }

  

  async getStats() {
    try {
      this.matchService.retrieveMatches().subscribe((matches: any[]) => {
        const careerStats: any = {};

        matches.forEach((match: any) => {
          const matchPlayers = new Set<string>();

          match.innings.forEach((innings: any) => {
            Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: any) => {
              matchPlayers.add(playerId);

              if (!careerStats[playerId]) {
                careerStats[playerId] = {
                  totalMatches: 0,
                  totalRuns: 0,
                  totalWickets: 0,
                  totalFours: 0,
                  totalSixes: 0,
                  totalInnings: 0,
                  totalBallsFaced: 0,
                  totalFifties: 0,
                  totalHundreds: 0,
                  dismissed: 0,
                  highestScore: 0,
                  totalRunsConceded: 0,
                  totalBallsDelivered: 0,
                  totalMaidens: 0,
                  totalHattricks: 0,
                  totalFifers: 0,
                };
              }

              careerStats[playerId].totalRuns += stats.runs || 0;

              careerStats[playerId].totalFours += stats.fours || 0;

              careerStats[playerId].totalSixes += stats.sixes || 0;

              careerStats[playerId].totalInnings += stats.innings || 0;

              careerStats[playerId].totalBallsFaced += stats.ballsFaced || 0;

              careerStats[playerId].totalFifties += stats.fifty || 0;

              careerStats[playerId].totalHundreds += stats.hundred || 0;

              careerStats[playerId].dismissed += stats.dismissalType ? 1 : 0;

              careerStats[playerId].highestScore = Math.max(
                careerStats[playerId].highestScore,
                stats.runs || 0,
              );

              careerStats[playerId].totalWickets += stats.wickets || 0;

              careerStats[playerId].totalBallsDelivered += stats.ballsDelivered || 0;

              careerStats[playerId].totalRunsConceded += stats.runsConceded || 0;

              careerStats[playerId].totalMaidens += stats.maiden || 0;

              careerStats[playerId].totalHattricks += stats.hatTricks || 0;

              careerStats[playerId].totalFifers += stats.fifers || stats.fifer || 0;
            });
          });

          matchPlayers.forEach((playerId: any) => {
            careerStats[playerId].totalMatches++;
          });
        });

        this.stats = careerStats[this.playerId] || {};

        this.cdr.detectChanges();
      });
    } catch (error) {
      console.log(error);
    }
  }

  formatStat(value: any, fallback = '--') {
    return value && value > 0 ? value : fallback;
  }

  get battingAverage() {
    if (!this.stats?.totalRuns) {
      return '--';
    }

    if (!this.stats?.dismissed) {
      return 'NO';
    }

    return (this.stats.totalRuns / this.stats.dismissed).toFixed(2);
  }

  get strikeRate() {
    if (!this.stats?.totalRuns || !this.stats?.totalBallsFaced) {
      return '--';
    }

    return ((this.stats.totalRuns / this.stats.totalBallsFaced) * 100).toFixed(2);
  }

  get oversBowled() {
    const balls = this.stats?.totalBallsDelivered || 0;

    if (!balls) {
      return '--';
    }

    return `${Math.floor(balls / 6)}.${balls % 6}`;
  }

  get economy() {
    if (!this.stats?.totalRunsConceded || !this.stats?.totalBallsDelivered) {
      return '--';
    }

    return (this.stats.totalRunsConceded / (this.stats.totalBallsDelivered / 6)).toFixed(1);
  }

  get bowlingAverage() {
    if (!this.stats?.totalRunsConceded || !this.stats?.totalWickets) {
      return '--';
    }

    return (this.stats.totalRunsConceded / this.stats.totalWickets).toFixed(2);
  }
}
