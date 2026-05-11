import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-player',
  imports: [FormsModule],
  templateUrl: './add-player.html',
  styleUrl: './add-player.css',
})
export class AddPlayer {


  previewImage: string | ArrayBuffer | null = null;
  handedness = 'right';

onImageSelect(event: any) {

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {

      this.previewImage = reader.result;

    };

    reader.readAsDataURL(file);

  }

}
}
