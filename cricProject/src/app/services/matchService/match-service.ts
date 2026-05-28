import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class MatchService {

  constructor(private fireStore: Firestore){}

  async saveMatch(matchData:any){
  const matchRef = collection(this.fireStore, 'matches')
  await addDoc(matchRef, matchData)
}


  retrieveMatches(){

  const matchRef =
  collection(
    this.fireStore,
    'matches'
  )

  const q = query(
    matchRef,
    orderBy(
      'createdAt',
      'desc'
    )
  )

  return collectionData(q)

}
}
