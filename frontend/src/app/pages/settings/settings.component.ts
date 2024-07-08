import { Component } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { AuthService } from 'src/app/services/auth.service';
import { Filters} from 'src/app/utils/util-filters';
import { Sorts } from 'src/app/utils/util-sorts';

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
        //"kill" memory of filters and sort on map/list for scooters
        Filters.resetBounds();
        Sorts.sortCancel();
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
