import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Player } from '../shared/models/player.model'
import { CommonModule } from '@angular/common';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-add-player',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-player.html',
  styleUrl: './add-player.css',
})
export class AddPlayer {


  player: Player = {

    fullName: '',
    displayName: '',
    style: '',
    createdAt: Date.now(),
    photoURL: ''

  }
  
  previewImage: any = null;
  selectedFile: File | null = null
  isLoading:boolean = false

  constructor(private firestore: Firestore, private cdr: ChangeDetectorRef, private router: Router, private storage: Storage){}



  onImageSelect(event: any) {
    console.log('event triggered')

    const file = event.target.files[0]

    if(!file) return;

    this.selectedFile = file

    console.log('the file exists')
    const reader = new FileReader()

    reader.onload = (()=>{
      this.previewImage = reader.result
      this.cdr.detectChanges()
    })

    reader.readAsDataURL(file)

  }

 
async addPlayer(playerForm: NgForm) {

  try {

    this.isLoading = true;

    let imageURL = '';

    // upload image if exists
    if (this.selectedFile) {

      const filePath =
        `players/${Date.now()}_${this.selectedFile.name}`;

      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, this.selectedFile);

      imageURL = await getDownloadURL(storageRef);

    }

    // save firestore document
    const playersRef = collection(this.firestore, 'players');

    await addDoc(playersRef, {

      ...this.player,

      photoURL: imageURL

    });

    console.log('player added');
    playerForm.reset()
    this.previewImage = null
    this.selectedFile = null
    


  }

  catch(error) {

    console.log(error);

  }

  finally {

    this.isLoading = false;
    this.router.navigate(['/player-list'])
    this.cdr.detectChanges();

  }

}
}
