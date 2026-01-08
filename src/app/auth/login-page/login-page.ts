import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { form, pattern, required } from '@angular/forms/signals';
import { LoginData } from '../../interfaces/auth';
import { LoadButton } from '../../load-button/load-button';
import Swal from 'sweetalert2';
import { GoogleLogin } from '../../google-login/google-login';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, LoadButton, GoogleLogin],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'grow flex items-center justify-center',
  }
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  pristine = signal(true);

  userLogin = signal<LoginData>({
    email: '',
    password: ''
  });

  loginForm = form(this.userLogin, (schema) => {
    required(schema.email, { message: 'Email is required' });
    pattern(schema.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' });
    required(schema.password, { message: 'Password is required' });
  });

  isFormValid = computed(() => {
    const fields = [
      this.loginForm.email(),
      this.loginForm.password()
    ];

    return fields.every(f => !f.errors()?.length);
  })

  constructor() {
    effect(() => this.pristine.set(false));
  }

  login(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) return;

    this.isSubmitting.set(true);

    this.authService.login(this.userLogin()).subscribe({
      next: () => {
        this.authService.getMe().subscribe(user => {
          console.log(user);
          this.isSubmitting.set(true);
          Swal.fire('Success', 'Logged in successfully', 'success');
          this.router.navigate(['/properties']);
        });
      },
      error: (err) => {
        Swal.fire('Error', 'Could not log in with those credentials', 'error');
        this.isSubmitting.set(false);
      }
    })
  }

  loggedGoogle(resp: unknown) {
    const credential = (resp as google.accounts.id.CredentialResponse).credential;
    console.log('Google Credential:', credential);

    // Aquí puedes enviar la credencial a tu backend para autenticar o registrar
    this.authService.loginWithGoogle({ token: credential }).subscribe({
      next: () => this.router.navigate(['/properties']),
      error: (err) => console.error('Google login error', err)
    });
  }
}
