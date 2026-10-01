import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule, NgClass } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { RetrievePlayersService } from '../services/retrievePlayer/retrieve-players-service';
import { MatchService } from '../services/matchService/match-service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';

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
  editingFullName = false
  editingPhoto = false
  editingStyle = false
  editedDisplayName = '';
  editedFullName = ''
  editedPhoto = ''
  editedStyle = ''
  selectedFile: File | null = null
  previewPhoto: string | null = null


  careerStats: any = {}
  matches: any = 0;
  matchesCount: number = 0;
  isOrangeCapHolder: boolean = false
  isPurpleCapHolder: boolean = false
  mostRuns: any = {}
  mostWickets: any = 0

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private retrievePlayerService: RetrievePlayersService,
    private matchService: MatchService,
    private auth: Auth,
    private fireStore: Firestore,
    private storage: Storage
  ) { }

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id') || '';

    onAuthStateChanged(this.auth, (user) => {
      this.isAdmin = user?.uid === this.adminId
    })

    this.retrieveMatches()
    this.getPlayer();
    this.getStats();
  }

  getPlayer() {
    this.loading = true;
    this.retrievePlayerService.getPlayer(this.playerId).subscribe((data: any) => {
      this.player = data;
      console.log(data)
      this.editedDisplayName = this.player.displayName
      this.editedFullName = this.player.fullName
      this.editedPhoto = this.player.photoURL
      this.editedStyle = this.player.style
      this.loading = false;
      this.cdr.detectChanges();
    });
  }



  retrieveMatches() {
    this.matchService.retrieveMatches().subscribe((data) => {
      this.matches = data;
      this.matchesCount = data.length;
    });
    this.cdr.detectChanges()
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

  async UpdateStyle() {

    if (!this.isAdmin) {
      return
    }

    const newStyle = this.editedStyle === 'right' ? 'left' : 'right';

    try {
      const playerRef = doc(this.fireStore, 'players', this.playerId)
      await updateDoc(playerRef, { style: newStyle })

      this.editedStyle = newStyle;
      this.player.style = newStyle
      this.cdr.detectChanges();
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

  cancelStyleEdit() {

    this.editedStyle =
      this.player.style;

    this.editingStyle =
      false;

  }


  onPhotoSelected(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.previewPhoto =
        reader.result as string;

    };

    reader.readAsDataURL(file);
  }
  async savePhoto() {
    try {

      if (!this.selectedFile) return;

      const filePath =
        `players/${Date.now()}_${this.selectedFile.name}`;

      const storageRef =
        ref(this.storage, filePath);

      await uploadBytes(
        storageRef,
        this.selectedFile
      );

      const imageURL =
        await getDownloadURL(storageRef);

      await updateDoc(
        doc(this.fireStore, 'players', this.playerId),
        {
          photoURL: imageURL
        }
      );

      this.player.photoURL = imageURL;

      this.previewPhoto = null;
      this.selectedFile = null;

    } catch (e) {

      console.log(e);

    }
  }

  cancelPhotoEdit() {

    this.previewPhoto = null;
    this.selectedFile = null;

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
                  totalWides: 0,
                  totalNoBalls: 0,
                  recentRuns: [],
                  recentWickets: [],
                  dismissals: {
                    bowled: 0,
                    caught: 0,
                    offside: 0,
                    'retired-out': 0
                  },
                };
              }

              careerStats[playerId].totalRuns += stats.runs || 0;

              careerStats[playerId].totalFours += stats.fours || 0;

              careerStats[playerId].totalSixes += stats.sixes || 0;

              careerStats[playerId].totalWides += stats.wides || 0;

              careerStats[playerId].totalNoBalls += stats.noBalls || 0;

              careerStats[playerId].totalInnings += stats.innings || 0;

              careerStats[playerId].totalBallsFaced += stats.ballsFaced || 0;

              careerStats[playerId].totalFifties += stats.fifty || 0;

              careerStats[playerId].totalHundreds += stats.hundred || 0;

              careerStats[playerId].dismissed += stats.dismissalType ? 1 : 0;

              if (stats.dismissalType === 'bowled') {
                careerStats[playerId].dismissals.bowled++;
              }

              if (stats.dismissalType === 'caught') {
                careerStats[playerId].dismissals.caught++;
              }

              if (stats.dismissalType === 'offside') {
                careerStats[playerId].dismissals.offside++;
              }

              if (stats.dismissalType === 'retired-out') {
                careerStats[playerId].dismissals['retired-out']++;
              }

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

        this.dismissalBreakdown = {
          bowled: this.stats?.dismissals?.bowled || 0,
          caught: this.stats?.dismissals?.caught || 0,
          offside: this.stats?.dismissals?.offside || 0,
          retiredOut: this.stats?.dismissals?.['retired-out'] || 0,
          total:
            (this.stats?.dismissals?.bowled || 0) +
            (this.stats?.dismissals?.caught || 0) +
            (this.stats?.dismissals?.offside || 0) +
            (this.stats?.dismissals?.['retired-out'] || 0)
        };


        this.aggregateCareerStats();



        this.cdr.detectChanges();
      });
    } catch (error) {
      console.log(error);
    }
  }


  formatStat(value: any, fallback = '--') {
    return value && value > 0 ? value : fallback;
  }



  totalExtras(stats: any) {
    const wides = Number(stats?.totalWides || 0);
    const noBalls = Number(stats?.totalNoBalls || 0);
    return wides + noBalls;
  }



  aggregateCareerStats() {
    this.careerStats = {};

    this.matches.forEach((match: any) => {
      match.innings.forEach((innings: any) => {
        Object.entries(innings.playerStats || {}).forEach(([playerId, stats]: any) => {
          if (!this.careerStats[playerId]) {
            this.careerStats[playerId] = {
              playerId,

              playerName: stats.playerName,

              playerPhoto: stats.playerPhoto,

              totalRuns: 0,

              totalWickets: 0,

            };
          }

          this.careerStats[playerId].totalRuns += stats.runs || 0;

          this.careerStats[playerId].totalWickets += stats.wickets || 0;

        });
      });
    });

    this.getOrangeCap()
    this.getPurpleCap()
    this.cdr.detectChanges();
  }

  dismissalBreakdown = {
    total: 0,
    bowled: 0,
    caught: 0,
    offside: 0,
    retiredOut: 0
  };

  getDismissalPercentage(count: number): string {
    if (!this.dismissalBreakdown.total) return '0.00';

    return (
      (count / this.dismissalBreakdown.total) * 100
    ).toFixed(2);
  }

  getDismissalChart(): string {
    const total = this.dismissalBreakdown.total;

    if (!total) {
      return 'conic-gradient(#1f2937 0% 100%)';
    }

    const bowled = (this.dismissalBreakdown.bowled / total) * 100;
    const caught = (this.dismissalBreakdown.caught / total) * 100;
    const offside = (this.dismissalBreakdown.offside / total) * 100;

    const bowledEnd = bowled;
    const caughtEnd = bowled + caught;
    const offsideEnd = caughtEnd + offside;
    const retiredOutEnd = bowled + caughtEnd + offsideEnd

    return `
   conic-gradient(
  #EF4444 0% ${bowledEnd}%,        /* bg-red-500 */
  #1D4ED8 ${bowledEnd}% ${caughtEnd}%, /* bg-blue-700 */
  #FBBF24 ${caughtEnd}% ${offsideEnd}%, /* bg-amber-400 */
  #6B7280 ${offsideEnd}% 100%       /* bg-gray-500 */
)
  `;
  }

  getOrangeCap() {


    this.mostRuns = Object.values(this.careerStats).sort(
      (a: any, b: any) => b.totalRuns - a.totalRuns,
    )[0];

  }

  getPurpleCap() {
    this.mostWickets = Object.values(this.careerStats).sort(
      (a: any, b: any) => b.totalWickets - a.totalWickets,
    )[0];
  }

  get battingAverage() {
    if (!this.stats?.totalRuns) {
      return '--';
    }

    if (!this.stats?.dismissed) {
      return this.stats?.totalRuns;
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

    return (this.stats.totalRunsConceded / (this.stats.totalBallsDelivered / 6)).toFixed(2);
  }

  get bowlingAverage() {
    if (!this.stats?.totalRunsConceded || !this.stats?.totalWickets) {
      return '--';
    }

    return (this.stats.totalRunsConceded / this.stats.totalWickets).toFixed(2);
  }


}
