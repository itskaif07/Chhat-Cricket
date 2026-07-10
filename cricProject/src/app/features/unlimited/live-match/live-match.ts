import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchSetupService } from '../../../services/MatchSetup/match-setup-service';
import { Player } from '../../../shared/models/player.model';
import { CommonModule } from '@angular/common';
import { PlayerStats } from '../../../shared/models/playerStats.model';
import { Router, RouterLink } from '@angular/router';
import { MatchService } from '../../../services/matchService/match-service';
import { OfflinePersistanceService } from '../../../services/offline-persistance/offline-persistance-service';
import { VoiceAnnouncementService } from '../../../services/voiceAnnouncement/voice-announcement-service';
import { RetrievePlayersService } from '../../../services/retrievePlayer/retrieve-players-service';

@Component({
  selector: 'app-live-match',
  imports: [CommonModule],
  templateUrl: './live-match.html',
  styleUrl: './live-match.css',
})
export class LiveMatch implements OnInit {
  constructor(
    private matchSetupService: MatchSetupService,
    private cdr: ChangeDetectorRef,
    private matchService: MatchService,
    private router: Router,
    private offlinePersistanceService: OfflinePersistanceService,
    private voiceAnnouncementService: VoiceAnnouncementService,
    private registeredPlayers: RetrievePlayersService
  ) { }

  allSelectedPlayers: Player[] = [];
  allRegisteredPlayers: Player[] | null = null
  teamA: Player[] = [];
  teamB: Player[] = [];
  outPlayersIds: string[] = [];
  retiredHurtPlayers: Player[] = [];
  unselectedPlayers: Player[] = []
  playerStats: { [playerId: string]: PlayerStats } = {};

  tossWinner: 'A' | 'B' | '' = '';
  battingFirst: 'A' | 'B' | '' = '';
  bowlingFirst: 'A' | 'B' | '' = '';
  selectedExtraPlayerTeam: 'A' | 'B' | null = null

  currentInnings: 1 | 2 = 1;
  firstInningRuns: number = 0;
  firstInningsBalls: number = 0;
  firstInningsWickets: number = 0;
  firstInningsBattingTeam: Player[] | null = null
  firstInningsBowlingTeam: Player[] | null = null
  firstInningsPlayerStats: Record<string, PlayerStats> = {};
  wicketSnapshot: any = {}

  isInningsOver: boolean = false;
  showBatsmenDialog: boolean = false;
  showBowlerDialog: boolean = false;
  isWicketFallen = false;
  isOverComplete = false;
  canUndo: boolean = false;
  isShowingScoreCard: boolean = false;
  isDismissalDialogOpen: boolean = false;
  isShowingCatchingDialog: boolean = false;
  isShowingNoBallDialog: boolean = false
  showHatTrickAnimation = false;
  changeInningsDisplay: boolean = false
  isShowingMatchInfo: boolean = false
  isShowingExtraPlayerDialog: boolean = false

  captainA: Player | null = null;
  captainB: Player | null = null;

  dismissalType: 'caught' | 'bowled' | 'offside' | 'retired-out' | null = null;
  selectedNoBallRuns: 0 | 4 | 6 | null = null
  matchResult: 'won' | 'lost' | 'tie' | null = null;

  currentBatsman: Player | null = null;
  currentBowler: Player | null = null;

  selectedBatsman: Player | null = null;
  selectedBowler: Player | null = null;
  selectedExtraPlayer: Player | null = null

  matchHistory: any[] = [];

  //scores

  totalRuns: number = 0;
  totalWickets: number = 0;
  totalDeliveries: number = 0;
  recentDeliveries: { value: string; type: string, bowlerId: string }[] = [];
  lastAction: string = '';

  currentBatsmanRuns: number = 0;
  currentBatsmanBalls: number = 0;

  currentBowlerWickets: number = 0;
  currentBowlerBalls: number = 0;
  currentBowlerRunsConceded: number = 0;



  Math = Math;

  ngOnInit() {
    this.startMatch()
    const restored = this.restoreMatchState();

    if (restored) {
      return;
    }

    this.getAllSelectedPlayers();
    this.initializePlayerStats();
    this.getCaptains();
  }

  startMatch() {
    const savedMatch = this.offlinePersistanceService.loadMatch();

    if (savedMatch) {
      // Resume
      this.showBatsmenDialog = false;
      this.showBowlerDialog = false;
    } else {
      // New Match
      this.showBatsmenDialog = true;
      this.showBowlerDialog = false;
    }
  }

