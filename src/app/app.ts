import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { PropertiesPage } from './properties/properties-page/properties-page';
import { TopMenu } from './top-menu/top-menu';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [Footer, TopMenu, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-inmosanvi');
   private authService = inject(AuthService);

  constructor() {
    this.authService.isLogged().subscribe(logged => { //handle reload page 
      if (logged) { 
        this.authService.getMe().subscribe();
      }
    });
  }
}

