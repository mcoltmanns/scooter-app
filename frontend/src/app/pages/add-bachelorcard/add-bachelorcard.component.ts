import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { PaymentService } from 'src/app/services/payment.service';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';

interface BachelorcardObj {
  name?: string;
  cardNumber?: string;
  securityCode?: string;
  expirationDate?: string;
}

@Component({
    selector: 'app-bachelorcard',
    standalone: true,
    templateUrl: './add-bachelorcard.component.html',
    styleUrl: './add-bachelorcard.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule, LoadingOverlayComponent]
})
export class AddbachelorcardComponent implements OnInit, OnDestroy {
  /* Initialize subscriptions for the form value changes */
  private bachelorcardFormValueChangesSubscription?: Subscription;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public bachelorcardForm!: FormGroup;

  /* Variable to control the state of the loading overlay */
  public isLoading = false;

  /* Variables that mirror the values of the input fields */
  public name = '';
  public cardNumber = '';
  public securityCode = '';
  public expirationDate = '';

  /* Variable that can hold a general error message */
  public errorMessage = '';

  /* Variables that can hold error messages for the input fields */
  public nameErrorMessage = '';
  public cardNumberErrorMessage = '';
  public securityCodeErrorMessage = '';
  public expirationDateErrorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.bachelorcardForm = this.fb.group({
      name: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern('\\d{4}-\\d{4}-\\d{4}-\\d{4}')]],  // credit card number, e.g. 1234-5678-9012-3456
      securityCode: ['', [Validators.required, Validators.pattern('\\d{3}')]],  // 3 digits, e.g. 000, 123, 101
      expirationDate: ['', [Validators.required, Validators.pattern('(0?[1-9]|1[0-2])/\\d{2}')]]  // MM/YY, e.g. 12/23, 01/25, 1/25
    });
  }

  ngOnInit(): void {
    /* Dynamically adjust the height of the body and html element to enable full page scrolling if the screen height gets low */
    this.adjustBodyHeight();

    /* Subscribe to the value changes of the form to dynamically update the error messages */
    this.bachelorcardFormValueChangesSubscription = this.bachelorcardForm.valueChanges.subscribe(() => {
      this.updateErrorMessages();
    });
  }

  ngOnDestroy(): void {
    /* Reset the height of the body and html element to their default values */
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');

    /* Unsubscribe from all subscriptions to avoid memory leaks */
    this.bachelorcardFormValueChangesSubscription?.unsubscribe();
  }

  /* Listen for window resize events and adjust the height of the body and html element accordingly */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.adjustBodyHeight();
  }

  /* Method to adjust the height of the body and html element depending on the screen height */
  adjustBodyHeight(): void {
    if (window.innerHeight < 670) {
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', 'auto');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', 'auto');
    } else {
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');
    }
  }

  /* Method to update the error message of a single form control if it is invalid and has been touched */
  updateErrorMessage(formControlName: string, errorMessage: string): string {
    return (!this.bachelorcardForm.get(formControlName)?.valid && this.bachelorcardForm.get(formControlName)?.touched) ? errorMessage : '';
  }

  updateErrorMessages(): void {
    /* Define default error messages if required input fields are empty */
    const nameErrMsg = 'Bitte geben Sie einen Namen ein.';
    let cardNumberErrMsg = 'Bitte geben Sie eine Kartennummer ein.';
    let securityCodeErrMsg = 'Bitte geben Sie eine Prüfziffer ein.';
    let expirationDateErrMsg = 'Bitte geben Sie ein Ablaufdatum ein.';

    /* Change the default error messages if the user has entered something but it is invalid. */
    if (!this.bachelorcardForm.get('cardNumber')?.hasError('required') && this.bachelorcardForm.get('cardNumber')?.hasError('pattern')) {
      cardNumberErrMsg = 'Ungültige Kartennummer.';
    }
    if (!this.bachelorcardForm.get('securityCode')?.hasError('required') && this.bachelorcardForm.get('securityCode')?.hasError('pattern')) {
      securityCodeErrMsg = 'Ungültige Prüfziffer.';
    }
    if (!this.bachelorcardForm.get('expirationDate')?.hasError('required') && this.bachelorcardForm.get('expirationDate')?.hasError('pattern')) {
      expirationDateErrMsg = 'Ungültiges Ablaufdatum (MM/YY).';
    }
    
    /* Update the error messages for all input fields */
    this.nameErrorMessage = this.updateErrorMessage('name', nameErrMsg);
    this.cardNumberErrorMessage = this.updateErrorMessage('cardNumber', cardNumberErrMsg);
    this.securityCodeErrorMessage = this.updateErrorMessage('securityCode', securityCodeErrMsg);
    this.expirationDateErrorMessage = this.updateErrorMessage('expirationDate', expirationDateErrMsg);
  }

  /* Reset all error variables to empty strings */
  resetErrorMessages(): void {
    this.nameErrorMessage = '';
    this.cardNumberErrorMessage = '';
    this.securityCodeErrorMessage = '';
    this.expirationDateErrorMessage = '';
  }

  /* Set an error in the respective input form control of this form if the backend
  * returns a validation error for that input field to visually mark the input field as invalid.
  * Additionally assign the error messages to the respective error message variables. */
  assignErrorMessage(validationErrors: BachelorcardObj): void {
    if (validationErrors.name) {
      this.bachelorcardForm.get('name')?.setErrors({ 'required': true });
      this.nameErrorMessage = validationErrors.name;
    }
    if (validationErrors.cardNumber) {
      this.bachelorcardForm.get('cardNumber')?.setErrors({ 'pattern': true });
      this.cardNumberErrorMessage = validationErrors.cardNumber;
    }
    if (validationErrors.securityCode) {
      this.bachelorcardForm.get('securityCode')?.setErrors({ 'pattern': true });
      this.securityCodeErrorMessage = validationErrors.securityCode;
    }
    if (validationErrors.expirationDate) {
      this.bachelorcardForm.get('expirationDate')?.setErrors({ 'pattern': true });
      this.expirationDateErrorMessage = validationErrors.expirationDate;
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
    }
  }

  onSubmit(): void {
    /* Check if the overall form is valid */
    if (!this.bachelorcardForm.valid) {
      /* Mark all form fields as touched to display the error messages */
      this.bachelorcardForm.markAllAsTouched();
      this.updateErrorMessages();
      return; // Form submission canceled
    }

    /* Grab the latest values from the input fields */
    this.name = this.bachelorcardForm.get('name')?.value;
    this.cardNumber = this.bachelorcardForm.get('cardNumber')?.value;
    this.securityCode = this.bachelorcardForm.get('securityCode')?.value;
    this.expirationDate = this.bachelorcardForm.get('expirationDate')?.value;

    /* Omit a leading zero in the month part of the expirationDate date if it is present */
    if (this.expirationDate.charAt(0) === '0') {
      this.expirationDate = this.expirationDate.substring(1);
    }

    /* Send the form data to the backend */
    this.isLoading = true;
    this.paymentService.postBachelorCard({ name: this.name, cardNumber: this.cardNumber, securityCode: this.securityCode, expirationDate: this.expirationDate }).subscribe({
      next: () => {
        this.errorMessage = '';
        this.isLoading = false;
        this.router.navigateByUrl('settings/payment');
        // this.router.navigate(['settings/payment']);
      },
      error: (err) => {
        this.isLoading = false;
        this.handleBackendError(err);
        // console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['settings/payment/add']);
  }
}
