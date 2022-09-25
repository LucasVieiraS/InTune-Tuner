import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  metronomeIcon = '../../assets/icon/metronome.svg';
  guitarPick = '../../assets/icon/guitar-pick.svg';
  musicNote = '../../assets/icon/music-note.svg';

  constructor() {}

}
