import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';


@Component({
    selector: 'app-swpsafe',
    standalone: true,
    templateUrl: './add-swpsafe.component.html',
    styleUrl: './add-swpsafe.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule]
})
export class AddswpsafeComponent implements OnInit, OnDestroy {
  /* Initialize subscriptions for the form value changes */
  private swpsafeValueChangesSubscription?: Subscription;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public swpsafeForm!: FormGroup;

  /* Variables that mirror the values of the input fields */
  public code = '';

  /* Variables that can hold error messages for the input fields */
  public codeErrorMessage= '';

  constructor(private router: Router, private fb: FormBuilder, private renderer: Renderer2, private el: ElementRef) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.swpsafeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]]
    });
  }

  ngOnInit(): void {
    /* Dynamically adjust the height of the body and html element to enable full page scrolling if the screen height gets low */
    this.adjustBodyHeight();

    /* Subscribe to the value changes of the form to dynamically update the error messages */
    this.swpsafeValueChangesSubscription = this.swpsafeForm.valueChanges.subscribe(() => {
      this.updateErrorMessages();
    });
  }

  ngOnDestroy(): void {
    /* Reset the height of the body and html element to their default values */
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');

    /* Unsubscribe from all subscriptions to avoid memory leaks */
    this.swpsafeValueChangesSubscription?.unsubscribe();
  }

  /* Listen for window resize events and adjust the height of the body and html element accordingly */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.adjustBodyHeight();
  }

  /* Method to adjust the height of the body and html element depending on the screen height */
  adjustBodyHeight(): void {
    if (window.innerHeight < 420) {
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', 'auto');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', 'auto');
    } else {
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');
    }
  }

  /* Method to update the error message of a single form control if it is invalid and has been touched */
  updateErrorMessage(formControlName: string, errorMessage: string): string {
    return (!this.swpsafeForm.get(formControlName)?.valid && this.swpsafeForm.get(formControlName)?.touched) ? errorMessage : '';
  }

  updateErrorMessages(): void {
    /* Define default error messages if required input fields are empty */
    let codeErrMsg = 'Bitte geben Sie einen Code ein.';

    /* Change the default error messages if the user has entered something but it is invalid. */
    if (!this.swpsafeForm.get('code')?.hasError('required') && (this.swpsafeForm.get('code')?.hasError('minlength') || this.swpsafeForm.get('code')?.hasError('maxlength'))) {
      codeErrMsg = 'Der Code muss aus 12 Stellen bestehen.';
    }

    /* Update the error messages for all input fields */
    this.codeErrorMessage = this.updateErrorMessage('code', codeErrMsg);
  }

  /* Reset all error variables to empty strings */
  resetErrorMessages(): void {
    this.codeErrorMessage = '';
  }

  onSubmit(): void {
    /* Check if the overall form is valid */
    if (!this.swpsafeForm.valid) {
      /* Mark all form fields as touched to display the error messages */
      this.swpsafeForm.markAllAsTouched();
      this.updateErrorMessages();
      return; // Form submission canceled
    }

    /* Grab the latest values from the input fields */
    this.code = this.swpsafeForm.get('code')?.value;
    console.log('Code:', this.code);
  }

  onCancel(): void {
        this.router.navigate(['settings/payment/addPayment']);
  }
}