  getAllSelectedPlayers() {
    this.allSelectedPlayers = this.matchSetupService.getSelectedPlayers();
    this.teamA = this.matchSetupService.getTeamA();
    this.teamB = this.matchSetupService.getTeamB();
    this.tossWinner = this.matchSetupService.tossWinner;
    this.battingFirst = this.matchSetupService.firstBattingTeam;
    this.cdr.detectChanges();
  }

  initializePlayerStats() {

    const allPlayers = [...this.teamA, ...this.teamB];

    allPlayers.forEach(player => {
      this.createPlayerStats(player);
    });

  }

  createPlayerStats(player: Player) {

    if (!player.id) return;

    this.playerStats[player.id] = {
      playerId: player.id,
      playerName: player.displayName,
      playerPhoto: player.photoURL || '',
      matches: 1,
      innings: 0,
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      ballsDelivered: 0,
      fours: 0,
      sixes: 0,
      runsConceded: 0,
      dismissalType: null,
      caughtBy: null,
      dismissedBy: '',
      hatTricks: 0,
      maiden: 0,
      fifer: 0,
      hasScoredFifty: false,
      fifty: 0,
      hasScoredHundred: false,
      hundred: 0,
      wides: 0,
      noBalls: 0,
      recentRuns: [],
      recentWickets: []
    };

  }

  get currentBattingTeam(): Player[] {
    if (this.currentInnings === 1) {
      return this.battingFirst === 'A' ? this.teamA : this.teamB;
    }

    return this.battingFirst === 'A' ? this.teamB : this.teamA;
  }


  get currentBowlingTeam(): Player[] {
    if (this.currentInnings === 1) {
      return this.battingFirst === 'A' ? this.teamB : this.teamA;
    }

    return this.battingFirst === 'A' ? this.teamA : this.teamB;
  }

  get currentBattingTeamName(): 'A' | 'B' {
    if (this.currentInnings === 1) {
      return this.battingFirst === 'A' ? 'A' : 'B';
    }

    return this.battingFirst === 'A' ? 'B' : 'A';
  }

  get availableBowlers(): Player[] {
    return this.currentBowlingTeam.filter((player) => player?.id !== this.currentBowler?.id);
  }

  get availableBatsmen(): Player[] {
    return this.currentBattingTeam.filter((player) => !this.outPlayersIds.includes(player.id!));
  }

  get maxWickets() {
    return this.currentBattingTeam.length;
  }

  get currentBowlerOvers(): string {
    if (!this.currentBowler?.id) {
      return '0.0';
    }

    const balls = this.playerStats[this.currentBowler.id]?.ballsDelivered || 0;

    const overs = Math.floor(balls / 6);

    const remainingBalls = balls % 6;

    return `${overs}.${remainingBalls}`;
  }

  get currentBowlerEconomy(): string {
    if (!this.currentBowler?.id) {
      return '0.00';
    }

    const stats = this.playerStats[this.currentBowler.id];

    if (!stats?.ballsDelivered) {
      return '0.00';
    }

    const overs = stats.ballsDelivered / 6;

    const economy = stats.runsConceded / overs;

    return economy.toFixed(2);
  }

  get currentBatsmanStrikeRate(): string {
    if (!this.currentBatsman?.id) {
      return '0.00';
    }

    const stats = this.playerStats[this.currentBatsman.id];

    if (!stats?.ballsFaced) {
      return '0.00';
    }

    const strikeRate = (stats.runs / stats.ballsFaced) * 100;

    return strikeRate.toFixed(2);
  }

  get overs(): string {
    const overs = Math.floor(this.totalDeliveries / 6);
    const balls = Math.floor(this.totalDeliveries % 6);

    return `${overs}.${balls}`;
  }

  get currentRunRate(): string {
    if (this.totalDeliveries == 0) {
      return '0.00';
    }

    const overs = this.totalDeliveries / 6;
    const crr = this.totalRuns / overs;

    return crr.toFixed(2);
  }

  get runsNeeded() {
    if (this.currentInnings !== 2) {
      return 0;
    }

    return this.firstInningRuns + 2 - this.totalRuns;
  }

  get matchResultMessage() {
    if (this.matchResult === 'won') {
      return 'Target chased successfully.';
    }

    if (this.matchResult === 'lost') {
      return 'The chase fell short.';
    }

    return 'Both teams finished level.';
  }

