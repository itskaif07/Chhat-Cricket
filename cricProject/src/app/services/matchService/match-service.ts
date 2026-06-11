import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  orderBy,
  query,
} from '@angular/fire/firestore';

import { GenerativeModel, getAI, getGenerativeModel } from "firebase/ai";

@Injectable({
  providedIn: 'root',
})
export class MatchService {

  ai = getAI()
  model = new GenerativeModel(this.ai, { model: 'gemini-2.5-flash' })

  constructor(private fireStore: Firestore) { }


  async saveMatch(matchData: any) {
    const matchRef = collection(this.fireStore, 'matches');
    await addDoc(matchRef, matchData);
  }

  retrieveMatches() {
    const matchRef = collection(this.fireStore, 'matches');

    const q = query(matchRef, orderBy('createdAt', 'desc'));

    return collectionData(q, {
      idField: 'id',
    });
  }

  getMatchById(id: string) {
    const matchDoc = doc(this.fireStore, `matches/${id}`);

    return docData(matchDoc);
  }

  async generateMatchSummary(prompt: string){
    const result =this.model.generateContent(prompt)

    return (await result).response.text
  }
}
