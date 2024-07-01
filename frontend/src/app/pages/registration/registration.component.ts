import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { ValidationErrors } from 'src/app/models/validation-errors';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserPosition } from 'src/app/utils/userPosition';
import { PositionService } from 'src/app/utils/position.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, UserInputComponent, ButtonComponent, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})

export class RegistrationComponent implements OnInit, OnDestroy {
  /* Initialize subscriptions for the form value changes */
  private registerFormValueChangesSubscription?: Subscription;
  private password1ValueChangesSubscription?: Subscription;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public registerForm!: FormGroup;

  /* Variables that contain the values of the input fields */
  public name = '';
  public street = '';
  public houseNumber = '';
  public zipCode = '';
  public city = '';
  public email = '';
  public password1 = ''; // value of the first password input field
  public password2 = ''; // value of the second password input field

  /* Variables that can hold error messages for the input fields */
  public errorNameMessage = '';
  public errorStreetMessage = '';
  public errorHouseNumberMessage = '';
  public errorZipCodeMessage = '';
  public errorCityMessage = '';
  public errorEmailMessage = '';
  public errorPassword1Message = '';// error for the first password input field
  public errorPassword2Message = '';// error for the second password input field
  public errorMessage = ''; // general Error Message from the backend

  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder, private positionService: PositionService) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', [Validators.required, this.checkHouseNumber]],
      zipCode: ['', [Validators.required, this.checkZipCode]],
      city: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password1: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required, Validators.minLength(8)]]
    });
    
    /* Set up the custom validator that checks if both passwords are equal */
    this.registerForm.setValidators(this.passwordsMatch.bind(this));
  }

  ngOnInit(): void {
    /* Subscribe to the value changes of the form to dynamically update the error messages */
    this.registerFormValueChangesSubscription = this.registerForm.valueChanges.subscribe(() => {
      this.updateErrorMessages();
    });

    /* Subscribe to the value changes of the first password input field to dynamically update the error messages under the second password input field */
    this.password1ValueChangesSubscription = this.registerForm.get('password1')?.valueChanges.subscribe(() => {
      this.registerForm.get('password2')?.updateValueAndValidity();
    });

    UserPosition.setUserPosition(this.positionService); // update User position
  }

  ngOnDestroy(): void {
    /* Unsubscribe from all subscriptions to avoid memory leaks */
    this.password1ValueChangesSubscription?.unsubscribe();
    this.registerFormValueChangesSubscription?.unsubscribe();
  }

  /* Method to update the error message of a single form control if it is invalid and has been touched */
  updateErrorMessage(formControlName: string, errorMessage: string): string {
    return (!this.registerForm.get(formControlName)?.valid && this.registerForm.get(formControlName)?.touched) ? errorMessage : '';
  }

  updateErrorMessages(): void {
    /* Define default error messages if required input fields are empty */
    const nameErrMsg = 'Bitte geben Sie einen Namen ein.';
    const streetErrMsg = 'Bitte geben Sie eine Straße ein.';
    let houseNumberErrMsg = 'Bitte geben Sie eine Hausnummer ein.';
    let zipCodeErrMsg = 'Bitte geben Sie eine 5-stellige Postleitzahl ein.';
    const cityErrMsg = 'Bitte geben Sie einen Ort ein.';
    let emailErrMsg = 'Bitte geben Sie eine E-Mail-Adresse ein.';
    let password1ErrMsg = 'Bitte geben Sie ein Passwort ein.';
    let password2ErrMsg = 'Bitte geben Sie ein Passwort ein.';

    /* Change the default error messages if the user has entered something but it is invalid. */
    if (!this.registerForm.get('houseNumber')?.hasError('required') && this.registerForm.get('houseNumber')?.hasError('invalidNumericInput')) {
      houseNumberErrMsg = 'Ungültige Hausnummer.';
    }
    if (!this.registerForm.get('zipCode')?.hasError('required') && this.registerForm.get('zipCode')?.hasError('invalidNumericInput')) {
      zipCodeErrMsg = 'Ungültige Postleitzahl.';
    }
    if (!this.registerForm.get('email')?.hasError('required') && this.registerForm.get('email')?.hasError('email')) {
      emailErrMsg = 'Ungültige E-Mail.';
    }
    if (!this.registerForm.get('password1')?.hasError('required') && this.registerForm.get('password1')?.hasError('minlength')) {
      password1ErrMsg = 'Das Passwort muss mindestens 8 Stellen haben.';
    }
    if (!this.registerForm.get('password2')?.hasError('required') && this.registerForm.get('password2')?.hasError('minlength')) {
      password2ErrMsg = 'Das Passwort muss mindestens 8 Stellen haben.';
    }
    if (this.registerForm.get('password1')?.touched && this.registerForm.hasError('passwordsUnequal')) {
      /* If the passwords are not equal, display the error message in the second password input field */
      this.registerForm.get('password2')?.setErrors({ 'passwordsUnequal': true });
      password2ErrMsg = 'Die Passwörter stimmen nicht überein.';
    }

    /* Update the error messages for all input fields */
    this.errorNameMessage = this.updateErrorMessage('name', nameErrMsg);
    this.errorStreetMessage = this.updateErrorMessage('street', streetErrMsg);
    this.errorHouseNumberMessage = this.updateErrorMessage('houseNumber', houseNumberErrMsg);
    this.errorZipCodeMessage = this.updateErrorMessage('zipCode', zipCodeErrMsg);
    this.errorCityMessage = this.updateErrorMessage('city', cityErrMsg);
    this.errorEmailMessage = this.updateErrorMessage('email', emailErrMsg);
    this.errorPassword1Message = this.updateErrorMessage('password1', password1ErrMsg);
    this.errorPassword2Message = this.updateErrorMessage('password2', password2ErrMsg);
  }

  /* Custom Validator to ensure that both entered passwords are equal */
  passwordsMatch(control: AbstractControl): {[s: string]: boolean} | null {
    const password1 = control.get('password1')?.value;
    const password2 = control.get('password2')?.value;
  
    if (password1 !== password2) {
      return { 'passwordsUnequal': true };
    }
    return null;  // If the validation is successful you have to pass nothing or null
  }

  /* Custom Validator to check whether an input is a house number */
  checkHouseNumber(control: FormControl): { [key: string]: unknown } | null {
    const re = /^[0-9]+(([A-Za-z])|([-/.]([0-9]|[A-Za-z])))?$/; // start of line followed by at least one digit followed by ((any upper or lower case) or (a separator followed by (a digit or an upper case or lower case letter))) 0 or 1 times followed by end of line
  
    if (!re.test(control.value)) {
      return { 'invalidHouseNumberInput': true }; // error message if the input is not a house number
    }
  
    return null; // return null means no validation errors
  }

  // check if zip code is 5 digits
  checkZipCode(control: FormControl): { [key: string]: unknown } | null {
    const re = /^[0-9][0-9][0-9][0-9][0-9]$/; // match 5 digits

    if(!re.test(control.value)) {
      return { 'invalidZipCodeInput': true }; // error message if the input is not a zip code
    }

    return null;
  }

  /* Reset all error variables to empty strings */
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

  /* Set an error in the respective input form control of the registerForm if the backend
  * returns a validation error for that input field to visually mark the input field as invalid.
  * Additionally assign the error messages to the respective error message variables. */
  assignErrorMessage(validationErrors: ValidationErrors): void {
    if (validationErrors.name) {
      this.registerForm.get('name')?.setErrors({ 'required': true });
      this.errorNameMessage = validationErrors.name;
    }
    if (validationErrors.street) {
      this.registerForm.get('street')?.setErrors({ 'required': true });
      this.errorStreetMessage = validationErrors.street;
    }
    if (validationErrors.houseNumber) {
      this.registerForm.get('houseNumber')?.setErrors({ 'required': true });
      this.errorHouseNumberMessage = validationErrors.houseNumber;
    }
    if (validationErrors.zipCode) {
      this.registerForm.get('zipCode')?.setErrors({ 'required': true });
      this.errorZipCodeMessage = validationErrors.zipCode;
    }
    if (validationErrors.city) {
      this.registerForm.get('city')?.setErrors({ 'required': true });
      this.errorCityMessage = validationErrors.city;
    }
    if (validationErrors.email) {
      this.registerForm.get('email')?.setErrors({ 'email': true });
      this.errorEmailMessage = validationErrors.email;
    }
    if (validationErrors.password) {
      this.registerForm.get('password1')?.setErrors({ 'required': true });
      this.registerForm.get('password2')?.setErrors({ 'required': true });
      this.errorPassword1Message = validationErrors.password;
      this.errorPassword2Message = validationErrors.password;
    }
  }

  /* Method to handle possible backend errors, especially validation errors that the frontend validation does not catch */
  handleBackendError(err: HttpErrorResponse): void {
    this.errorMessage = err.error.message;
    console.error(err);

    /* Assigns all backend errors to the respective variables */
    if (err.status === 400 && err.error.validationErrors) {
      const validationErrors = err.error.validationErrors;

      /* Reset all error messages before assigning the new ones that came from the backend */
      this.resetErrorMessages();

      /* Assign the error messages to the respective invalid input fields */
      this.assignErrorMessage(validationErrors);
    } else {
      this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      console.error(`Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`);
    }
  }

  /* The registration method is called up as soon as the registration button is pressed */
  onSubmit(): void {
    console.log('registration button pressed');

    /* Check if the overall form is valid */
    if (!this.registerForm.valid) {
      /* Mark all form fields as touched to display the error messages */
      this.registerForm.markAllAsTouched();
      this.updateErrorMessages();
      return; // registration canceled
    }

    UserPosition.setUserPosition(this.positionService); // update User position

    this.authService.register(this.name, this.street, this.houseNumber, this.zipCode, this.city, this.email, this.password1).subscribe({
      next: () => {
        console.log('registration successfully');
        this.router.navigateByUrl('/search'); // after successfully registration return to search (map) page since the server will automatically log in the user after registration
      },
      error: (err) => {
        this.handleBackendError(err);
      }
    });
  }
}