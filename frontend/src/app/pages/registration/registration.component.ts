import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from 'src/app/services/registration.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [UserInputComponent, CommonModule, ButtonComponent, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})

export class RegistrationComponent implements OnInit{

  constructor(private router: Router, private registrationService: RegistrationService) {}

  ngOnInit(): void {
    console.log('Registration Page intialized');
  }
  
  /* All variables for the user-input Content: */
  public name = ''; // Content of the "Name" input field
  public street = ''; // Content of the "Straße" input field
  public houseNumber = ''; // Content of the "Nummer" input field
  public zipCode = ''; // Content of the "Postleitzahl" input field
  public city = ''; // Content of the "Ort" input field
  public email = ''; // Content of the "Email" input field
  public password1 = ''; // Content of the first password input field
  public password2 = ''; // Content of the second password input field

  /* error variables only used for frontend */
  public errorEmptyFieldMessage = '';
  public emptyField = ''; //checks for empty field
  public checkpasswordsMessage = ''; //checks if passwords are the same
  /* error variables: */
  public errorNameMessage = '';
  public errorStreetMessage = '';
  public errorHouseNumberMessage = '';
  public errorZipCodeMessage = '';
  public errorCityMessage = '';
  public errorEmailMessage = '';
  public errorPasswordMessage = ''; // Message from backend
  public errorMessage = ''; // general Error Message from the backend

  /**
   * Checks if an input field is empty in frontend
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
   * Checks if the email is valid
   */
  validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * method that checks whether both passwords are the same
   */
  passwordsMatch(): boolean {
    return this.password1 === this.password2;
  }

  /**
   * Reset all Error functions
   */
  resetErrorMessages(): void {
    this.errorNameMessage = '';
    this.errorStreetMessage = '';
    this.errorHouseNumberMessage = '';
    this.errorZipCodeMessage = '';
    this.errorCityMessage = '';
    this.errorEmailMessage = '';
    this.errorPasswordMessage = '';
    this.errorEmptyFieldMessage = '';
    this.checkpasswordsMessage = '';
  }

  /**
   * Handels all backend errors
   */
  handleBackendError(err: HttpErrorResponse): void {
    this.errorMessage = err.error.message;
    console.error(err);
  
    /* assigns all backend errors to the variables */
    if (err.status === 400 && err.error.validationErrors) {
      const validationErrors = err.error.validationErrors;
      this.errorNameMessage = validationErrors?.name || '';
      this.errorStreetMessage = validationErrors?.street || '';
      this.errorHouseNumberMessage = validationErrors?.houseNumber || '';
      this.errorZipCodeMessage = validationErrors?.zipCode || '';
      this.errorCityMessage = validationErrors?.city || '';
      this.errorEmailMessage = validationErrors?.email || '';
      this.errorPasswordMessage = validationErrors?.password || '';
    } else {
      this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      console.error(`Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`);
    }
  }

  /*
   * Registration method
   */
  registration(): void {
    console.log('registration button pressed');

    /* Reset all ErrorMessages */
    this.resetErrorMessages();

    /*
    this.checkEmptyField();
    if (this.emptyField) {
      this.errorEmptyFieldMessage = `Bitte füllen Sie das Feld '${this.emptyField}' aus.`;
      console.log(this.errorEmptyFieldMessage);
      return;// stops registration process
    }
    */

    if (!this.validateEmail(this.email)) { // checks for correct E-Mail
      this.errorEmailMessage = 'Ungültige E-Mail-Adresse';
      console.log(this.errorEmailMessage);
      return;// stops registration process
    }

    if (!this.passwordsMatch()) { // checks for matching passwords
      this.checkpasswordsMessage = 'Passwörter stimmen nicht überein';
      console.log(this.checkpasswordsMessage);
      return;// stops registration process
    }
    this.registrationService.register(this.name, this.street, this.houseNumber, this.zipCode, this.city, this.email, this.password1).subscribe({
      next: () => {
        console.log('registration successfully');
        this.router.navigateByUrl('/login'); // after successfully registration return to login
      },
      error: (err) => {
        this.handleBackendError(err);
      }
    });
  }
}