import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import {FormControl, Validators } from '@angular/forms';
import { ProfileService } from 'src/app/services/profile.service';
import { HttpErrorResponse } from '@angular/common/http';
import {User} from 'src/app/models/user';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent]
})
export class ProfileComponent implements OnInit{
  constructor(private router: Router, private editProfilService: ProfileService) {}

  public user?: User; // User model

  /* Variables for the value of the input fields */
  public name = '';
  public street = '';
  public houseNumber = '';
  public zipCode = '';
  public city = '';
  public email = '';
  public password1 = ''; // value of the first password input field
  public password2 = ''; // value of the second password input field

  /* error variables */
  public errorNameMessage = '';
  public errorStreetMessage = '';
  public errorHouseNumberMessage = '';
  public errorZipCodeMessage = '';
  public errorCityMessage = '';
  public errorEmailMessage = ''; // ----Diese kann man vielleicht noch entfernen falls das Backend das nicht braucht -----
  public errorPassword1Message = '';// error for the first password input field
  public errorPassword2Message = '';// error for the second password input field
  public errorMessage = ''; // general Error Message from the backend

  ngOnInit(): void {
    console.log('edit-personal-information Page intialized');

    /* get all the user information from backend */
    this.editProfilService.getUser().subscribe({
      next: (val) => {
        this.user = val.user;
        console.log(val);
        console.log(this.user);
        console.log('Benutzername:', this.user.name);
      },
      error: (err) => {
        this.user = undefined;
        console.log(err);
      }
    });
  }


  /*
        this.name = this.user?.name || '';
        this.street = this.user?.street || '';
        this.houseNumber = this.user?.houseNumber || '';
        this.zipCode = this.user?.zipCode || '';
        this.city = this.user?.city || '';
        this.email = this.user?.email || '';
        */

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

  /**
   * checks whether an input is a numeric number
   */
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
      this.errorHouseNumberMessage = 'Bitte geben Sie eine Hausnummer ein.';
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

  /**
   * abort method is called when registration button is pressed
   */
  abortEdit(): void{
    console.log('Button Abbrechen pressed');
    this.router.navigateByUrl('/settings'); // return to setting page after abort editing personal information
  }

  /**
   * is called up when the "Änderungen Speichern" button is pressed
   * gets called when button is pressed
   */
  editPersonalInformation(): void {
    console.log('Button Änderungen speichern pressed');

    /* Reset all ErrorMessages */
    this.resetErrorMessages();

    /* Checks for invalid input */
    if(!this.validateAttributes()){
      //return; // editing personal information canceled
    }

    /* sends edited data to the backend */
    this.editProfilService.editPersonalInformation(this.name, this.street, this.houseNumber, this.zipCode, this.city, this.email, this.password1).subscribe({
      next: () => {
        console.log('editing personal information successfully');
        this.router.navigateByUrl('/settings'); // after successfully editing personal information return to settings page
      },
      error: (err) => {
        this.handleBackendError(err);
      }
    });
  }
}