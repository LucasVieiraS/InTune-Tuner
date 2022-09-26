import { MetronomeService } from './../services/metronome.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  // STATS
  bpm = 145;
  beatsPerMeasure = 4;
  holdingBPM = false;

  // METRONOME OBJECT
  metronome;
  // METRONOME STATE
  metronomeActivated = false;

  constructor(public metronomeService: MetronomeService) { }

  /* BEATS PER MINUTE */
  setBPM(increment: number) {
    if (this.bpm + increment > 1 && this.bpm + increment < 250) {
      this.bpm += increment;
    } else {
      this.bpm = 145;
    }
    this.metronome.timeInterval = 60000 / this.bpm;
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
    if (this.beatsPerMeasure + increment > 0 && this.beatsPerMeasure + increment < 15) {
      this.beatsPerMeasure += increment;
    } else {
      this.beatsPerMeasure = this.beatsPerMeasure === 15 && 1 || 15 ;
    }
    this.metronome.beatsPerMeasure = this.beatsPerMeasure;
  }

  startMetronome() {
    /* eslint-disable no-unused-expressions */
    this.metronomeActivated = !this.metronomeActivated;
    if (this.metronomeActivated) {
      this.metronome.start();
    } else {
      this.metronome.stop();
    }
  }

  /* METRONOME FUNCTIONS */
  ngOnInit() {
    this.metronome = this.metronomeService.timer(60000 / this.bpm, { immediate: true });
    this.metronome.beatsPerMeasure = this.beatsPerMeasure;
  }
}
