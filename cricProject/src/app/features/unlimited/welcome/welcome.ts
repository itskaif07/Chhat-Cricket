import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {

  isTossing: boolean = false
  tossResult: string = ''


constructor(private cdr: ChangeDetectorRef){}

tossCoin() {

  this.isTossing = true;

  this.tossResult = '';

  setTimeout(() => {

    this.tossResult =
      Math.random() < 0.5
        ? 'H'
        : 'T';

    this.isTossing = false;
    this.cdr.detectChanges()

  }, 1000);

}

}
