import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';


@Component({
    selector: 'app-bachelorcard',
    standalone: true,
    templateUrl: './add-bachelorcard.component.html',
    styleUrl: './add-bachelorcard.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule]
})
export class AddbachelorcardComponent implements OnInit, OnDestroy {
  /* Initialize subscriptions for the form value changes */
  private bachelorcardFormValueChangesSubscription?: Subscription;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public bachelorcardForm!: FormGroup;

  /* Variables that mirror the values of the input fields */
  public name = '';
  public cardNumber = '';
  public checkDigit = '';
  public expiry = '';

  /* Variables that can hold error messages for the input fields */
  public nameErrorMessage = '';
  public cardNumberErrorMessage = '';
  public checkDigitErrorMessage = '';
  public expiryErrorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.bachelorcardForm = this.fb.group({
      name: ['', [Validators.required]],
      cardNumber: ['', [Validators.required]],
      checkDigit: ['', [Validators.required]],
      expiry: ['', [Validators.required]]
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
    const cardNumberErrMsg = 'Bitte geben Sie eine Kartennummer ein.';
    const checkDigitErrMsg = 'Bitte geben Sie eine Prüfziffer ein.';
    const expiryErrMsg = 'Bitte geben Sie an, bis wann die Bachelorcard gültig ist.';
    
    /* Update the error messages for all input fields */
    this.nameErrorMessage = this.updateErrorMessage('name', nameErrMsg);
    this.cardNumberErrorMessage = this.updateErrorMessage('cardNumber', cardNumberErrMsg);
    this.checkDigitErrorMessage = this.updateErrorMessage('checkDigit', checkDigitErrMsg);
    this.expiryErrorMessage = this.updateErrorMessage('expiry', expiryErrMsg);
  }

  /* Reset all error variables to empty strings */
  resetErrorMessages(): void {
    this.nameErrorMessage = '';
    this.cardNumberErrorMessage = '';
    this.checkDigitErrorMessage = '';
    this.expiryErrorMessage = '';
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
    this.checkDigit = this.bachelorcardForm.get('checkDigit')?.value;
    this.expiry = this.bachelorcardForm.get('expiry')?.value;

    console.log('Name:', this.name);
    console.log('Card number:', this.cardNumber);
    console.log('Check digit:', this.checkDigit);
    console.log('Expiry:', this.expiry);

    // this.router.navigate(['settings/payment']);
  }

  onCancel(): void {
    this.router.navigate(['settings/payment/addPayment']);
  }
}
