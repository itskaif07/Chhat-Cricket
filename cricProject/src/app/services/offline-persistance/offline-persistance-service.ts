import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OfflinePersistanceService {

  private readonly STORAGE_KEY = 'active-match';

  saveMatch(matchData: unknown): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(matchData)
      );
    } catch (error) {
      console.error('Failed to save match:', error);
    }
  }

  loadMatch<T>(): T | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Failed to load match:', error);
      return null;
    }
  }

  clearMatch(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  hasSavedMatch(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
}
