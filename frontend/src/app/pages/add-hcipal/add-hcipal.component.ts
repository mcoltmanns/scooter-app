import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { PaymentService } from 'src/app/services/payment.service';
import { HcipalObj } from 'src/app/models/payment';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { ToastComponent } from 'src/app/components/toast/toast.component';

@Component({
    selector: 'app-hcipal',
    standalone: true,
    templateUrl: './add-hcipal.component.html',
    styleUrl: './add-hcipal.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule, LoadingOverlayComponent, ToastComponent]
})
export class AddhcipalComponent implements OnInit, OnDestroy {
    @ViewChild('toastComponentError') toastComponentError!: ToastComponent; // Get references to the toast component

    /* Initialize subscriptions for the form value changes */
    private hcipalFormValueChangesSubscription?: Subscription;
  
    /* Initialize the FormGroup instance that manages all input fields and their validators */
    public hcipalForm!: FormGroup;

    /* Variable to control the state of the loading overlay */
    public isLoading = false;
  
    /* Variables that mirror the values of the input fields */
    public email = '';
    public password = '';

    /* Variable that can hold a general error message */
    public errorMessage = '';
  
    /* Variables that can hold error messages for the input fields */
    public emailErrorMessage = '';
    public passwordErrorMessage = '';
  
    constructor(
      private paymentService: PaymentService,
      private router: Router,
      private fb: FormBuilder,
      private renderer: Renderer2,
      private el: ElementRef,
      private route: ActivatedRoute
    ) {
      /* Create a FormGroup instance with all input fields and their validators */
      this.hcipalForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
      });
    }
  
    ngOnInit(): void {
      /* Dynamically adjust the height of the body and html element to enable full page scrolling if the screen height gets low */
      this.adjustBodyHeight();

      /* Subscribe to the value changes of the form to dynamically update the error messages */
      this.hcipalFormValueChangesSubscription = this.hcipalForm.valueChanges.subscribe(() => {
        this.updateErrorMessages();
      });
    }
  
    ngOnDestroy(): void {
      /* Reset the height of the body and html element to their default values */
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');

      /* Unsubscribe from all subscriptions to avoid memory leaks */
      this.hcipalFormValueChangesSubscription?.unsubscribe();
    }

    /* Listen for window resize events and adjust the height of the body and html element accordingly */
    @HostListener('window:resize')
    onWindowResize(): void {
      this.adjustBodyHeight();
    }

    /* Method to adjust the height of the body and html element depending on the screen height */
    adjustBodyHeight(): void {
      if (window.innerHeight < 500) {
        this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', 'auto');
        this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', 'auto');
      } else {
        this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
        this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');
      }
    }
  
    /* Method to update the error message of a single form control if it is invalid and has been touched */
    updateErrorMessage(formControlName: string, errorMessage: string): string {
      return (!this.hcipalForm.get(formControlName)?.valid && this.hcipalForm.get(formControlName)?.touched) ? errorMessage : '';
    }
  
    updateErrorMessages(): void {
      /* Define default error messages if required input fields are empty */
      let emailErrMsg = 'Bitte geben Sie eine E-Mail-Adresse ein.';
      const passwordErrMsg = 'Bitte geben Sie ein Passwort ein.';
  
      /* Change the default error messages if the user has entered something but it is invalid. */
      if (!this.hcipalForm.get('email')?.hasError('required') && this.hcipalForm.get('email')?.hasError('email')) {
        emailErrMsg = 'Ungültige E-Mail.';
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

    /* Set an error in the respective input form control of this form if the backend
    * returns a validation error for that input field to visually mark the input field as invalid.
    * Additionally assign the error messages to the respective error message variables. */
    assignErrorMessage(validationErrors: HcipalObj): void {
      if (validationErrors.accountName) {
        this.hcipalForm.get('email')?.setErrors({ 'email': true });
        this.emailErrorMessage = validationErrors.accountName;
      }
      if (validationErrors.accountPassword) {
        this.hcipalForm.get('password')?.setErrors({ 'required': true });
        this.passwordErrorMessage = validationErrors.accountPassword;
      }
    }

    /* Method to handle possible backend errors, especially validation errors that the frontend validation does not catch */
    handleBackendError(err: HttpErrorResponse): void {
      this.errorMessage = err.error.message;

      /* Assigns all backend errors to the respective variables */
      if ((err.status === 400 || err.status === 401) && err.error.validationErrors) {
        const validationErrors = err.error.validationErrors;

        /* Reset all error messages before assigning the new ones that came from the backend */
        this.resetErrorMessages();

        /* Assign the error messages to the respective invalid input fields */
        this.assignErrorMessage(validationErrors);
      } else {
        if (!this.errorMessage) {
          this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
        }
        this.toastComponentError.showToast();
      }
    }
  
    onSubmit(): void {
       /* Check if the overall form is valid */
       if (!this.hcipalForm.valid) {
        /* Mark all form fields as touched to display the error messages */
        this.hcipalForm.markAllAsTouched();
        this.updateErrorMessages();
        return; // Form submission canceled
      }

      /* Grab the latest values from the input fields */
      this.email = this.hcipalForm.get('email')?.value;
      this.password = this.hcipalForm.get('password')?.value;

      /* Send the form data to the backend */
      this.isLoading = true;
      this.paymentService.postHcipal({ accountName: this.email, accountPassword: this.password }).subscribe({
        next: () => {
          this.errorMessage = '';
          this.isLoading = false;

          /* Check if the originState object exists and navigate back to the origin path */
          if (history.state.originState && history.state.originState.path) {
            const statePayload = { originState: history.state.originState, addedPayment: true };
            this.router.navigate([history.state.originState.path], { state: statePayload });
            return;
          }
          /* Navigate back to the payment page as default */
          this.router.navigateByUrl('settings/payment', { state: { addedPayment: true } });
        },
        error: (err) => {
          this.isLoading = false;
          this.handleBackendError(err);
          console.error(err);
        }
      });
    }

    onNavigate(relativePath: string): void {
      /* Pass the originState object to the next route if it exists */
      const originState = history.state.originState ? { originState: history.state.originState } : {};
      this.router.navigate([relativePath], { 
        relativeTo: this.route,
        state: originState
      });
    }

    onCancel(): void {
      /* Check if the originState object exists and navigate back to the origin path */
      if (history.state.originState && history.state.originState.path) {
        const originState = { originState: history.state.originState };
        this.router.navigate([history.state.originState.path], { state: originState });
        return;
      }
      /* Navigate back to the payment page as default */
      this.router.navigate(['settings/payment']);
    }
}
