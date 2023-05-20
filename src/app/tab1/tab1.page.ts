/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable max-len */
// Interfaces
interface Note {
  note: string;
  freq: number;
}

interface SelectedToNote {
  guitar: Note[];
  bass: Note[];
}

// Component
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

declare const p5;
declare const ml5;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  // ICONS
  guitarIcon = '../../assets/icon/guitar.svg';
  bassIcon = '../../assets/icon/bass.svg';

  // STATE
  hasStarted = false;
  hasEverStarted = false;
  firstStartLoad = false;
  pitchReachedDelay = false;

  // DISPLAY
  noteName = 'E¹';
  selected = 'guitar';
  displayFrequency = 0;
  tunningSpecificNote;

  // STATS
  detuneDifference = 3;
  tunedQueue = 0;
  elapsedTimeRightPitch: number;

  // P5
  p5: any;
  p5alt: any;
  advice: string;
  pitch: any;

  // NOTES FREQUENCY
  guitarNotes: Note[] = [
    { note: 'E¹', freq: 82.41 },
    { note: 'A', freq: 110.00 },
    { note: 'D', freq: 146.83 },
    { note: 'G', freq: 196.00 },
    { note: 'B', freq: 246.94 },
    { note: 'E²', freq: 329.63 }
  ];
  bassNotes: Note[] = [
    { note: 'E', freq: 41 },
    { note: 'A', freq: 55 },
    { note: 'D', freq: 73 },
    { note: 'G', freq: 98 },
  ];

  // UTIL
  selectedToNote: SelectedToNote = {
    guitar: this.guitarNotes,
    bass: this.guitarNotes
  };

  permissionMessage = 'InTune Tuner needs your audio input to analyze your sound. Please try refreshing the page and allowing the use of a microphone or system audio to use the tuner';

  pitchReached = new Audio('../../assets/audio/pitch-reached.mp3');

  constructor(private alertController: AlertController) { }

  setTunningSpecificNote(event: any) {
    const note = event.target.innerHTML;
    if (this.tunningSpecificNote === note) {
      this.tunningSpecificNote = null;
      this.noteName = this.selected === 'guitar' ? this.guitarNotes[0].note : this.bassNotes[0].note;
    } else {
      this.tunningSpecificNote = note;
      this.noteName = note;
    }
  }

  ngOnInit() {
    this.presentAlert();
  }

  async presentAlert() {
    if (localStorage.getItem('tunerTerms') === null) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Permission Alert',
      subHeader: '',
      message: this.permissionMessage,
      buttons: [
        {
          text: 'Accept',
          role: 'confirm',
          handler: () => {
            localStorage.setItem('tunerTerms', 'true');
          },
        },
      ],
    });

    await alert.present();
  }

  registerInput(): any {
    this.hasStarted = !this.hasStarted;
    this.pitchReachedDelay = false;
    if (!this.hasEverStarted) {
      this.hasEverStarted = true;
      this.firstStartLoad = true;
      return new p5((tuner: any) => this.handleInput(tuner, this));
    }
    return this.handleInput(this.p5, this.p5alt);
  }

  switchTo(instrument: string) {
    this.selected = instrument;
    this.noteName = this.selected === 'guitar' ? this.guitarNotes[0].note : this.bassNotes[0].note;
    this.tunningSpecificNote = null;
    this.pitchReachedDelay = false;
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

  renderDisplay(tuner: any, toneDiff: number, noteDetected: Note) {
    if (tuner.abs(toneDiff) < this.detuneDifference) {
      this.advice = 'Hold there';
      if (this.elapsedTimeRightPitch === null) {
        this.elapsedTimeRightPitch = performance.now();
      }
    } else if (toneDiff > this.detuneDifference) {
      this.advice = 'Tune Down';
      this.elapsedTimeRightPitch = null;
    } else if (toneDiff < -this.detuneDifference) {
      this.advice = 'Tune Up';
      this.elapsedTimeRightPitch = null;
    }
    if (this.noteName !== noteDetected.note && this.pitchReachedDelay === true) {
      this.pitchReachedDelay = false;
    }
    this.noteName = this.tunningSpecificNote != null ? this.tunningSpecificNote : noteDetected.note;
    this.checkTunedQueue();
  }

  handleInput(tuner: any, object: any) {
    let freq = 0;

    object.p5 = tuner;
    object.p5alt = object;

    tuner.setup = () => {
      const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
      const audioContext = new AudioContext();
      const mic = new p5.AudioIn();
      let pitch;
      mic.start(loadModel);

      function loadModel() {
        pitch = ml5.pitchDetection(modelUrl, audioContext, mic.stream, modelLoaded);
      }

      function modelLoaded() {
        object.firstStartLoad = false;
        pitch.getPitch(gotPitch);
      }

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
      let noteDetected: Note;
      let toneDiff = Infinity;
      this.selectedToNote[this.selected].forEach(note => {
        if (this.tunningSpecificNote && this.tunningSpecificNote !== note.note) {
          return;
        }
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
