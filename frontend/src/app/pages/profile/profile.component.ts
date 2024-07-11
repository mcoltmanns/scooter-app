import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ProfileService } from 'src/app/services/profile.service';
import { HttpErrorResponse } from '@angular/common/http';
import {User} from 'src/app/models/user';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators, ReactiveFormsModule} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastComponent } from 'src/app/components/toast/toast.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule, ToastComponent]
})
export class ProfileComponent implements OnInit, OnDestroy{
  @ViewChild('toastComponentError') toastComponentError!: ToastComponent; // Get references to the toast component

  /* Initialize subscriptions for the form value changes */
  private registerFormValueChangesSubscription?: Subscription;
  private password1ValueChangesSubscription?: Subscription;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public profileForm!: FormGroup;

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
  public errorEmailMessage = ''; 
  public errorPassword1Message = '';// error for the first password input field
  public errorPassword2Message = '';// error for the second password input field
  public errorMessage = ''; // general Error Message from the backend

  constructor(private router: Router, private editProfilService: ProfileService, private fb: FormBuilder) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: ['', [Validators.required, this.checkHouseNumber]],
      zipCode: ['', [Validators.required, this.checkZipCode]],
      city: ['', Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      password1: ['', [Validators.minLength(8)]],
      password2: ['', [Validators.minLength(8)]]
    });
    
    /* Set up the custom validator that checks if both passwords are equal */
    this.profileForm.setValidators(this.passwordsMatch.bind(this));
  }

  ngOnInit(): void {

    /* Subscribe to the value changes of the form to dynamically update the error messages */
    this.registerFormValueChangesSubscription = this.profileForm.valueChanges.subscribe(() => {
      this.updateErrorMessages();
    });

    /* Subscribe to the value changes of the first password input field to dynamically update the error messages under the second password input field */
    this.password1ValueChangesSubscription = this.profileForm.get('password1')?.valueChanges.subscribe(() => {
      this.profileForm.get('password2')?.updateValueAndValidity();
    });

    console.log('edit-personal-information Page intialized');

    /* get all the user information from backend */
    this.editProfilService.getUser().subscribe({
      next: (val) => {
        this.user = val.user;
        /* Input fields are filled with the information from the backend */
        this.profileForm.patchValue({
          name: this.user.name,
          street: this.user.street,
          houseNumber: this.user.houseNumber,
          zipCode: this.user.zipCode,
          city: this.user.city,
          email: this.user.email,
          password1: '', // Do not pre-fill passwords, as this is security-critical data
          password2: ''  // Do not pre-fill passwords, as this is security-critical data
        });
      },
      error: (err) => {
        this.user = undefined;
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    /* Unsubscribe from all subscriptions to avoid memory leaks */
    this.password1ValueChangesSubscription?.unsubscribe();
    this.registerFormValueChangesSubscription?.unsubscribe();
  }

  /* Method to update the error message of a single form control if it is invalid and has been touched */
  updateErrorMessage(formControlName: string, errorMessage: string): string {
    return (!this.profileForm.get(formControlName)?.valid && this.profileForm.get(formControlName)?.touched) ? errorMessage : '';
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
    if (!this.profileForm.get('houseNumber')?.hasError('required') && this.profileForm.get('houseNumber')?.hasError('invalidNumericInput')) {
      houseNumberErrMsg = 'Ungültige Hausnummer.';
    }
    if (!this.profileForm.get('zipCode')?.hasError('required') && this.profileForm.get('zipCode')?.hasError('invalidNumericInput')) {
      zipCodeErrMsg = 'Ungültige Postleitzahl.';
    }
    if (!this.profileForm.get('email')?.hasError('required') && this.profileForm.get('email')?.hasError('email')) {
      emailErrMsg = 'Ungültige E-Mail.';
    }
    if (!this.profileForm.get('password1')?.hasError('required') && this.profileForm.get('password1')?.hasError('minlength')) {
      password1ErrMsg = 'Das Passwort muss mindestens 8 Stellen haben.';
    }
    if (!this.profileForm.get('password2')?.hasError('required') && this.profileForm.get('password2')?.hasError('minlength')) {
      password2ErrMsg = 'Das Passwort muss mindestens 8 Stellen haben.';
    }
    if (this.profileForm.get('password1')?.touched && this.profileForm.hasError('passwordsUnequal')) {
      /* If the passwords are not equal, display the error message in the second password input field */
      this.profileForm.get('password2')?.setErrors({ 'passwordsUnequal': true });
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
    if (validationErrors['name']) {
      this.profileForm.get('name')?.setErrors({ 'required': true });
      this.errorNameMessage = validationErrors['name'];
    }
    if (validationErrors['street']) {
      this.profileForm.get('street')?.setErrors({ 'required': true });
      this.errorStreetMessage = validationErrors['street'];
    }
    if (validationErrors['houseNumber']) {
      this.profileForm.get('houseNumber')?.setErrors({ 'required': true });
      this.errorHouseNumberMessage = validationErrors['houseNumber'];
    }
    if (validationErrors['zipCode']) {
      this.profileForm.get('zipCode')?.setErrors({ 'required': true });
      this.errorZipCodeMessage = validationErrors['zipCode'];
    }
    if (validationErrors['city']) {
      this.profileForm.get('city')?.setErrors({ 'required': true });
      this.errorCityMessage = validationErrors['city'];
    }
    if (validationErrors['email']) {
      this.profileForm.get('email')?.setErrors({ 'email': true });
      this.errorEmailMessage = validationErrors['email'];
    }
    if (validationErrors['password']) {
      this.profileForm.get('password1')?.setErrors({ 'required': true });
      this.profileForm.get('password2')?.setErrors({ 'required': true });
      this.errorPassword1Message = validationErrors['password'];
      this.errorPassword2Message = validationErrors['password'];
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
      this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
      this.toastComponentError.showToast();
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
  onSubmit(): void {
    console.log('Button Änderungen speichern pressed');

    /* Check if the overall form is valid */
    if (!this.profileForm.valid) {
      /* Mark all form fields as touched to display the error messages */
      this.profileForm.markAllAsTouched();
      this.updateErrorMessages();
      return; // registration canceled
    }

    /* Grab the latest values from the input fields */
    this.name = this.profileForm.get('name')?.value;
    this.street = this.profileForm.get('street')?.value;
    this.houseNumber = this.profileForm.get('houseNumber')?.value;
    this.zipCode = this.profileForm.get('zipCode')?.value;
    this.city = this.profileForm.get('city')?.value;
    this.email = this.profileForm.get('email')?.value;
    this.password1 = this.profileForm.get('password1')?.value;

    if (!this.profileForm.dirty) {
      console.log('No changes were made');
      this.router.navigateByUrl('/settings'); // Return to setting page if no changes were made
      return;
    }

    /* sends edited data to the backend */
    this.editProfilService.editPersonalInformation(this.name, this.street, this.houseNumber, this.zipCode, this.city, this.email, (this.password1 ? this.password1 : undefined)).subscribe({
      next: () => {
        console.log('editing personal information successfully');
        this.router.navigateByUrl('/settings'); // After successfully editing personal information return to settings page
      },
      error: (err) => {
        this.handleBackendError(err);
      }
    });
  }
}