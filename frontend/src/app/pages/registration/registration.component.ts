import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from 'src/app/services/registration.service';
import { HttpErrorResponse } from '@angular/common/http';
import {FormControl, Validators } from '@angular/forms';

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
  
  /* All variables for the user-input Content */
  public name = ''; // Content of the "Name" input field
  public street = ''; // Content of the "Straße" input field
  public houseNumber = ''; // Content of the "Nummer" input field
  public zipCode = ''; // Content of the "Postleitzahl" input field
  public city = ''; // Content of the "Ort" input field
  public email = ''; // Content of the "Email" input field
  public password1 = ''; // Content of the first password input field
  public password2 = ''; // Content of the second password input field

  /* error variables */
  public errorNameMessage = '';
  public errorStreetMessage = '';
  public errorHouseNumberMessage = '';
  public errorZipCodeMessage = '';
  public errorCityMessage = '';
  public errorEmailMessage = '';
  public errorPassword1Message = '';// error for the first password input field
  public errorPassword2Message = '';// error for the second password input field
  public errorMessage = ''; // general Error Message from the backend

  /**
   * method that checks whether both passwords are the same
   */
  passwordsMatch(): boolean {
    return this.password1 === this.password2;
  }

  /**
   * Reset all Error variables
   */
  resetErrorMessages(): void {
    this.errorNameMessage = '';
    this.errorStreetMessage = '';
    this.errorHouseNumberMessage = '';
    this.errorZipCodeMessage = '';
    this.errorCityMessage = '';
    this.errorEmailMessage = '';
    this.errorPassword1Message = '';
    this.errorPassword2Message = '';
  }

  checkNumericInput(control: FormControl): { [key: string]: unknown } | null {
    const houseNumberPattern = /^[0-9]+$/; // regular expression that only accepts digits
  
    if (!houseNumberPattern.test(control.value)) {
      return { 'invalidNumericInput': true }; // error message if the input does not contain any digits
    }
  
    return null; // return zero means that no errors were found
  }

  /**
   * Checks if Arguments from the User Input Fields are valid
   */
  validateAttributes(): boolean {
    let registrationIsValid = true;

    /* Define FormControl instances for validating the input fields */
    const nameValidate = new FormControl(this.name, [Validators.required]);
    const streetValidate = new FormControl(this.street, [Validators.required]);
    const houseNumberValidate = new FormControl(this.houseNumber, [Validators.required, this.checkNumericInput]);
    const zipCodeValidate = new FormControl(this.zipCode, [Validators.required, this.checkNumericInput]);
    const cityValidate = new FormControl(this.city, [Validators.required]);
    const emailValidate = new FormControl(this.email, [Validators.required, Validators.email]);
    const password1Validate = new FormControl(this.password1, [Validators.required, Validators.minLength(8)]);
    const password2Validate = new FormControl(this.password2, [Validators.required, Validators.minLength(8)]);

    if (nameValidate.hasError('required')) { // input field is empty
      this.errorNameMessage = 'Bitte geben Sie einen Namen ein.';
      registrationIsValid = false;
    }
    if (streetValidate.hasError('required')) { // input field is empty
      this.errorStreetMessage = 'Bitte geben Sie eine Straße ein.';
      registrationIsValid = false;
    }
    if (houseNumberValidate.hasError('invalidNumericInput')) { //houseNumber is no numeric number
      this.errorHouseNumberMessage = 'Ungültige Hausnummer';
      registrationIsValid = false;
    }
    if (houseNumberValidate.hasError('required')) { // input field is empty
      this.errorHouseNumberMessage = 'Bitte geben Sie eine Hausnummer an ein.';
      registrationIsValid = false;
    }
    if (zipCodeValidate.hasError('invalidNumericInput')) { // zipCode is no numeric number
      this.errorZipCodeMessage = 'Ungültige Postleitzahl';
      registrationIsValid = false;
    }
    if (zipCodeValidate.hasError('required')) { // input field is empty
      this.errorZipCodeMessage = 'Bitte geben Sie eine Postleitzahl ein.';
      registrationIsValid = false;
    }
    if (cityValidate.hasError('required')) { // input field is empty
      this.errorCityMessage = 'Bitte geben Sie einen Ort ein.';
      registrationIsValid = false;
    }
    if (emailValidate.hasError('required')) { // input field is empty
      this.errorEmailMessage = 'Bitte geben Sie eine E-Mail-Adresse ein.';
      registrationIsValid = false;
    }
    if (emailValidate.hasError('email')) { // email is not valid
      this.errorEmailMessage = 'Ungültige E-Mail.';
      registrationIsValid = false;
    }
    if (password1Validate.hasError('required')) { // input field is empty
      this.errorPassword1Message = 'Bitte geben Sie ein Passwort ein.';
      registrationIsValid = false;
    }
    if (password1Validate.hasError('minlength')) { //password length is less than 8
      this.errorPassword1Message = 'Das Passwort muss mindestens 8 Stellen haben.';
      registrationIsValid = false;
    }
    if (password2Validate.hasError('required')) { // input field is empty
      this.errorPassword2Message = 'Bitte geben Sie ein Passwort ein.';
      registrationIsValid = false;
    }
    if (password2Validate.hasError('minlength')) { //password length is less than 8
      this.errorPassword2Message = 'Das Passwort muss mindestens 8 Stellen haben.';
      registrationIsValid = false;
    }
    if(this.password1 !== this.password2){ // passwords do not match
      this.errorPassword2Message = 'Die Passwörter stimmen nicht überein.';
      this.errorPassword2Message = 'Die Passwörter stimmen nicht überein.';
      registrationIsValid = false;
    }
    return registrationIsValid;
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
      this.errorPassword1Message = validationErrors?.password || '';
      this.errorPassword2Message = validationErrors?.password || '';
    } else {
      this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      console.error(`Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`);
    }
  }

  /*
   * The registration method is called up as soon as the registration button is pressed
   */
  registration(): void {
    console.log('registration button pressed');

    /* Reset all ErrorMessages */
    this.resetErrorMessages();

    /* Checks for invalid input */
    if(!this.validateAttributes()){
      return; // registration canceled
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