import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';


@Component({
    selector: 'app-hcipal',
    standalone: true,
    templateUrl: './add-hcipal.component.html',
    styleUrl: './add-hcipal.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule]
})
export class AddhcipalComponent implements OnInit, OnDestroy {
    /* Initialize subscriptions for the form value changes */
    private loginFormValueChangesSubscription?: Subscription;
  
    /* Initialize the FormGroup instance that manages all input fields and their validators */
    public loginForm!: FormGroup;
  
    /* Variables that contain the values of the input fields */
    public email = '';
  
    /* Variables that can hold error messages for the input fields */
    public emailErrorMessage = '';
    public errorMessage = '';
  
    constructor(
      private router: Router,
      private fb: FormBuilder
    ) {
      /* Create a FormGroup instance with all input fields and their validators */
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
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
  
      /* Change the default error messages if the user has entered something but it is invalid. */
      if (!this.loginForm.get('email')?.hasError('required') && this.loginForm.get('email')?.hasError('email')) {
        emailErrMsg = 'Ungültige E-Mail.';
      }
      /* Update the error messages for all input fields */
      this.emailErrorMessage = this.updateErrorMessage('email', emailErrMsg);
    }
  
    /* Reset all error variables to empty strings */
    resetErrorMessages(): void {
      this.emailErrorMessage = '';
    }
  
    /* Set an error in the respective input form control of the loginForm if the backend
    * returns a validation error for that input field to visually mark the input field as invalid.
    * Additionally assign the error messages to the respective error message variables. */
    assignErrorMessage(validationErrors: ValidationErrors): void {
      if (validationErrors['email']) {
        this.loginForm.get('email')?.setErrors({ 'email': true });
        this.emailErrorMessage = validationErrors['email'];
      }
    }
  
    /* Method to handle possible backend errors, especially validation errors that the frontend validation does not catch */
    handleBackendError(err: HttpErrorResponse): void {
      //backend error handling, depends on backend implementation, thus not done yet
    }
  
    onSubmit(): void {
       /* Check if the overall form is valid */
       if (!this.loginForm.valid) {
        /* Mark all form fields as touched to display the error messages */
        this.loginForm.markAllAsTouched();
        this.updateErrorMessages();
        return; // Form submission canceled
      }
      this.router.navigate(['settings/payment']);
    }
    cancel(): void {
      this.router.navigate(['settings/payment/addPayment']);
    }
}