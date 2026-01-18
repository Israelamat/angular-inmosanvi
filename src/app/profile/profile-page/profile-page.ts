import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserResponse } from '../../interfaces/auth';
import { ProfileService } from '../../services/profile.service';
import { email, Field, form, required, validate } from '@angular/forms/signals';
import { UpdatePassword } from '../../interfaces/profile';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  imports: [RouterModule, Field],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  showEditProfile = signal(false);
  showChangePassword = signal(false);
  showChangePhoto = signal(false);

  user = this.authService.user;
  // userResource es un HttpResourceRef (devuelto por httpResource)
  userResource = this.profileService.getProfileResource(this.user);

  isMyProfile = computed(() => {
    const user = this.userResource.value()?.user;   
    return user?.id === this.authService.userId();
  });

  // MODEL + FORM: EDIT PROFILE
  profileModel = signal({
    name: '',
    email: '',
  });

  profileForm = form(this.profileModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Invalid email' });
  });

  // MODEL + FORM: CHANGE PASSWORD
  passwordModel = signal({
    password: '',
    repeatPassword: '',
  });

  passwordForm = form(this.passwordModel, (schema) => {
    required(schema.password, { message: 'Password is required' });
    required(schema.repeatPassword, { message: 'Repeat password' });

    validate(schema.repeatPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schema.password)) {
        return {
          kind: 'samePassword',
          message: 'Passwords do not match',
        };
      }
      return null;
    });
  });

  constructor() {
    effect(() => {
      const response = this.userResource.value();      
      if (!response?.user) return;

      this.profileModel.set({
        name: response.user.name,
        email: response.user.email,
      });
    });
  }

  openEditProfile() {
    this.showEditProfile.set(true);
    this.showChangePassword.set(false);
  }

  openChangePassword() {
    this.showChangePassword.set(true);
    this.showEditProfile.set(false);
  }

  cancelForms() {
    this.showEditProfile.set(false);
    this.showChangePassword.set(false);
    this.profileForm().reset();
    this.passwordForm().reset();
  }

  updateProfileInfo(event: Event) {
    event.preventDefault();
    if (this.profileForm().invalid()) return;

    this.profileService
      .updateInfo(this.profileModel())
      .subscribe(() => {
        this.userResource.reload(); 
        this.cancelForms();
        Swal.fire('Success', 'Profile updated successfully', 'success');
      });
  }

  updatePassword(event: Event) {
    event.preventDefault();
    if (this.passwordForm().invalid()) return;

    const payload: UpdatePassword = {
      password: this.passwordModel().password
    };

    this.profileService
      .updatePassword(payload)
      .subscribe(() => {
        this.cancelForms();
        Swal.fire('Success', 'Password updated successfully', 'success');
      });
  }
}
