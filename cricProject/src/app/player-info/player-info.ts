import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute
} from '@angular/router';

import {
  Firestore,
  doc,
  getDoc
} from '@angular/fire/firestore';


@Component({
  selector: 'app-player-info',
  imports: [],
  templateUrl: './player-info.html',
  styleUrl: './player-info.css',
})
export class PlayerInfo implements OnInit {

  player: any = null;

  stats: any = null;

  playerId = '';

  loading = false;

  constructor(

    private route: ActivatedRoute,

    private firestore: Firestore,

    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {

    this.playerId =
      this.route.snapshot.paramMap.get('id') || '';

    this.getPlayer();

    this.getStats();

  }

  async getPlayer() {

    try {

      this.loading = true;

      const playerRef = doc(
        this.firestore,
        `players/${this.playerId}`
      );

      const snapshot = await getDoc(playerRef);

      if (snapshot.exists()) {

        this.player = snapshot.data();

      }

      this.cdr.detectChanges();

      this.loading = false;

    }

    catch(error) {

      console.log(error);

      this.loading = false;

    }

  }

  async getStats() {

    try {

      const statsRef = doc(
        this.firestore,
        `players/${this.playerId}/stats/career`
      );

      const snapshot = await getDoc(statsRef);

      if (snapshot.exists()) {

        this.stats = snapshot.data();

      }

      else {

        this.stats = {

          runs: 0,
          wickets: 0,
          fours: 0,
          sixes: 0

        };

      }

      this.cdr.detectChanges();

    }

    catch(error) {

      console.log(error);

    }

  }

}