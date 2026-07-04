import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VoiceAnnouncementService {

  private enabled = true

  speak(text: string, special = false) {

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = 'en-IN';

    if (special) {
      speech.rate = 0.8;
      speech.pitch = 1.3;
      speech.volume = 1;
    } else {
      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;
    }

    window.speechSynthesis.speak(speech);

  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
  
}
