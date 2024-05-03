import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { AuthService } from 'src/app/services/auth.service';
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
  public errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  login(): void {
    // Diese Funktion muss in Sprint 1 selbst implementiert werden!
    // Die jetztige implementierug ist nur ein Beispiel damit der Prototyp interaktiv funktioniert.
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.errorMessage = '';
        this.router.navigateByUrl('/search');
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });
  }
}
