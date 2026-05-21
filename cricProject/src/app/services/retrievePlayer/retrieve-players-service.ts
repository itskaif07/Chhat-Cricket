import { Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  getDocs,
  orderBy,
  query
} from '@angular/fire/firestore';

import { Player } from '../../shared/models/player.model';

@Injectable({
  providedIn: 'root',
})
export class RetrievePlayersService {

  constructor(private fireStore: Firestore) {}

  async getAllPlayers(): Promise<Player[]> {
    const playerRef = collection(this.fireStore, 'players');

    const q = query(playerRef, orderBy('displayName', 'asc'));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Player[];
  }

}