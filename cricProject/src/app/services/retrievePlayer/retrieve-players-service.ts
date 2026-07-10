import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  orderBy,
  query,
} from '@angular/fire/firestore';

import { Player } from '../../shared/models/player.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RetrievePlayersService {
  constructor(private fireStore: Firestore) {}

  getAllPlayers(): Observable<Player[]> {

    const playerRef = collection(this.fireStore, 'players');

    const q = query(
      playerRef,
      orderBy('displayName', 'asc')
    );

    return collectionData(q, {
      idField: 'id',
    }) as Observable<Player[]>;

  }

  getPlayer(playerId: string): Observable<Player> {
    const playerRef = doc(this.fireStore, `players/${playerId}`);

    return docData(playerRef, { idField: 'id' }) as Observable<Player>;
  }
}
