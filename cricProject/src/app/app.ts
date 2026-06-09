import { Component, signal, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router } from '@angular/router';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly title = signal('cricProject');

  user: User | null = null;
  isSidebarOpen: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      cdr.detectChanges();
    });
  }

  async logIn() {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(this.auth, provider);
  }

  logOut() {
    signOut(this.auth);
  }

  openSidebar() {
    this.isSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  navigateToHome() {
    this.router.navigate(['/']);
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  navigateToAddPlayer() {
    this.router.navigate(['/add-player']);
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }
  navigateToAbout() {
    this.router.navigate(['/about']);
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }
}
