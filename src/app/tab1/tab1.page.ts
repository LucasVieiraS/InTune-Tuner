/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

declare const p5;
declare const ml5;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  // ICONS
  guitarIcon = '../../assets/icon/guitar.svg';
  bassIcon = '../../assets/icon/bass.svg';

  // STATE
  hasStarted = false;
  hasEverStarted = false;
  pitchReachedDelay = false;

  // DISPLAY
  noteName = 'C#';
  selected = 'guitar';
  displayFrequency = 0;

  // STATS
  detuneDifference = 4;
  tunedQueue = 0;
  elapsedTimeRightPitch;

  // P5
  p5;
  advice;
  pitch;

  // NOTES FREQUENCY
  guitarNotes = [
    { note: 'E¹', freq: 82.41 },
    { note: 'A', freq: 110.00 },
    { note: 'D', freq: 146.83 },
    { note: 'G', freq: 196.00 },
    { note: 'B', freq: 246.94 },
    { note: 'E²', freq: 329.63 }
  ];
  bassNotes = [
    { note: 'E', freq: 41 },
    { note: 'A', freq: 55 },
    { note: 'D', freq: 73 },
    { note: 'G', freq: 98 },
  ];

  // UTIL
  selectedToNote = {
    guitar: this.guitarNotes,
    bass: this.guitarNotes
  };

  public pitchReached = new Audio('../../assets/audio/pitch-reached.mp3');

  constructor(private alertController: AlertController) {}

  async presentAlert() {
    if (localStorage.getItem('tunerTerms') == null) return;
    const alert = await this.alertController.create({
      header: 'Permission Alert',
      subHeader: '',
      message: 'InTune Tuner needs your audio input to analyze your sound. Please try refreshing the page and allowing the use of a microphone or system audio to use the tuner.',
      buttons: [
        {
          text: 'Accept',
          role: 'confirm',
          handler: () => {
              localStorage.setItem('tunerTerms', 'true')
          },
        },
      ],
    });

    await alert.present();
  }

  registerInput() {
    this.hasStarted = !this.hasStarted;
    if (!this.hasEverStarted) {
      this.hasEverStarted = true;
      new p5((tuner) => this.handleInput(tuner, this));
    } else {
      this.handleInput(this.p5, this);
    }
  }

  switchTo(instrument: string) {
    this.selected = instrument;
  }

  ionViewDidEnter() {
    this.presentAlert();
  }

  checkTunedQueue() {
    if (!this.elapsedTimeRightPitch) {
      return;
    }
    const endTime = performance.now();
    if (Math.round((endTime - this.elapsedTimeRightPitch) / 1000) > 1 && this.pitchReachedDelay === false) {
      this.pitchReachedDelay = true;
      this.pitchReached.play();
      setTimeout(() => {
        this.pitchReachedDelay = false;
        this.elapsedTimeRightPitch = null;
      }, 1000);
    }
  }

  renderDisplay(tuner: any, toneDiff: number, noteDetected: any) {
    if (tuner.abs(toneDiff) < this.detuneDifference) {
      this.advice = 'Hold there';
      if (this.elapsedTimeRightPitch === null) {
        this.elapsedTimeRightPitch = performance.now();
      }
    } else if (toneDiff > this.detuneDifference) {
      this.advice = 'Tune Down';
      this.elapsedTimeRightPitch = null;
    } else if (toneDiff < -this.detuneDifference ) {
      this.advice = 'Tune Up';
      this.elapsedTimeRightPitch = null;
    }
    this.noteName = noteDetected.note;
    this.checkTunedQueue();
  }

  handleInput(tuner, object) {
    let freq = 0;

    object.p5 = tuner;

    tuner.setup = () => {
      const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
      const audioContext = new AudioContext();
      const mic = new p5.AudioIn(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      let pitch;
      mic.start(loadModel);

      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      function loadModel() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pitch = ml5.pitchDetection(modelUrl, audioContext, mic.stream, modelLoaded);
      }

      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      function modelLoaded() {
        pitch.getPitch(gotPitch);
      }
      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      function gotPitch(error: string, frequency: number) {
        if (error) {
          console.error(error);
        }
        if (frequency) {
          freq = frequency;
        }
        pitch.getPitch(gotPitch);
      }
    };

    tuner.draw = () => {
      let noteDetected;
      let toneDiff = Infinity;
      this.selectedToNote[this.selected].forEach(note => {
        const diff = freq - note.freq;
        this.displayFrequency = Math.floor(freq);
        if (tuner.abs(diff) < tuner.abs(toneDiff)) {
          noteDetected = note;
          toneDiff = diff;
        }
      });
      object.renderDisplay(tuner, toneDiff, noteDetected);
    };
  }
}
