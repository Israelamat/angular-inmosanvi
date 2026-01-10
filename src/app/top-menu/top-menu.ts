import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-top-menu',
  imports: [RouterLink],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class TopMenu {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLogged = computed(() => this.authService.logged());

  logout = () => {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
