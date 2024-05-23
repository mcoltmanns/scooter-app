import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ValidationErrors } from 'src/app/models/validation-errors';
import { AuthService } from 'src/app/services/auth.service';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    UserInputComponent,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  /* Initialize subscriptions for the form value changes */
  private loginFormValueChangesSubscription?: Subscription;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public loginForm!: FormGroup;

  /* Variables that contain the values of the input fields */
  public email = '';
  public password = '';

  /* Variables that can hold error messages for the input fields */
  public emailErrorMessage = '';
  public passwordErrorMessage = '';
  public errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    /* Subscribe to the value changes of the form to dynamically update the error messages */
    this.loginFormValueChangesSubscription = this.loginForm.valueChanges.subscribe(() => {
      this.updateErrorMessages();
    });
  }

  ngOnDestroy(): void {
    /* Unsubscribe from all subscriptions to avoid memory leaks */
    this.loginFormValueChangesSubscription?.unsubscribe();
  }

  /* Method to update the error message of a single form control if it is invalid and has been touched */
  updateErrorMessage(formControlName: string, errorMessage: string): string {
    return (!this.loginForm.get(formControlName)?.valid && this.loginForm.get(formControlName)?.touched) ? errorMessage : '';
  }

  updateErrorMessages(): void {
    /* Define default error messages if required input fields are empty */
    let emailErrMsg = 'Bitte geben Sie eine E-Mail-Adresse ein.';
    let passwordErrMsg = 'Bitte geben Sie ein Passwort ein.';

    /* Change the default error messages if the user has entered something but it is invalid. */
    if (!this.loginForm.get('email')?.hasError('required') && this.loginForm.get('email')?.hasError('email')) {
      emailErrMsg = 'Ungültige E-Mail.';
    }
    if (!this.loginForm.get('password')?.hasError('required') && this.loginForm.get('password')?.hasError('minlength')) {
      // passwordErrMsg = 'Das Passwort muss mindestens 8 Stellen haben.';
      passwordErrMsg = 'Das Passwort ist falsch.';
    }

    /* Update the error messages for all input fields */
    this.emailErrorMessage = this.updateErrorMessage('email', emailErrMsg);
    this.passwordErrorMessage = this.updateErrorMessage('password', passwordErrMsg);
  }

  /* Reset all error variables to empty strings */
  resetErrorMessages(): void {
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
  }

  /* Set an error in the respective input form control of the loginForm if the backend
  * returns a validation error for that input field to visually mark the input field as invalid.
  * Additionally assign the error messages to the respective error message variables. */
  assignErrorMessage(validationErrors: ValidationErrors): void {
    if (validationErrors.email) {
      this.loginForm.get('email')?.setErrors({ 'email': true });
      this.emailErrorMessage = validationErrors.email;
    }
    if (validationErrors.password) {
      this.loginForm.get('password')?.setErrors({ 'required': true });
      this.passwordErrorMessage = validationErrors.password;
    }
  }

  /* Method to handle possible backend errors, especially validation errors that the frontend validation does not catch */
  handleBackendError(err: HttpErrorResponse): void {
    this.errorMessage = err.error.message;
    // console.error(err);

    /* Assigns all backend errors to the respective variables */
    if ((err.status === 400 || err.status === 401) && err.error.validationErrors) {
      const validationErrors = err.error.validationErrors;

      /* Reset all error messages before assigning the new ones that came from the backend */
      this.resetErrorMessages();

      /* Assign the error messages to the respective invalid input fields */
      this.assignErrorMessage(validationErrors);
    } else {
      this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      console.error(err);
    }
  }

  onSubmit(): void {
     /* Check if the overall form is valid */
     if (!this.loginForm.valid) {
      /* Mark all form fields as touched to display the error messages */
      this.loginForm.markAllAsTouched();
      this.updateErrorMessages();
      return; // Form submission canceled
    }

    /* Send the login request to the backend */
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.errorMessage = '';
        this.router.navigateByUrl('/search');
      },
      error: (err) => {
        this.handleBackendError(err);
      }
    });
  }
}
