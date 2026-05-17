import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-toss-page',
  imports: [RouterLink],
  templateUrl: './toss-page.html',
  styleUrl: './toss-page.css',
})
export class TossPage {

  constructor(private cdr: ChangeDetectorRef){}

  tossResult:string = ''
  isTossing:boolean = false
  isTossSkipped:boolean = false

  tossCoin(){
    this.isTossing = true

    setTimeout(() => {
      this.tossResult = Math.random() > 0.5 ? 'H' : 'T'
      this.isTossing = false
      this.cdr.detectChanges()
    }, 1000);
    
    this.cdr.detectChanges()
  }
}
