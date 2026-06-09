import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { collection, Firestore, getDocs, orderBy, query } from '@angular/fire/firestore';
import { Router, RouterLink } from '@angular/router';
import { Player } from '../shared/models/player.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './players-list.html',
  styleUrl: './players-list.css',
})
export class PlayersList implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];

  loading = false;
  searchText = '';

  constructor(
    private firestore: Firestore,

    private cdr: ChangeDetectorRef,

    private router: Router,
  ) {}

  ngOnInit(): void {
    this.retrievePlayers();
  }

  async retrievePlayers() {
    try {
      this.loading = true;

      const playersRef = collection(this.firestore, 'players');

      const q = query(playersRef, orderBy('displayName', 'asc'));

      const snapshot = await getDocs(q);

      this.players = snapshot.docs.map((doc) => ({
        id: doc.id,

        ...doc.data(),
      })) as Player[];

      this.filteredPlayers = this.players;
      this.cdr.detectChanges();
      this.loading = false;
    } catch (error) {
      console.log(error);

      this.loading = false;
    }
  }

  searchPlayers() {
    const text = this.searchText.toLowerCase();

    this.filteredPlayers = this.players.filter(
      (player) =>
        (player.fullName || '').toLowerCase().includes(text) ||
        (player.displayName || '').toLowerCase().includes(text),
    );

    console.log(this.filteredPlayers);
    this.cdr.detectChanges();
  }
}
