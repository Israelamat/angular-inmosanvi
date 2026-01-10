import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserResponse } from '../../interfaces/auth';
import { ProfileService } from '../../services/profile.service';
import { isPlatformBrowser } from '@angular/common';
import { HttpResourceRef } from '@angular/common/http';

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

  //userResource = this.profileService.getProfileResource(this.profileUser);
  private loggedInUser: User | null = null;


  isMyProfile = computed(() => {
    return this.profileUser()?.id === this.authService.userId();

  });

  userResource!: HttpResourceRef<UserResponse | undefined>;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.userResource = this.profileService.getProfileResource(this.profileUser);

    if (idParam) {
      this.profileService.getById(+idParam).subscribe(res => {
        this.profileUser.set(res.user); 
      });
    } else {
      this.authService.getMe().subscribe(res => {
        this.profileUser.set(res);    
      });
    }

    if (isPlatformBrowser(this.platformId)) {
      this.authService.isLogged().subscribe(logged => {
        if (logged) {
          this.authService.getMe().subscribe(user => {
            this.loggedInUser = user;
          });
        }
      });
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