  get matchResultTitle() {
    if (this.matchResult === 'won') {
      return 'VICTORY';
    }

    if (this.matchResult === 'lost') {
      return 'DEFEAT';
    }

    return 'TIED';
  }

  get resultMessage() {
    const firstBattingTeam = this.battingFirst;

    const secondBattingTeam = this.battingFirst === 'A' ? 'B' : 'A';

    // CHASING TEAM WON

    if (this.matchResult === 'won') {
      const wicketsLeft = this.maxWickets - this.totalWickets;

      return `
      Team ${secondBattingTeam}
      won by
      ${wicketsLeft} wickets
    `;
    }

    // DEFENDING TEAM WON

    if (this.matchResult === 'lost') {
      const runMargin = this.firstInningRuns - this.totalRuns;

      return `
      Team ${firstBattingTeam}
      won by
      ${runMargin} runs
    `;
    }

    return 'Match Tied';
  }

  get winningTeam() {
    if (this.matchResult === 'tie') {
      return null;
    }

    // chasing team won

    if (this.matchResult === 'won') {
      return this.battingFirst === 'A' ? 'B' : 'A';
    }

    // defending team won

    return this.battingFirst;
  }

  get Motm() {
    let bestPlayer = null;
    let bestScore = 0;

    const matchStats = this.buildMatchStats();

    for (const playerId in matchStats) {
      const player = matchStats[playerId];

      const score = player.runs + player.wickets * 20 - player.runsConceded / 2;

      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    }

    return bestPlayer;
  }

  getCaptains() {
    this.captainA = this.matchSetupService.getTeamACaptain();
    this.captainB = this.matchSetupService.getTeamBCaptain();
  }

  openExtraPlayerDialogForA() {
    this.selectedExtraPlayerTeam = 'A'
    this.isShowingExtraPlayerDialog = true;
    this.getUnselectedPlayers()
  }

  openExtraPlayerDialogForB() {
    this.selectedExtraPlayerTeam = 'B'
    this.isShowingExtraPlayerDialog = true;
    this.getUnselectedPlayers()
  }

  addExtraPlayerToTeam() {

    if (this.selectedExtraPlayerTeam === 'A') {

      this.teamA = [
        ...this.teamA,
        this.selectedExtraPlayer!
      ];

    } else {

      this.teamB = [
        ...this.teamB,
        this.selectedExtraPlayer!
      ];

    }

    this.allSelectedPlayers = [
      ...this.allSelectedPlayers,
      this.selectedExtraPlayer!
    ];

    // Initialize stats for the new player only
    this.createPlayerStats(this.selectedExtraPlayer!);
    this.updateTeamInService()

    this.closeExtraPlayerDialog()

  }

  closeExtraPlayerDialog() {
    this.selectedExtraPlayer = null;
    this.selectedExtraPlayerTeam = null;
    this.unselectedPlayers = [];
    this.isShowingExtraPlayerDialog = false;
  }

  getUnselectedPlayers() {

    this.registeredPlayers.getAllPlayers().subscribe((data: Player[]) => {

      this.unselectedPlayers = data.filter(
        player =>
          !this.allSelectedPlayers.some(
            selected => selected.id === player.id
          )
      );


    });

  }

  selectExtraPlayer(player: Player) {
    this.selectedExtraPlayer = player
  }

  updateTeamInService() {
    this.matchSetupService.updateTeams(
      this.teamA,
      this.teamB
    );
  }

  selectBatsman(player: Player) {
    this.selectedBatsman = player;
  }

  selectBowler(player: Player) {
    if (player === this.selectedBowler) {
      return;
    }
    this.selectedBowler = player;
  }

  //confirm selection

  confirmBatsman() {

    this.currentBatsman = this.selectedBatsman;
    this.showBatsmenDialog = false;

    if (!this.isWicketFallen) {
      this.showBowlerDialog = true;
    }
    this.isWicketFallen = false;
    if (this.selectedBatsman?.id) {
      this.playerStats[this.selectedBatsman?.id].innings += 1;
    }
    this.saveMatchState();
  }

  confirmBowler() {
    this.saveSnapshot()

    this.currentBowler = this.selectedBowler;
    this.showBowlerDialog = false;
    this.isOverComplete = false;
    this.saveMatchState();
  }

  // Score

