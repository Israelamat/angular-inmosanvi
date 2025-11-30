import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { PropertiesPage } from './properties-page/properties-page';

@Component({
  selector: 'app-root',
  imports: [Header, PropertiesPage, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-inmosanvi');
}
