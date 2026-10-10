import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/matchService/match-service';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../seoService/seo-service';

@Component({
  selector: 'app-main-page',
  imports: [RouterLink],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage implements OnInit {
  constructor(
    private matchService: MatchService,
    private cdr: ChangeDetectorRef,
    private seoService: SeoService
  ) {}

  Math = Math;
  matches: any[] = [];
  loading = false;

  ngOnInit() {
    this.setSEO()
    this.getMatches();
  }

  getMatches() {
    this.loading = true;
    this.matchService.retrieveMatches().subscribe((data: any) => {
      this.matches = data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  setSEO(): void {
    this.seoService.setPage(
      'Cricket Match History & Scorecards | Chhat Cricket',
      'Browse past rooftop cricket matches, innings scores, match results and player of the match performances on Chhat Cricket.',
      '/matches-history'
    );
  }

  formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getMatchTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
