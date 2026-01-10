import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/auth';
import { ProfileService } from '../../services/profile.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  imports: [RouterModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  private userId = signal<number>(0);
  private profileUser = signal<User | null>(null);
  private platformId = inject(PLATFORM_ID);

  showEditProfile = signal(false);
  showChangePassword = signal(false);

  userResource = this.profileService.getProfileResource(this.profileUser);
  private loggedInUser: User | null = null;


  isMyProfile = computed(() => {
    return this.profileUser()?.id === this.authService.userId();

  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.profileService.getById(+id).subscribe(res => {
        this.profileUser.set(res.user);
      });
    } else {
      this.profileService.getMe().subscribe(res => {
        this.profileUser.set(res.user);
      });
    }

    if (isPlatformBrowser(this.platformId)) {
      this.authService.isLogged().subscribe(logged => {
        if (logged) {
          this.authService.getMe().subscribe(user => {
            console.log('Logged in user:', user);
            this.loggedInUser = user; // usuario logueado
          });
        }
      });

      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.profileService.getById(+idParam).subscribe(res => {
          console.log('Profile loaded:', res.user);
          this.profileUser.set(res.user);
        });
      } else {
        this.authService.getMe().subscribe(res => {
          this.profileUser.set(res);
        });
      }
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
