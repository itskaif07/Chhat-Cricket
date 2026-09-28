import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentRecord, TournamentService } from '../services/tournament/tournament-service';

@Component({
  selector: 'app-tournament-hub',
  imports: [FormsModule, RouterLink],
  templateUrl: './tournament-hub.html',
  styleUrl: './tournament-hub.css',
})
export class TournamentHub implements OnInit, OnDestroy {
  constructor(private tournamentService: TournamentService, private cdr: ChangeDetectorRef) {}

  private subscription?: Subscription;
  tournaments: TournamentRecord[] = [];
  loading = true;
  creating = false;
  saving = false;
  error = '';
  form = this.emptyForm();

  ngOnInit() {
    this.subscription = this.tournamentService.retrieveTournaments().subscribe({
      next: (tournaments) => {
        this.tournaments = tournaments;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Tournament records could not be loaded.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  openCreate() {
    this.form = this.emptyForm();
    this.creating = true;
    this.error = '';
  }

  async createTournament() {
    if (!this.form.name.trim() || !this.form.date || !this.form.teamAName.trim() || !this.form.teamBName.trim()) {
      this.error = 'Add a tournament name, date, and both team names.';
      return;
    }

    this.saving = true;
    this.error = '';
    try {
      await this.tournamentService.createTournament({
        name: this.form.name.trim(),
        date: this.form.date,
        teamAName: this.form.teamAName.trim(),
        teamBName: this.form.teamBName.trim(),
        matchLimit: Number(this.form.matchLimit),
        winsToWin: Number(this.form.winsToWin),
        teamAPlayers: [],
        teamBPlayers: [],
        createdAt: Date.now(),
      });
      this.creating = false;
    } catch(e) {
      this.error = 'Tournament could not be saved. Please try again.';
      console.log(e)
    } finally {
      this.saving = false;
    }
  }

  get tournamentCountLabel() {
    return this.tournaments.length === 1 ? '1 tournament scheduled' : `${this.tournaments.length} tournaments scheduled`;
  }

  status(tournament: TournamentRecord) {
    const today = this.localDateKey(new Date());
    if (tournament.date > today) return 'Upcoming';
    if (tournament.date < today) return 'Completed';
    return 'Match day';
  }

  formatDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private emptyForm() {
    return { name: '', date: '', teamAName: 'Team A', teamBName: 'Team B', matchLimit: 5, winsToWin: 3 };
  }

  private localDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
