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

  ngOnInit(): void {
    console.log('Registration Page intialized');
  }
  
  public name = ''; // Content of the "Name" input field
  public street = ''; // Content of the "Straße" input field
  public houseNumber = ''; // Content of the "Nummer" input field
  public zipCode = ''; // Content of the "Postleitzahl" input field
  public city = ''; // Content of the "Ort" input field
  public email = ''; // Content of the "Email" input field
  public password1 = ''; // Content of the first password input field
  public password2 = ''; // Content of the second password input field
  
  public errorMessage = ''; // Error Message
  public errorEmptyFieldMessage = '';
  public emptyField = ''; //checks for empty field

  //Backend Errors:
  public errorHouseNumberMessage = '';
  public errorZipCodeMessage = '';
  public errorPasswordMessage = '';
  public errorEmailMessage = '';

  // Constructor for the routes, registrationService
  constructor(private router: Router, private registrationService: RegistrationService) {}

  /**
   * Checks if a input field is empty
   */
  checkEmptyField(): void {
    if (!this.name) {
      this.emptyField = 'Name';
    } else if (!this.street) {
      this.emptyField = 'Straße';
    } else if (!this.houseNumber) {
      this.emptyField = 'Nummer';
    } else if (!this.zipCode) {
      this.emptyField = 'Postleitzahl';
    } else if (!this.city) {
      this.emptyField = 'Ort';
    } else if (!this.email) {
      this.emptyField = 'Email';
    } else if (!this.password1) {
      this.emptyField = 'Passwort';
    } else if (!this.password2) {
      this.emptyField = 'Passwort wiederholen';
    } else {
      this.emptyField = '';
    }
  }
  /**
   * method that checks whether both passwords are the same
   */
  passwordsMatch(): boolean {
    return this.password1 === this.password2;
  }
  
  /**
   * Checks if the email is valid
   */
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Registration method
   */
  registration(): void {
    console.log('registration button pressed');

    this.checkEmptyField();
    if (this.emptyField) {
      this.errorEmptyFieldMessage = `Bitte füllen Sie das Feld '${this.emptyField}' aus.`;
      console.log(this.errorEmptyFieldMessage);
      return;// stops registration process
    }

    if (!this.validateEmail(this.email)) { // checks for correct E-Mail
      this.errorEmailMessage = 'Ungültige E-Mail-Adresse';
      console.log(this.errorEmailMessage);
      return;// stops registration process
    }

    if (!this.passwordsMatch()) { //checks for matching passwords
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
        console.error(`Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`);

        if (err.status === 400 && err.error.validationErrors) {
          const validationErrors = err.error.validationErrors;
          if (validationErrors.houseNumber) {
            this.errorHouseNumberMessage = validationErrors.houseNumber;
          }
          if (validationErrors.zipCode) {
            this.errorZipCodeMessage = validationErrors.zipCode;
          }
          if (validationErrors.email) {
            this.errorEmailMessage = validationErrors.email;
          }
          if (validationErrors.password) {
            this.errorPasswordMessage = validationErrors.password;
          }
        } 
        else {
          this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
          console.error(`Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`);
        }
        console.log(this.errorHouseNumberMessage);
        console.log(this.errorZipCodeMessage);
        console.log(this.errorEmailMessage);
        console.log(this.errorPasswordMessage);
      }
    });
  }
}