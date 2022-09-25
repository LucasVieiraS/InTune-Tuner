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

  timer(timeInterval, options) {
    this.timeInterval = timeInterval;
    console.log('is running');

    // Add method to start timer
    this.start = () => {
      // Set the expected time. The moment in time we start the timer plus whatever the time interval is.
      this.expected = Date.now() + this.timeInterval;
      // Start the timeout and save the id in a property, so we can cancel it later
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
      console.log('Timer Started');
    };
    // Add method to stop timer
    this.stop = () => {

      clearTimeout(this.timeout);
      console.log('Timer Stopped');
    };
    // Round method that takes care of running the callback and adjusting the time
    this.round = () => {
      console.log('timeout', this.timeout);
      // The drift will be the current moment in time for this round minus the expected time..
      const drift = Date.now() - this.expected;
      // Run error callback if drift is greater than time interval, and if the callback is provided
      if (drift > this.timeInterval) {
        // If error callback is provided
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
      // Increment expected time by time interval for every round after running the callback function.
      this.expected += this.timeInterval;
      console.log('Drift:', drift);
      console.log('Next round time interval:', this.timeInterval - drift);
      // Run timeout again and set the timeInterval of the next iteration to the original time interval minus the drift.
      this.timeout = setTimeout(this.round, this.timeInterval - drift);
    };

    this.beatsPerMeasure = 0;

    return this;
  }

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
}
