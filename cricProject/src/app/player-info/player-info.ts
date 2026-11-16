import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule, NgClass } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { RetrievePlayersService } from '../services/retrievePlayer/retrieve-players-service';
import { MatchService } from '../services/matchService/match-service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { SeoService } from '../seoService/seo-service';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';

@Component({
  selector: 'app-player-info',
  imports: [FormsModule, CommonModule, NgClass, ImageCropperComponent],
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

  selectedFile: File | null = null;
  previewPhoto: string | SafeUrl | null = null;
  activeBadgeDescription: string | null = null;

  // Image crop editor
  cropperFile: File | null = null;
  croppedBlob: Blob | null = null;
  cropPreview: SafeUrl | null = null;
  showCropper = false;

  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0,
  };


  careerStats: any = {}
  matches: any = 0;
  matchesCount: number = 0;
  isOrangeCapHolder: boolean = false
  isPurpleCapHolder: boolean = false
  isHighestScoreNotOut: boolean = false
  mostRuns: any = {}
  mostWickets: any = 0

  playerArchetypes: {
    name: string;
    category: 'Batting' | 'Bowling' | 'All-Rounder' | 'Impact';
    description: string;
  }[] = [];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private retrievePlayerService: RetrievePlayersService,
    private matchService: MatchService,
    private auth: Auth,
    private fireStore: Firestore,
    private storage: Storage,
    private router: Router,
    private sanitizer: DomSanitizer,
    private seoService: SeoService
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

  setSEO() {
    if (!this.player) {
      return
    }

    this.seoService.setPage(
      `${this.player.displayName || this.player.fullName} | Player Profile & Stats | Chhat Cricket`,
      `View ${this.player.displayName || this.player.fullName}'s batting, bowling, match history and cricket statistics on Chhat Cricket.`,
      this.router.url
    );
  }

  getPlayer() {
    this.loading = true;
    this.retrievePlayerService.getPlayer(this.playerId).subscribe((data: any) => {
      this.player = data;
      this.setSEO()
      console.log(data)
      this.editedDisplayName = this.player.displayName
      this.editedFullName = this.player.fullName
      this.editedPhoto = this.player.photoURL
      this.editedStyle = this.player.style
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  toggleBadgeDescription(name: string): void {
    this.activeBadgeDescription =
      this.activeBadgeDescription === name ? null : name;
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


  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image.');
      input.value = '';
      return;
    }

    this.cropperFile = file;
    this.croppedBlob = null;
    this.cropPreview = null;

    this.transform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0,
    };

    this.showCropper = true;

    // Same image can be selected again later.
    input.value = '';
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (!event.blob || !event.objectUrl) return;

    this.croppedBlob = event.blob;
    this.cropPreview = this.sanitizer.bypassSecurityTrustUrl(
      event.objectUrl,
    );
  }

  zoomIn(): void {
    const scale = this.transform.scale ?? 1;

    this.transform = {
      ...this.transform,
      scale: Math.min(3, Number((scale + 0.15).toFixed(2))),
    };
  }

  zoomOut(): void {
    const scale = this.transform.scale ?? 1;

    this.transform = {
      ...this.transform,
      scale: Math.max(0.7, Number((scale - 0.15).toFixed(2))),
    };
  }

  resetCrop(): void {
    this.transform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0,
    };
  }

  useCroppedPhoto(): void {
    if (!this.croppedBlob || !this.cropPreview) return;

    this.selectedFile = new File(
      [this.croppedBlob],
      `player-photo-${Date.now()}.jpg`,
      { type: 'image/jpeg' },
    );

    this.previewPhoto = this.cropPreview;
    this.showCropper = false;
    this.cropperFile = null;
  }

  cancelCrop(): void {
    this.showCropper = false;
    this.cropperFile = null;
    this.croppedBlob = null;
    this.cropPreview = null;
  }

  loadImageFailed(): void {
    this.showCropper = false;
    this.cropperFile = null;

    alert('Image could not be loaded. Please select another image.');
  }


  async savePhoto(): Promise<void> {
    if (!this.selectedFile) return;

    try {
      const filePath =
        `players/${Date.now()}_${this.selectedFile.name}`;

      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, this.selectedFile);

      const imageURL = await getDownloadURL(storageRef);

      await updateDoc(
        doc(this.fireStore, 'players', this.playerId),
        { photoURL: imageURL },
      );

      this.player.photoURL = imageURL;

      this.previewPhoto = null;
      this.selectedFile = null;
      this.cropperFile = null;
      this.croppedBlob = null;
      this.cropPreview = null;
      this.showCropper = false;

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to update player photo:', error);
      alert('Photo update failed. Please try again.');
    }
  }

  cancelPhotoEdit(): void {
    this.previewPhoto = null;
    this.selectedFile = null;

    this.cropperFile = null;
    this.croppedBlob = null;
    this.cropPreview = null;
    this.showCropper = false;
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
                  totalMotmAwards: 0,
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

              const runs = Number(stats.runs || 0);
              const isNotOut = !stats.dismissalType && runs > 0;

              if (runs > careerStats[playerId].highestScore) {
                careerStats[playerId].highestScore = runs;
                careerStats[playerId].highestScoreNotOut = isNotOut;
              } else if (
                runs === careerStats[playerId].highestScore &&
                isNotOut
              ) {
                careerStats[playerId].highestScoreNotOut = true;
              }

              careerStats[playerId].totalWickets += stats.wickets || 0;

              careerStats[playerId].totalBallsDelivered += stats.ballsDelivered || 0;

              careerStats[playerId].totalRunsConceded += stats.runsConceded || 0;

              careerStats[playerId].totalMaidens += stats.maiden || 0;

              careerStats[playerId].totalHattricks += stats.hatTricks || 0;

              careerStats[playerId].totalFifers += stats.fifers || stats.fifer || 0;

            });
          });

          matchPlayers.forEach((playerId: string) => {
            careerStats[playerId].totalMatches++;
          });

          // Once per match, not once per player
          const motmPlayerId = match.motm?.playerId;

          if (motmPlayerId && careerStats[motmPlayerId]) {
            careerStats[motmPlayerId].totalMotmAwards++;
          }
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
        this.calculatePlayerArchetypes(careerStats);



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



  calculatePlayerArchetypes(allCareerStats: Record<string, any>): void {
    const s = this.stats || {};

    const allPlayers = Object.values(allCareerStats || {}) as any[];

    // Minimum participation safeguards, not performance thresholds.
    const batters = allPlayers.filter(
      p => p.totalInnings >= 3 && p.totalBallsFaced >= 12
    );

    const bowlers = allPlayers.filter(
      p => p.totalBallsDelivered >= 12
    );

    const motmPlayers = allPlayers.filter(
      p => p.totalMatches >= 3
    );

    // Relative percentile rank.
    // Higher is better by default.
    // For economy, average and bowling strike rate, lower is better.
    const rank = (
      value: number,
      population: number[],
      higherIsBetter = true
    ): number => {
      const valid = population.filter(Number.isFinite);

      if (valid.length < 4 || !Number.isFinite(value)) return 0;

      const count = valid.filter(candidate =>
        higherIsBetter
          ? candidate <= value
          : candidate >= value
      ).length;

      return count / valid.length;
    };

    const mean = (values: number[]): number => {
      const valid = values.filter(Number.isFinite);
      return valid.length
        ? valid.reduce((sum, value) => sum + value, 0) / valid.length
        : 0;
    };

    // ==========================================
    // METRICS
    // ==========================================

    const battingAverage = (p: any) =>
      p.dismissed > 0
        ? p.totalRuns / p.dismissed
        : p.totalRuns;

    const runsPerInnings = (p: any) =>
      p.totalInnings > 0
        ? p.totalRuns / p.totalInnings
        : 0;

    const strikeRate = (p: any) =>
      p.totalBallsFaced > 0
        ? (p.totalRuns / p.totalBallsFaced) * 100
        : 0;

    const sixRate = (p: any) =>
      p.totalBallsFaced > 0
        ? (p.totalSixes / p.totalBallsFaced) * 100
        : 0;

    const fourRate = (p: any) =>
      p.totalBallsFaced > 0
        ? (p.totalFours / p.totalBallsFaced) * 100
        : 0;

    const wicketsPerMatch = (p: any) =>
      p.totalMatches > 0
        ? p.totalWickets / p.totalMatches
        : 0;

    const economy = (p: any) =>
      p.totalBallsDelivered > 0
        ? (p.totalRunsConceded / p.totalBallsDelivered) * 6
        : Infinity;

    const bowlingAverage = (p: any) =>
      p.totalWickets > 0
        ? p.totalRunsConceded / p.totalWickets
        : Infinity;

    const bowlingStrikeRate = (p: any) =>
      p.totalWickets > 0
        ? p.totalBallsDelivered / p.totalWickets
        : Infinity;

    const motmRate = (p: any) =>
      p.totalMatches > 0
        ? p.totalMotmAwards / p.totalMatches
        : 0;

    // ==========================================
    // RELATIVE RANK HELPERS
    // ==========================================

    const battingRank = (metric: (p: any) => number, player = s) =>
      rank(
        metric(player),
        batters.map(metric)
      );

    const bowlingRank = (
      metric: (p: any) => number,
      player = s,
      higherIsBetter = true
    ) =>
      rank(
        metric(player),
        bowlers.map(metric),
        higherIsBetter
      );

    const badges: typeof this.playerArchetypes = [];

    const addBadge = (
      name: string,
      category: typeof this.playerArchetypes[number]['category'],
      description: string
    ) => {
      badges.push({ name, category, description });
    };

    const hasBattingSample =
      s.totalInnings >= 3 && s.totalBallsFaced >= 12;

    const hasBowlingSample =
      s.totalBallsDelivered >= 12;

    // ==========================================
    // BATTING ARCHETYPES
    // ==========================================

    if (hasBattingSample && batters.length >= 4) {

      const runRank = battingRank(runsPerInnings);
      const averageRank = battingRank(battingAverage);
      const strikeRank = battingRank(strikeRate);
      const sixRank = battingRank(sixRate);
      const fourRank = battingRank(fourRate);

      const totalRunsRank = battingRank(
        p => p.totalRuns
      );

      // RUN MACHINE
      if (
        totalRunsRank >= 0.75 &&
        runRank >= 0.50
      ) {
        addBadge(
          'Run Machine',
          'Batting',
          'Among the leading run scorers.'
        );
      }

      // BRUTE
      if (
        strikeRank >= 0.75 &&
        runRank >= 0.50
      ) {
        addBadge(
          'Brute',
          'Batting',
          'Among the most aggressive batters by strike rate.'
        );
      }

      // ANCHOR
      if (
        averageRank >= 0.75 &&
        runRank >= 0.50
      ) {
        addBadge(
          'Anchor',
          'Batting',
          'Among the most consistent batters by career average.'
        );
      }

      // SIX MACHINE
      if (
        s.totalSixes > 0 &&
        sixRank >= 0.75
      ) {
        addBadge(
          'Six Machine',
          'Batting',
          'Among the most frequent six hitters.'
        );
      }

      // FOUR SPECIALIST
      if (
        s.totalFours > 0 &&
        s.totalFours > s.totalSixes &&
        fourRank >= 0.75
      ) {
        addBadge(
          'Four Specialist',
          'Batting',
          'Among the most frequent four hitters.'
        );
      }
    }

    // ==========================================
    // BOWLING ARCHETYPES
    // ==========================================

    if (hasBowlingSample && bowlers.length >= 4) {

      const wicketsRank = bowlingRank(wicketsPerMatch);
      const averageRank = bowlingRank(bowlingAverage, s, false);
      const strikeBowlingRank = bowlingRank(bowlingStrikeRate, s, false);
      const economyRank = bowlingRank(economy, s, false);

      // WICKET HUNTER
      if (
        s.totalWickets > 0 &&
        wicketsRank >= 0.75 &&
        averageRank >= 0.50
      ) {
        addBadge(
          'Wicket Hunter',
          'Bowling',
          'Among the leading wicket takers relative to matches played.'
        );
      }

      // STRIKE BOWLER
      if (
        s.totalWickets > 0 &&
        strikeBowlingRank >= 0.75
      ) {
        addBadge(
          'Strike Bowler',
          'Bowling',
          'Takes wickets at an excellent rate of deliveries.'
        );
      }

      // ECONOMY KING
      if (
        economyRank >= 0.75
      ) {
        addBadge(
          'Economy King',
          'Bowling',
          'Among the most economical bowlers.'
        );
      }
    }

    // ==========================================
    // ALL-ROUND ARCHETYPES
    // ==========================================

    if (
      hasBattingSample &&
      hasBowlingSample &&
      batters.length >= 4 &&
      bowlers.length >= 4
    ) {

      const battingStrength = mean([
        battingRank(runsPerInnings),
        battingRank(battingAverage),
        battingRank(strikeRate)
      ]);

      const bowlingStrength = mean([
        bowlingRank(wicketsPerMatch),
        bowlingRank(economy, s, false),
        bowlingRank(bowlingAverage, s, false)
      ]);

      const difference = battingStrength - bowlingStrength;

      // ELITE ALL-ROUNDER
      if (
        battingStrength >= 0.80 &&
        bowlingStrength >= 0.80
      ) {
        addBadge(
          'Elite All-Rounder',
          'All-Rounder',
          'Ranks among the best performers in both batting and bowling.'
        );
      }

      // BATTING ALL-ROUNDER
      if (
        battingStrength >= 0.65 &&
        bowlingStrength >= 0.40 &&
        difference > 0.10
      ) {
        addBadge(
          'Batting All-Rounder',
          'All-Rounder',
          'A stronger batter who also contributes with the ball.'
        );
      }

      // BOWLING ALL-ROUNDER
      if (
        bowlingStrength >= 0.65 &&
        battingStrength >= 0.40 &&
        difference < -0.10
      ) {
        addBadge(
          'Bowling All-Rounder',
          'All-Rounder',
          'A stronger bowler who also contributes with the bat.'
        );
      }

      // BALANCED
      if (
        battingStrength >= 0.50 &&
        bowlingStrength >= 0.50 &&
        Math.abs(difference) <= 0.20
      ) {
        addBadge(
          'Balanced',
          'All-Rounder',
          'Makes comparable contributions with both bat and ball.'
        );
      }
    }

    // ==========================================
    // IMPACT ARCHETYPE
    // ==========================================

    if (
      s.totalMatches >= 3 &&
      s.totalMotmAwards > 0 &&
      motmPlayers.length >= 4
    ) {

      const motmRank = rank(
        motmRate(s),
        motmPlayers.map(motmRate)
      );

      if (motmRank >= 0.75) {
        addBadge(
          'Match Winner',
          'Impact',
          'Ranks among the leading players in MOTM awards per match.'
        );
      }
    }

    this.playerArchetypes = badges;
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