  saveSnapshot() {
    this.matchHistory.push(
      structuredClone({

        // SCORE
        totalRuns: this.totalRuns,
        totalWickets: this.totalWickets,
        totalDeliveries: this.totalDeliveries,

        // PLAYER STATS
        playerStats: this.playerStats,

        // CURRENT PLAYERS
        currentBatsman: this.currentBatsman,
        currentBowler: this.currentBowler,

        selectedBatsman: this.selectedBatsman,
        selectedBowler: this.selectedBowler,

        // OUT PLAYERS
        outPlayersIds: this.outPlayersIds,

        // CURRENT BATSMAN STATS
        currentBatsmanRuns: this.currentBatsmanRuns,
        currentBatsmanBalls: this.currentBatsmanBalls,

        // CURRENT BOWLER STATS
        currentBowlerRunsConceded: this.currentBowlerRunsConceded,
        currentBowlerBalls: this.currentBowlerBalls,
        currentBowlerWickets: this.currentBowlerWickets,

        // DELIVERY HISTORY
        recentDeliveries: this.recentDeliveries,
        lastAction: this.lastAction,

        // MATCH FLOW
        currentInnings: this.currentInnings,

        isWicketFallen: this.isWicketFallen,
        isOverComplete: this.isOverComplete,
        isInningsOver: this.isInningsOver,

        canUndo: this.canUndo,

        // DIALOGS
        showBatsmenDialog: this.showBatsmenDialog,
        showBowlerDialog: this.showBowlerDialog,

        isDismissalDialogOpen: this.isDismissalDialogOpen,
        isShowingCatchingDialog: this.isShowingCatchingDialog,
        isShowingNoBallDialog: this.isShowingNoBallDialog,

        // DISMISSAL
        dismissalType: this.dismissalType,
        selectedNoBallRuns: this.selectedNoBallRuns,

        // 1ST INNINGS DATA
        firstInningRuns: this.firstInningRuns,
        firstInningsBalls: this.firstInningsBalls,
        firstInningsWickets: this.firstInningsWickets,
        firstInningsPlayerStats: this.firstInningsPlayerStats,

        // RESULT
        matchResult: this.matchResult
      })
    );
  }

  addDot() {
    this.saveSnapshot()
    this.voiceAnnouncementService.speak('Dot Ball')
    this.totalDeliveries += 1;
    this.currentBatsmanBalls += 1;
    this.currentBowlerBalls += 1;
    this.lastAction = '0';
    this.recentDeliveries.unshift({ value: '0', type: 'dot', bowlerId: this.currentBowler?.id! });

    if (this.currentBatsman?.id && this.currentBowler?.id) {
      this.playerStats[this.currentBatsman?.id].ballsFaced += 1;
      this.playerStats[this.currentBowler?.id].ballsDelivered += 1;
    }

    this.saveMatchState();
    this.manageOversChange();
  }

  addNoBallDot() {

    this.voiceAnnouncementService.speak('No Ball')

    this.lastAction = 'NB+0';

    this.recentDeliveries.unshift({
      value: 'NB+0',
      type: 'noball',
      bowlerId: this.currentBowler?.id!
    });

    if (this.currentBatsman?.id && this.currentBowler?.id) {

      this.playerStats[this.currentBowler.id].noBalls += 1;
    }

    this.isShowingNoBallDialog = false;

    this.saveMatchState();
    this.manageBattingMilestone();
    this.checkMatchResult();
  }


  addFour() {
    this.saveSnapshot()
    this.voiceAnnouncementService.speak('Four')
    this.totalRuns += 4;
    this.totalDeliveries += 1;
    this.currentBatsmanRuns += 4;
    this.currentBatsmanBalls += 1;
    this.currentBowlerBalls += 1;
    this.currentBowlerRunsConceded += 4;
    this.lastAction = '4';
    this.recentDeliveries.unshift({ value: '4', type: 'four', bowlerId: this.currentBowler?.id! });

    if (this.currentBatsman?.id && this.currentBowler?.id) {
      this.playerStats[this.currentBatsman?.id].runs += 4;

      this.playerStats[this.currentBatsman?.id].ballsFaced += 1;
      this.playerStats[this.currentBatsman?.id].fours += 1;

      this.playerStats[this.currentBowler?.id].ballsDelivered += 1;
      this.playerStats[this.currentBowler?.id].runsConceded += 4;
    }

    this.saveMatchState();
    this.manageBattingMilestone();
    this.manageOversChange();
    this.checkMatchResult();
  }

