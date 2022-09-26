import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetronomeService {

  start;
  expected;
  theTimeout;
  timeInterval;
  timeout;
  round;
  stop;

  public count = 0;
  public beatsPerMeasure = 4;
  public click1 = new Audio('../../assets/audio/click1.mp3');
  public click2 = new Audio('../../assets/audio/click2.mp3');

  constructor() { }

  setCount(value: number) {
    this.count = value;
  }

  playClick1(currentTime: number) {
    this.click1.play();
    this.click1.currentTime = currentTime;
  }

  playClick2(currentTime: number) {
    this.click2.play();
    this.click2.currentTime = currentTime;
  }

  timer(timeInterval, options) {
    this.timeInterval = timeInterval;

    this.start = () => {
      this.expected = Date.now() + this.timeInterval;
      this.theTimeout = null;

      if (options.immediate) {
        if (this.count === this.beatsPerMeasure) {
          this.setCount(0);
        }
        if (this.count === 0) {
          this.playClick1(0);
        } else {
          this.playClick2(0);
        }
        this.setCount(this.count + 1);
      }

      this.timeout = setTimeout(this.round, this.timeInterval);
    };

    this.stop = () => {
      clearTimeout(this.timeout);
    };

    this.round = () => {
      const drift = Date.now() - this.expected;
      if (drift > this.timeInterval) {
        if (options.errorCallback) {
          options.errorCallback();
        }
      }
      if (this.count === this.beatsPerMeasure) {
        this.setCount(0);
      }
      if (this.count === 0) {
        this.playClick1(0);
      } else {
        this.playClick2(0);
      }
      this.setCount(this.count + 1);
      this.expected += this.timeInterval;
      this.timeout = setTimeout(this.round, this.timeInterval - drift);
      // Next round time interval: this.timeInterval - drift
    };

    this.beatsPerMeasure = 0;

    return this;
  }
}
