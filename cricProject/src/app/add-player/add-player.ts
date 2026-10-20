import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';

import { Player } from '../shared/models/player.model';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';

@Component({
  selector: 'app-add-player',
  imports: [FormsModule, CommonModule, ImageCropperComponent],
  templateUrl: './add-player.html',
  styleUrl: './add-player.css',
})
export class AddPlayer {
  player: Player = {
    fullName: '',
    displayName: '',
    style: '',
    createdAt: Date.now(),
    photoURL: '',
  };

  previewImage: any = null;
  selectedFile: File | null = null;

  cropperFile: File | null = null;
  croppedBlob: Blob | null = null;
  cropPreview: SafeUrl | null = null;
  showCropper = false;

  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0,
  };

  isLoading: boolean = false;

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private storage: Storage,
    private sanitizer: DomSanitizer,
  ) {}

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image.');
      input.value = '';
      return;
    }

    this.cropperFile = file;
    this.croppedBlob = null;
    this.cropPreview = null;
    this.showCropper = true;

    this.transform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0,
    };

    // Allows selecting the same file again later.
    input.value = '';
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (!event.blob || !event.objectUrl) return;

    this.croppedBlob = event.blob;
    this.cropPreview = this.sanitizer.bypassSecurityTrustUrl(
      event.objectUrl,
    );
  }

  zoomIn(): void {
    const currentScale = this.transform.scale ?? 1;

    this.transform = {
      ...this.transform,
      scale: Math.min(
        3,
        Number((currentScale + 0.15).toFixed(2)),
      ),
    };
  }

  zoomOut(): void {
    const currentScale = this.transform.scale ?? 1;

    this.transform = {
      ...this.transform,
      scale: Math.max(
        0.7,
        Number((currentScale - 0.15).toFixed(2)),
      ),
    };
  }

  resetCrop(): void {
    this.transform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0,
    };
  }

  useCroppedImage(): void {
    if (!this.croppedBlob || !this.cropPreview) return;

    this.selectedFile = new File(
      [this.croppedBlob],
      `player-photo-${Date.now()}.jpg`,
      { type: 'image/jpeg' },
    );

    this.previewImage = this.cropPreview;
    this.showCropper = false;
    this.cropperFile = null;
  }

  cancelCrop(): void {
    this.showCropper = false;
    this.cropperFile = null;
    this.croppedBlob = null;
    this.cropPreview = null;
  }

  loadImageFailed(): void {
    this.showCropper = false;
    this.cropperFile = null;
    alert('Image could not be loaded. Please select another image.');
  }

  async addPlayer(playerForm: NgForm) {
    try {
      this.isLoading = true;

      let imageURL = '';

      // upload image if exists
      if (this.selectedFile) {
        const filePath = `players/${Date.now()}_${this.selectedFile.name}`;

        const storageRef = ref(this.storage, filePath);

        await uploadBytes(storageRef, this.selectedFile);

        imageURL = await getDownloadURL(storageRef);
      }

      // save firestore document
      const playersRef = collection(this.firestore, 'players');

      await addDoc(playersRef, {
        ...this.player,

        photoURL:
          imageURL ||
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s',
      });

      playerForm.reset();
      this.previewImage = null;
      this.selectedFile = null;
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
      this.router.navigate(['/players-list']);
      this.cdr.detectChanges();
    }
  }
}
