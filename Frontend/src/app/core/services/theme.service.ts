import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'wp_theme';
  isDarkMode = signal<boolean>(this.loadTheme());

  constructor() {
    effect(() => {
      const mode = this.isDarkMode() ? 'dark' : 'light';
      document.body.classList.toggle('dark-theme', this.isDarkMode());
      localStorage.setItem(this.THEME_KEY, mode);
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