  addNoBallFour() {
    this.saveSnapshot()
    this.voiceAnnouncementService.speak('No Ball and a Four')

    this.totalRuns += 4;

    this.currentBatsmanRuns += 4;
    this.currentBowlerRunsConceded += 4;

    this.lastAction = 'NB+4';

    this.recentDeliveries.unshift({
      value: 'NB+4',
      type: 'noball',
      bowlerId: this.currentBowler?.id!
    });

    if (this.currentBatsman?.id && this.currentBowler?.id) {

      this.playerStats[this.currentBatsman.id].runs += 4;
      this.playerStats[this.currentBatsman.id].fours += 1;

      this.playerStats[this.currentBowler.id].runsConceded += 4;

      this.playerStats[this.currentBowler.id].noBalls += 1;
    }

    this.isShowingNoBallDialog = false;

    this.saveMatchState();
    this.manageBattingMilestone();
    this.checkMatchResult();
  }

  addSix() {
    this.saveSnapshot()

    this.voiceAnnouncementService.speak('Six')
    this.totalRuns += 6;
    this.totalDeliveries += 1;
    this.currentBatsmanRuns += 6;
    this.currentBatsmanBalls += 1;
    this.currentBowlerBalls += 1;
    this.currentBowlerRunsConceded += 6;
    this.lastAction = '6';
    this.recentDeliveries.unshift({ value: '6', type: 'six', bowlerId: this.currentBowler?.id! });

    if (this.currentBatsman?.id && this.currentBowler?.id) {
      this.playerStats[this.currentBatsman?.id].runs += 6;

      this.playerStats[this.currentBatsman?.id].ballsFaced += 1;
      this.playerStats[this.currentBatsman?.id].sixes += 1;

      this.playerStats[this.currentBowler?.id].ballsDelivered += 1;
      this.playerStats[this.currentBowler?.id].runsConceded += 6;
    }

    this.saveMatchState();
    this.manageBattingMilestone();
    this.manageOversChange();
    this.checkMatchResult();
  }

  addNoBallSix() {
    this.saveSnapshot()
    this.voiceAnnouncementService.speak('No Ball and a Six')

    this.totalRuns += 6;

    this.currentBatsmanRuns += 6;
    this.currentBowlerRunsConceded += 6;

    this.lastAction = 'NB+6';

    this.recentDeliveries.unshift({
      value: 'NB+6',
      type: 'noball',
      bowlerId: this.currentBowler?.id!
    });

    if (this.currentBatsman?.id && this.currentBowler?.id) {

      this.playerStats[this.currentBatsman.id].runs += 6;
      this.playerStats[this.currentBatsman.id].sixes += 1;

      this.playerStats[this.currentBowler.id].runsConceded += 6;

      // future-proof
      this.playerStats[this.currentBowler.id].noBalls += 1;
    }

    this.isShowingNoBallDialog = false;

    this.saveMatchState();
    this.manageBattingMilestone();
    this.checkMatchResult();
  }

  selectNoBallRuns(runs: 0 | 4 | 6 | null) {

    this.selectedNoBallRuns = runs

    if (this.selectedNoBallRuns === 0) {

      this.addNoBallDot()
    }
    else if (this.selectedNoBallRuns === 4) {

      this.addNoBallFour()
    }
    else if (this.selectedNoBallRuns === 6) {
      this.addNoBallSix()
    }
  }


  addWide() {
    this.saveSnapshot()
    this.voiceAnnouncementService.speak('Wide Ball')

    this.recentDeliveries.unshift({ value: 'WD', type: 'wide', bowlerId: this.currentBowler?.id! });
    this.lastAction = 'WD';
    if (this.currentBowler?.id) {
      this.playerStats[this.currentBowler?.id].wides += 1
    }
  }

  totalExtras(wide: any, noBall: any) {
    const wides = Number(wide || 0);
    const noBalls = Number(noBall || 0);
    return wides + noBalls;
  }

  addNoBall() {
    this.isShowingNoBallDialog = true
  }


