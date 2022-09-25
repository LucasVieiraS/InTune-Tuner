import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  bpm = 145;
  holdingBPM = false;

  bpm2 = 4;

  constructor() { }

  /* BEATS PER MINUTE */
  setBPM(increment: number) {
    if (this.bpm + increment > 1 && this.bpm + increment < 250) {
      this.bpm += increment;
    } else {
      this.bpm = 145;
    }
  }

  startLoop(increment: number) {
    setTimeout(() => {
      if (this.holdingBPM === true) {
        if (this.bpm + increment > 1 && this.bpm + increment < 250) {
          this.bpm += increment;
        } else {
          this.bpm = this.bpm >= 249 && 1 || 250 ;
        }
        this.startLoop(increment);
      }
    }, 1500);
  }

  setHoldingBPM(increment: number) {
    this.holdingBPM = true;
    this.startLoop(increment);
  }

  stopHoldingBPM() {
    this.holdingBPM = false;
  }

  /* BEATS PER MEASURE */
  setBPM2(increment: number) {
    this.holdingBPM = false;
    if (this.bpm2 + increment > 0 && this.bpm2 + increment < 15) {
      this.bpm2 += increment;
    } else {
      this.bpm2 = this.bpm2 === 15 && 1 || 15 ;
    }
  }

}
