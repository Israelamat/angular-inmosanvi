import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { form, pattern, required } from '@angular/forms/signals';
import { LoginData } from '../../interfaces/auth';
import { LoadButton } from '../../load-button/load-button';
import Swal from 'sweetalert2';
import { GoogleLogin } from '../../google-login/google-login';
import { FbLogin } from '../../facebook-login/fb-login';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';


@Component({
  selector: 'app-login-page',
  imports: [FormsModule, LoadButton, GoogleLogin, RouterLink, FbLogin, FontAwesomeModule],
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
  iconFacebook = faFacebook;
  errorMessage: string | null = null;

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
    console.log('Google Credential:', credential); // Debe ser un JWT de Google
    this.errorMessage = null;
    this.authService.loginWithGoogle({ token: credential }).subscribe({
      next: () => this.router.navigate(['/properties']),
      error: (err) => {
        console.error('Google login error', err)
        this.errorMessage = 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
      }
    });
  }


  loggedFacebook(resp: fb.StatusResponse) {
    const token = resp.authResponse?.accessToken;
    if (!token) return;

    this.isSubmitting.set(true);

    this.authService.loginWithFacebook({ token }).subscribe({
      next: () => this.handlePostLogin(),
      error: (err) => {
        console.error('Facebook login error', err);
        this.isSubmitting.set(false);
        Swal.fire('Error', 'Facebook login failed', 'error');
      }
    });
  }

  private handlePostLogin() {
    this.authService.getMe().subscribe(user => {
      this.isSubmitting.set(false);
      if (user) {
        Swal.fire('Success', 'Logged in successfully', 'success');
        this.router.navigate(['/properties']);
      } else {
        Swal.fire('Error', 'Could not fetch user data', 'error');
      }
    });
  }
}