import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  orderBy,
  query
} from '@angular/fire/firestore';

import { Player } from '../../shared/models/player.model';
import { Observable } from 'rxjs';

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

   getPlayer(playerId:string):Observable<Player>{
    const playerRef = doc(this.fireStore, `players/${playerId}`)

    return docData(playerRef, {idField: 'id'}) as Observable<Player>
  }

}