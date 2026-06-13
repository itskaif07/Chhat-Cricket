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
import { OfflinePersistanceService } from './services/offline-persistance/offline-persistance-service';

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
  showMatchWarning = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private offlineService: OfflinePersistanceService,
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

    if (this.offlineService.hasSavedMatch()) {
      this.showMatchWarning = true;
      this.isSidebarOpen = false;
      document.body.style.overflow = 'auto';
      this.cdr.detectChanges()
      return
    }

    this.router.navigate(['/']);
    this.isSidebarOpen = false;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges()
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
  
  home(){
    if(this.offlineService.hasSavedMatch()){
      this.showMatchWarning = true;
      this.cdr.detectChanges()
      return
    }
    
    this.router.navigate(['/']);
    this.cdr.detectChanges()
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }
}
