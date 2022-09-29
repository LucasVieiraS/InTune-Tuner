import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnInit {

  prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() { }

  toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  ngOnInit() {
    this.toggleDarkTheme(this.prefersDark.matches);
    this.prefersDark.addListener((mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));
  }
}
