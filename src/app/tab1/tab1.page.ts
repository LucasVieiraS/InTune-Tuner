import { Component, OnInit } from '@angular/core';

declare const p5;
declare const ml5;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

  guitarIcon = '../../assets/icon/guitar.svg';
  bassIcon = '../../assets/icon/bass.svg';

  currentFrequency = 0;
  noteName = 'C#';

  p5;
  onCanvasHidden = false;
  pitch;
  freq = 0;

  audioContext = new AudioContext();
  mic = new p5.AudioIn();

  notes = [
    { note: 'E', freq: 82.41 },
    { note: 'A', freq: 110.00 },
    { note: 'D', freq: 146.83 },
    { note: 'G', freq: 196.00 },
    { note: 'B', freq: 246.94 },
    { note: 'E', freq: 329.63 }
  ];

  constructor() {}

  createCanvas() {
    this.onCanvasHidden = true;
    new p5((p) => this.sketch(p));
  }

  gotPitch(error: string, frequency: number) {
    if (error) {
      console.error(error);
    }
    if (frequency) {
        this.freq = frequency;
    }
    this.pitch.getPitch( this.gotPitch);
  }

  modelLoaded() {
    this.pitch.getPitch(this.gotPitch);
  }
  loadModel() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.pitch = ml5.pitchDetection(this.modelUrl, this.audioContext, this.mic.stream, this.modelLoaded);
  }

  public sketch(p) {

    p.setup = () => {
      p.createCanvas(350, 350);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.mic.start(this.loadModel);

    };

    p.draw = () => {
      let noteDetected;
      let toneDiff = Infinity;
      this.notes.forEach(note => {
        const diff = this.freq - note.freq;
        if (p.abs(diff) < p.abs(toneDiff)) {
          noteDetected = note;
          toneDiff = diff;
        }
      });
      const difference = toneDiff;
      p.background(248, 248, 248);
      p.fill(161, 161, 161);
      p.circle(p.width / 2, p.height / 2 - 75, 150);
      if (p.abs(difference) < 1) {
        p.fill(27, 166, 36);
        p.circle(p.width / 2, p.height / 2 - 75, 150);
        p.text('Hold there', p.width / 2, p.height - 20);
      }
      if (difference > 1) {
        p.fill(237, 45, 45);
        p.circle(p.width / 2 + difference / 2, p.height / 2 - 75, 150);
        p.text('Tune Down', p.width / 2, p.height - 20);
      }
      if (difference < -1 ) {
        p.fill(245, 173, 73);
        p.circle(p.width / 2 + difference / 2, p.height / 2 - 75, 150);
        p.text('Tune Up', p.width / 2, p.height - 20);
      }
      p.noStroke();
      p.fill(56, 56, 56);
      p.textAlign(p.CENTER);
      p.textSize(38);
      p.text(noteDetected.note, p.width / 2, p.height / 2 - 68);
    };
  }

  ngOnInit() {
    this.createCanvas();
  }

}
