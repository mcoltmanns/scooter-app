import { Component } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {

  constructor(private router: Router, private authService: AuthService) { }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
