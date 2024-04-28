import { Component } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { LoginService } from 'src/app/services/login.service';

@Component({
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {

  constructor(private router: Router, private loginService: LoginService) { }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['login']);
  }
}