  addWicket() {
    this.saveSnapshot()

    this.voiceAnnouncementService.speak('Wicket !!!')

    this.totalWickets += 1;
    this.totalDeliveries += 1;

    this.currentBatsmanBalls = 0;
    this.currentBatsmanRuns = 0;

    this.currentBowlerBalls += 1;

    this.lastAction = 'W';


    this.isWicketFallen = true;

    this.selectedBatsman = null;


    if (this.currentBowler?.id && this.currentBatsman?.id) {
      this.playerStats[this.currentBowler.id].ballsDelivered += 1;
      this.playerStats[this.currentBatsman.id].ballsFaced += 1;
    }

    this.recentDeliveries.unshift({
      value: 'W',
      type: 'wicket',
      bowlerId: this.currentBowler?.id!
    });


    this.saveMatchState();
    this.manageOversChange();

    this.isDismissalDialogOpen = true;


    if (this.currentBatsman?.id) {
      this.outPlayersIds.push(this.currentBatsman.id);
    }

    this.dismissalType = null;
  }


  selectDismissalType(type: 'caught' | 'bowled' | 'offside' | null) {

    this.dismissalType = type;

    if (type === 'caught') {
      this.isShowingCatchingDialog = true;
      return
    }


    if (this.currentBatsman?.id && this.currentBowler?.id) {

      this.playerStats[this.currentBatsman.id].dismissalType = type;

      this.playerStats[this.currentBatsman.id].dismissedBy =
        this.currentBowler.displayName || '';

      this.playerStats[this.currentBowler.id].wickets += 1;

      const isHatTrick = this.isHatTrick();

      if (this.currentBowler?.id && isHatTrick) {
        this.playerStats[this.currentBowler.id].hatTricks++;
      }

      this.addFiveFers();


    }

    this.continueAfterDismissal();
  }

  selectCaughtBy(player: Player) {

    if (this.currentBatsman?.id && this.currentBowler?.id) {

      this.playerStats[this.currentBowler.id].wickets += 1;


      this.addFiveFers();

      const isHatTrick = this.isHatTrick();

      if (this.currentBowler?.id && isHatTrick) {
        this.playerStats[this.currentBowler.id].hatTricks++;
      }

      this.playerStats[this.currentBatsman.id].dismissalType = 'caught';

      this.playerStats[this.currentBatsman.id].dismissedBy = this.currentBowler.displayName || '';

      this.playerStats[this.currentBatsman.id].caughtBy = player;
    }

    // CLOSE DIALOG

    this.isShowingCatchingDialog = false;

    // CONTINUE

    this.continueAfterDismissal();
  }

  retireOut() {

    this.saveSnapshot();

    if (!this.currentBatsman?.id) return;
    this.voiceAnnouncementService.speak('Batsman Is Retired Out')


    this.playerStats[this.currentBatsman.id].dismissalType =
      'retired-out';

    this.playerStats[this.currentBatsman.id].dismissedBy = '';

    this.totalWickets++

    this.outPlayersIds.push(this.currentBatsman?.id)

    this.isWicketFallen = true;

    this.selectedBatsman = null;

    this.continueAfterDismissal();

    this.lastAction = 'RO';

    this.saveMatchState();
  }

  retireHurt() {

    this.saveSnapshot();

    if (!this.currentBatsman?.id) return;
    this.voiceAnnouncementService.speak('Batsman is Retired Hurt')


    this.playerStats[this.currentBatsman.id].dismissalType =
      'retired-hurt';

    this.playerStats[this.currentBatsman.id].dismissedBy = '';

    this.retiredHurtPlayers.push(
      structuredClone(this.currentBatsman)
    );

    this.isWicketFallen = true;

    this.selectedBatsman = null;

    this.continueAfterDismissal();

    this.lastAction = 'RH';

    this.saveMatchState();
  }

  continueAfterDismissal() {
    this.isDismissalDialogOpen = false;

    this.checkMatchResult();

    // LAST WICKET

    if (this.totalWickets >= this.maxWickets) {
      this.isInningsOver = true;
      this.voiceAnnouncementService.speak('Innings Over')

      return;
    }


    // OTHERWISE

    this.showBatsmenDialog = true;
  }

  addFiveFers() {
    const bowler = this.playerStats[this.currentBowler?.id!];

    if (bowler.wickets === 5) {
      this.voiceAnnouncementService.speak('Five Wicket Haul for Bowler', true)
      bowler.fifer += 1;
    }
  }


  manageBattingMilestone() {
    if (this.currentBatsman?.id) {
      const currentBatter = this.playerStats[this.currentBatsman?.id];

      if (currentBatter.runs >= 50 && !currentBatter.hasScoredFifty) {
        currentBatter.hasScoredFifty = true;
        currentBatter.fifty += 1;
        this.voiceAnnouncementService.speak('Half Century', true)
      }

      if (currentBatter.runs >= 100 && !currentBatter.hasScoredHundred) {
        currentBatter.hasScoredHundred = true;
        currentBatter.hundred += 1;
        this.voiceAnnouncementService.speak('Century', true)
      }
    }
  }

