import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    private hcipalFormValueChangesSubscription?: Subscription;
  
    /* Initialize the FormGroup instance that manages all input fields and their validators */
    public hcipalForm!: FormGroup;
  
    /* Variables that mirror the values of the input fields */
    public email = '';
    public password = '';
  
    /* Variables that can hold error messages for the input fields */
    public emailErrorMessage = '';
    public passwordErrorMessage = '';
  
    constructor(
      private router: Router,
      private fb: FormBuilder,
      private renderer: Renderer2,
      private el: ElementRef
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
      console.log('Email:', this.email);
      console.log('Password:', this.password);
      // this.router.navigate(['settings/payment']);
    }

    onCancel(): void {
      this.router.navigate(['settings/payment/add']);
    }
}
