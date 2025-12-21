import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grow flex items-center justify-center',
  }
})
export class LoginPage {
  #router = inject(Router);
  
  login = () =>{
    this.#router.navigate(['/properties']);
  }
}
