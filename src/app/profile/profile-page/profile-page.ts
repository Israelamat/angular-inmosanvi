import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth';

@Component({
  selector: 'app-profile-page',
  imports: [RouterModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  private userId = signal<number>(0);


  showEditProfile = signal(false);
  showChangePassword = signal(false);

  userResource = this.authService.getProfileResource(this.userId);;

 isMyProfile = computed(() => {
    const user = this.userResource.value();
    return user && user.user.id === this.authService.userId();
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(+id);
    }
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
  }
}