  getYetToBatPlayers() {
    return this.currentBattingTeam.filter(player =>
      this.playerStats[player.id!] &&
      this.playerStats[player.id!].runs === 0 &&
      this.playerStats[player.id!].ballsFaced === 0 &&
      !this.outPlayersIds.includes(player.id!)
    );
  }

  getYetToBatFirstInningsPlayers() {
    return (this.firstInningsBattingTeam ?? []).filter(player =>
      this.firstInningsPlayerStats[player.id!] &&
      this.firstInningsPlayerStats[player.id!].runs === 0 &&
      this.firstInningsPlayerStats[player.id!].ballsFaced === 0 &&
      !this.outPlayersIds.includes(player.id!)
    );
  }

  getYetToBowlPlayers() {
    return this.currentBowlingTeam.filter(player =>
      this.playerStats[player.id!] &&
      this.playerStats[player.id!].runsConceded === 0 &&
      this.playerStats[player.id!].ballsDelivered === 0 &&
      this.playerStats[player.id!].wides === 0 &&
      this.playerStats[player.id!].noBalls === 0

    );
  }

  getYetToBowlfirstInningsPlayers() {
    return (this.firstInningsBowlingTeam ?? []).filter(player =>
      this.firstInningsPlayerStats[player.id!] &&
      this.firstInningsPlayerStats[player.id!].runsConceded === 0 &&
      this.firstInningsPlayerStats[player.id!].ballsDelivered === 0 &&
      this.firstInningsPlayerStats[player.id!].wides === 0 &&
      this.firstInningsPlayerStats[player.id!].noBalls === 0
    );
  }

  isHatTrick(): boolean {

    if (!this.currentBowler?.id) {
      return false;
    }

    // Ignore wides and no-balls
    const legalDeliveries = this.recentDeliveries.filter(delivery =>
      delivery.type !== 'wide' &&
      delivery.type !== 'noball'
    );

    if (legalDeliveries.length < 3) {
      return false;
    }

    const lastThree = legalDeliveries.slice(0, 3);

    const isHatTrick = lastThree.every(delivery =>
      delivery.type === 'wicket' &&
      delivery.bowlerId === this.currentBowler?.id
    );

    if (!isHatTrick) {
      return false;
    }

    // Prevent counting a 4th consecutive wicket as another hat-trick
    if (
      legalDeliveries.length >= 4 &&
      legalDeliveries[3].type === 'wicket' &&
      legalDeliveries[3].bowlerId === this.currentBowler.id
    ) {
      return false;
    }

    this.voiceAnnouncementService.speak('Hat Trick!', true);

    return true;
  }

  undo() {

    const previousSnapshot = this.matchHistory.pop();

    if (!previousSnapshot) {
      return;
    }

    Object.assign(this, previousSnapshot);

    // Never restore temporary dialogs/animations
    this.isShowingNoBallDialog = false;
    this.isDismissalDialogOpen = false;
    this.isShowingCatchingDialog = false;

    this.saveMatchState();
  }

  manageOversChange() {
    if (this.totalDeliveries % 6 === 0 && this.totalDeliveries > 0) {
      this.voiceAnnouncementService.speak("Over Complete");
      this.isOverComplete = true;

      this.showBowlerDialog = true;

      this.selectedBowler = null;


      // MAIDEN OVER

      if (this.currentBowler?.id && this.currentBowlerRunsConceded === 0) {
        this.playerStats[this.currentBowler.id].maiden += 1;
      }

      // RESET FOR NEXT OVER

      this.currentBowlerRunsConceded = 0;
    }

  }


  saveMatchState() {
    this.offlinePersistanceService.saveMatch({
      allSelectedPlayers: this.allSelectedPlayers,
      teamA: this.teamA,
      teamB: this.teamB,

      tossWinner: this.tossWinner,
      battingFirst: this.battingFirst,

      currentInnings: this.currentInnings,

      firstInningRuns: this.firstInningRuns,
      firstInningsBalls: this.firstInningsBalls,
      firstInningsWickets: this.firstInningsWickets,
      firstInningsPlayerStats: this.firstInningsPlayerStats,
      firstInningsBattingTeam: this.firstInningsBattingTeam,
      firstInningsBowlingTeam: this.firstInningsBowlingTeam,
      captainA: this.captainA,
      captainB: this.captainB,

      playerStats: this.playerStats,

      totalRuns: this.totalRuns,
      totalWickets: this.totalWickets,
      totalDeliveries: this.totalDeliveries,

      outPlayersIds: this.outPlayersIds,
      recentDeliveries: this.recentDeliveries,

      currentBatsman: this.currentBatsman,
      currentBowler: this.currentBowler,

      selectedBatsman: this.selectedBatsman,
      selectedBowler: this.selectedBowler,
    });
  }

