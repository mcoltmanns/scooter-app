import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from 'src/app/services/registration.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [UserInputComponent, CommonModule, ButtonComponent, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})

export class RegistrationComponent implements OnInit{
  public name = ''; // Content of the "Name" input field
  public street = ''; // Content of the "Straße" input field
  public houseNumber = ''; // Content of the "Nummer" input field
  public zipCode = ''; // Content of the "Postleitzahl" input field
  public city = ''; // Content of the "Ort" input field
  public email = ''; // Content of the "Email" input field
  public password1 = ''; // Content of the first password input field
  public password2 = ''; // Content of the second password input field
  public errorMessage = ''; // Error Message

  // Constructor for the routes, registrationService
  constructor(private router: Router, private registrationService: RegistrationService) {}

  /**
   * method that checks whether both passwords are the same
   */
  passwordsMatch(): boolean {
    return this.password1 === this.password2;
  }

  /**
   * Registration method
   */
  registration(): void {
    console.log('registration button pressed');
    if (!this.passwordsMatch()) {
      this.errorMessage = 'Passwörter stimmen nicht überein';
      console.log(this.errorMessage);
      return;// stops registration process
    }
    this.registrationService.register(this.name, this.street, this.houseNumber, this.zipCode, this.city, this.email, this.password1).subscribe({
      next: () => {
        console.log('registration successfully');
        this.router.navigateByUrl('/login'); // after successfully registration return to login
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.error(err);
      }
    });
  }

  ngOnInit(): void {
    console.log('RegisterPage initialized!');
  }
}

