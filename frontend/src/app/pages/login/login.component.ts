import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { LoginService } from 'src/app/services/login.service';
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  standalone: true,
  imports: [
    ButtonComponent,
    UserInputComponent,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  public email = '';
  public password = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
  ) {}

  login(): void {
    // Diese Funktion muss in Sprint 1 selbst implementiert werden!
    // Die jetztige implementierug ist nur ein Beispiel damit der Prototyp interaktiv funktioniert.
    this.loginService.loggedIn = true;
    this.router.navigateByUrl('/search');
  }
}