  restoreMatchState() {
    const saved = this.offlinePersistanceService.loadMatch<any>();

    if (!saved) {
      return false;
    }

    Object.assign(this, saved);

    return true;
  }

  checkMatchResult() {

    if (this.currentInnings !== 2) {
      return;
    }


    // WIN

    if (this.totalRuns > this.firstInningRuns) {
      this.matchResult = 'won';
      this.voiceAnnouncementService.speak("Match Over");
      return;
    }

    // LOSS

    if (this.totalRuns < this.firstInningRuns && this.totalWickets >= this.maxWickets) {
      this.matchResult = 'lost';
      this.voiceAnnouncementService.speak("Match Over");
      return;
    }

    // TIE

    if (this.totalRuns === this.firstInningRuns && this.totalWickets >= this.maxWickets) {
      this.matchResult = 'tie';
      this.voiceAnnouncementService.speak("Match Over");
    }


  }

  startSecondInnings() {
    this.saveSnapshot()

    this.voiceAnnouncementService.speak('Starting Second Innings')

    this.firstInningRuns = this.totalRuns;

    this.firstInningsBalls = this.totalDeliveries;
    this.firstInningsWickets = this.totalWickets;

    this.firstInningsPlayerStats = structuredClone(this.playerStats);
    this.firstInningsBattingTeam = structuredClone(this.currentBattingTeam);
    this.firstInningsBowlingTeam = structuredClone(this.currentBowlingTeam)


    this.playerStats = {};
    this.initializePlayerStats();

    this.currentInnings = 2;

    this.isDismissalDialogOpen = false;
    this.totalRuns = 0;
    this.totalWickets = 0;
    this.totalDeliveries = 0;

    this.currentBatsman = null;
    this.currentBowler = null;

    this.selectedBatsman = null;
    this.selectedBowler = null;


    this.outPlayersIds = [];

    this.recentDeliveries = [];

    this.isWicketFallen = false;
    this.isOverComplete = false;

    this.showBowlerDialog = false;
    this.showBatsmenDialog = true;
    this.isShowingCatchingDialog = false;
    this.dismissalType = null;
    this.saveMatchState();
  }

  buildMatchStats() {
    const matchStats = structuredClone(this.firstInningsPlayerStats);

    for (const playerId in this.playerStats) {
      const first = matchStats[playerId];

      const second = this.playerStats[playerId];

      first.runs += second.runs;
      first.wickets += second.wickets;
      first.ballsFaced += second.ballsFaced;
      first.ballsDelivered += second.ballsDelivered;
      first.runsConceded += second.runsConceded;
      first.fours += second.fours;
      first.sixes += second.sixes;
    }

    return matchStats;
  }

  buildMatchObject() {
    return {
      createdAt: Date.now(),

      year: new Date().getFullYear(),
      teamA: this.teamA,
      teamB: this.teamB,
      motm: this.Motm,
      teamACaptain: this.captainA,
      teamBCaptain: this.captainB,

      innings: [
        {
          inning: 1,

          firstInningsTotalRuns: this.firstInningRuns,
          firstInningsTotalBalls: this.firstInningsBalls,
          firstInningsTotalWickets: this.firstInningsWickets,

          playerStats: this.firstInningsPlayerStats,
        },

        {
          inning: 2,

          secondInningsTotalRuns: this.totalRuns,
          secondInningsTotalWickets: this.totalWickets,
          secondInningsTotalBalls: this.totalDeliveries,

          playerStats: this.playerStats,
        },
      ],
    };
  }

  clearMatch() {
    this.offlinePersistanceService.clearMatch()
    this.router.navigate(['/'])

  }


  async saveCompletedMatch() {
    try {
      const matchData = this.buildMatchObject();


      await this.matchService.saveMatch(matchData);

      this.offlinePersistanceService.clearMatch();

      this.router.navigate(['/']);
    } catch (error) {
      console.log('Error Saving Match', error);
    }
  }
}
