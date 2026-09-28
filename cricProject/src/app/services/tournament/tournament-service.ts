import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type AuctionPlayer = {
  id: string;
  displayName: string;
  photoURL?: string;
  price?: number;
};

export type TournamentRecord = {
  id?: string;
  name: string;
  date: string;
  teamAName: string;
  teamBName: string;
  matchLimit: number;
  winsToWin: number;
  teamAPlayers: AuctionPlayer[];
  teamBPlayers: AuctionPlayer[];
  createdAt: number;
};

@Injectable({ providedIn: 'root' })
export class TournamentService {
  constructor(private firestore: Firestore) {}

  createTournament(tournament: TournamentRecord) {
    return addDoc(collection(this.firestore, 'tournaments'), tournament);
  }

  retrieveTournaments(): Observable<TournamentRecord[]> {
    return collectionData(query(collection(this.firestore, 'tournaments'), orderBy('date', 'asc')), { idField: 'id' }) as Observable<TournamentRecord[]>;
  }

  getTournament(id: string): Observable<TournamentRecord> {
    return docData(doc(this.firestore, `tournaments/${id}`), { idField: 'id' }) as Observable<TournamentRecord>;
  }

  updateTournament(id: string, changes: Partial<TournamentRecord>) {
    return updateDoc(doc(this.firestore, `tournaments/${id}`), changes);
  }
}
