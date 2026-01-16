import {
  ChangeDetectionStrategy, Component, computed, effect, inject, signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, required, minLength, pattern, Field, ValidationError, validate } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EncodeBase64Directive } from '../../directives/encode-base64';
import { LoadButton } from '../../load-button/load-button';
import Swal from 'sweetalert2';
import { RegisterData } from '../../interfaces/auth';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-register-page',
  imports: [FormsModule, CommonModule, EncodeBase64Directive, Field, LoadButton, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow flex flex-col' },
})

export class RegisterPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  avatarPreview = signal<string>('');
  userCreated = signal(false);
  pristine = signal(true);

  newUser = signal<RegisterData>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    avatar: ''
  });

  registerForm = form(this.newUser, (schema) => {
    required(schema.name, { message: 'Full name is required' });
    minLength(schema.name, 4, { message: 'Name must be at least 4 characters' });
    required(schema.email, { message: 'Email is required' });
    pattern(schema.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' });
    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 4, { message: 'Password must be at least 4 characters' });
    required(schema.passwordConfirm, { message: 'Please repeat the same password' });
    required(schema.avatar, { message: 'Avatar is required' });
    validate(schema.passwordConfirm, ({ value, valueOf }) => {
      const email = valueOf(schema.password);
      if (value() !== email) {
        return {
          kind: 'samePassword',
          message: 'Passwords are not equal'
        }
      }
      return null;
    })
  });

  isFormValid = computed(() => {
    const fields = [
      this.registerForm.name(),
      this.registerForm.email(),
      this.registerForm.password(),
      this.registerForm.avatar()
    ];

    const baseValid = fields.every(f => !(f.errors()?.length));

    const passwordsMatch =
      this.registerForm.password().value() ===
      this.registerForm.passwordConfirm().value();

    return baseValid && passwordsMatch;
  });

  constructor() {
    effect(() => {
      this.pristine.set(false);
    });
  }

  passwordsMatchValidator(schema: {
    password: any;
    passwordConfirm: any;
  }): ValidationError[] {
    const password = schema.password.value();
    const confirm = schema.passwordConfirm.value();

    if (!password || !confirm) return [];

    if (password !== confirm) {
      return [
        {
          kind: 'passwordMismatch',
          message: 'Passwords do not match'
        }
      ];
    }

    return [];
  }


  register(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) return;

    this.isSubmitting.set(true);

    const raw = this.newUser();

    const payload = {
      name: raw.name,
      email: raw.email,
      password: raw.password,
      passwordConfirm: raw.passwordConfirm,
      avatar: raw.avatar
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.userCreated.set(true);
        Swal.fire('Success', 'Account created successfully', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Register error', err);
        Swal.fire('Error', 'Could not create account', 'error');
        this.isSubmitting.set(false);
      }
    });
  }

  changeAvatar(fileInput: HTMLInputElement) {
    if (!fileInput.files?.length) {
      this.avatarPreview.set('');
      this.newUser.update(u => ({ ...u, avatar: '' }));
      fileInput.value = '';
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      this.avatarPreview.set(base64);
      this.newUser.update(u => ({ ...u, avatar: base64 }));
    };
  }
}
