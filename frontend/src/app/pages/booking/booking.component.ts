import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { Product } from 'src/app/models/product';
import { Scooter } from 'src/app/models/scooter';
import { MapService } from 'src/app/services/map.service';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from 'src/app/services/payment.service';
import { BookingService } from 'src/app/services/booking.service';
import { PaymentOptions } from 'src/app/models/payment';
import { CustomValidators } from 'src/app/validators/custom-validators';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { PaymentMethodCardComponent } from 'src/app/components/payment-method-card/payment-method-card.component';
import { AddButtonComponent } from 'src/app/components/add-button/add-button.component';
import { Router } from '@angular/router';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { HttpErrorResponse } from '@angular/common/http';
import { CheckoutObject } from 'src/app/models/booking';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';
import { forkJoin } from 'rxjs';

interface SwitchChangeEvent {
  checked: boolean;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, ReactiveFormsModule, UserInputComponent, ButtonComponent, PaymentMethodCardComponent, AddButtonComponent, ToastComponent, LoadingOverlayComponent, InputSwitchModule, InfoModalComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit, AfterViewInit, OnDestroy {
  /* Manage the state of the success toast */
  @ViewChild('toastComponentPaymentAdded') toastComponentPaymentAdded!: ToastComponent; // Get references to the toast component
  @ViewChild('toastComponentError') toastComponentError!: ToastComponent; // Get references to the toast component
  public showPaymentAddedToast = false;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public checkoutForm!: FormGroup;

  /* Variables to control the state of the booking form (dynamic or prepaid) */
  public isDynamic = true;
  public durationInputClasses = '';
  private toggleDurationInputTimeout: ReturnType<typeof setTimeout> | null = null;
  public showInfoModal = false;

  /* Variable to control the state of the loading overlay */
  public isLoading = false;

  /* Manage payment methods and the state of laoding the payment methods */
  public paymentMethods: PaymentOptions[] = [];
  public paymentsStatus: string | null = null;

  // Variables for data from the backend
  public errorMessage = '';
  public scooterNotFound = false;
  public product: Product | null = null;
  public scooter: Scooter | null = null;
  // loading data variables
  public loadingPage = true;
  public loadingOptions = true;
  public loadingProduct = true;
  public loadingPayment = true;
  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  public constructor(private mapService: MapService, private optionService: OptionService, private fb: FormBuilder, private paymentService: PaymentService, private router: Router, private bookingService: BookingService) {
    /* Create a FormGroup instance with all input fields and their validators */
    this.checkoutForm = this.fb.group({
      checked: [false],
      duration: ['1', [Validators.required, CustomValidators.inInterval(1, 48) ]],
      radioButtonChoice: ['', [Validators.required]]
    });

    /* Bind Information Modal to this instance */
    this.onCloseInfoModal = this.onCloseInfoModal.bind(this);
  }

  ngOnInit(): void {
    this.processRoutingState(); // Handle the state of the previous page

    // read the last number from the url:
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const lastPart = parts[parts.length - 1];
    const scooterId = parseInt(lastPart); // save the last number of URL in scooterId

    this.paymentsStatus = 'Lade Zahlungsmethoden...';
    forkJoin([
      this.mapService.getSingleScooterInfo(scooterId),
      this.mapService.getSingleProductInfo(scooterId),
      this.optionService.getUserPreferences(),
      this.paymentService.getAllPaymentMethods()
    ]).subscribe({
      next: ([scooter, product, preferences, paymentMethods]) => {
        /* Proess the scooter information */
        this.scooter = scooter;
        // console.log('Scooter information:', this.scooter);
    
        /* Process the product information */
        this.product = product;
        // console.log('Product information:', this.product);

        /* Process the user preferences */
        this.option = preferences;
        this.selectedSpeed = this.option.speed;
        this.selectedDistance = this.option.distance;
        this.selectedCurrency = this.option.currency;

        /* Process the payment methods */
        this.paymentMethods = paymentMethods.body;
        this.paymentsStatus = null;

        /* If only one payment method is available, select it by default */
        if(this.paymentMethods.length === 1) {
          this.checkoutForm.controls['radioButtonChoice'].setValue(this.paymentMethods[0].id);
        }
        this.loadingPayment = false;

        this.loadingPage = false;
        this.loadingOptions = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingPage = false;
        this.scooterNotFound = true;
        this.loadingOptions = false;
        this.paymentsStatus = 'Fehler beim Laden der Zahlungsmethoden!';
        this.loadingPayment = false;
        console.log(err);
      }
    });
  }

  ngAfterViewInit(): void {
    /* Show the toast after the view has been initialized */
    if(this.showPaymentAddedToast) {
      this.toastComponentPaymentAdded.showToast();
      this.showPaymentAddedToast = false; // Reset the state to prevent the toast from showing again
    }
  }

  ngOnDestroy(): void {
    /* Clear timeouts if still running */
    this.clearTimeouts();
  }

  processRoutingState(): void {
    /* Handle the state of the previous page */
    const historyState = history.state;

    /* Set the duration state if it was passed from the previous page */
    if (historyState.originState && historyState.originState.duration) {
      this.checkoutForm.get('duration')!.setValue(historyState.originState.duration);
    }

    /* Set the dynamic state if it was passed from the previous page */
    if (historyState && historyState.originState && 'isDynamic' in historyState.originState) {
      this.isDynamic = historyState.originState.isDynamic;
      this.checkoutForm.get('checked')!.setValue(!this.isDynamic);
      if (!this.isDynamic) {
        this.durationInputClasses = 'statically-visible';
      }
    }

    /* If a payment method was added show the success toast */
    if(historyState.addedPayment) {
      this.showPaymentAddedToast = true;
    }

    /* Clear addedPayment to prevent the toast from showing again and
       also get rid of the duration in originState on reload and
       also get rid of the path in originState */
    if (historyState && 'addedPayment' in historyState) {
      delete historyState.addedPayment;
    }
    if (historyState && historyState.originState && 'duration' in historyState.originState) {
      delete historyState.originState.duration;
    }
    if (historyState && historyState.originState && 'path' in historyState.originState) {
      delete historyState.originState.path;
    }
    history.replaceState(historyState, '');   // Update the router state
  }

  /* Get Picture from the product list*/
  getPictureByProductId(img: String | undefined): String{
    return `http://localhost:8000/img/products/${img}.jpg`;
  }

  // Method to calculate the range of the scooter
  calcRange(battery: number | undefined, max_reach: number | undefined): number {
    if(battery === undefined || max_reach === undefined){
      return 0;
    }
    else{
      return Math.ceil(battery / 100 * max_reach);
    }
  }

  /* calculates the price for a scooter*/
  calcPrice(pricePerHour: number |undefined): String {
    if (pricePerHour === undefined){
      return 'Something went wrong...';
    }
    else{
      if (/^\d+$/.test(this.checkoutForm.get('duration')!.value)) {
        const intValue = parseInt(this.checkoutForm.get('duration')!.value, 10); // Convert the string to an integer
        const total = pricePerHour * intValue;
        const totalWithTwoDecimals = total.toFixed(2); // Limited to two decimal places
        return this.convertCurrencyUnits(parseFloat(totalWithTwoDecimals), this.selectedCurrency);
      }
      return '';
    }
  }

  /* Getter methods to check if the inputs of the checkoutForm are valid */
  get durationErrors(): string | null {
    const control = this.checkoutForm.get('duration');
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['inInterval']) {
      return control.errors['inInterval'];
    }
    return null;
  }
  get radioButtonErrors(): string | null {
    const control = this.checkoutForm.get('radioButtonChoice');
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return typeof control.errors['required'] === 'string' ? control.errors['required'] : 'Bitte eine Zahlungsmethode auswählen.';
    }
    return null;
  }

  /* Converts the distances */
  convertDistanceUnits(value: number | undefined, unit: string | undefined): string {
    return UnitConverter.convertDistanceUnits(value, unit);
  }

  /* converts the speeds */
  convertSpeedUnits(value: number | undefined, unit: string |undefined): string {
    return UnitConverter.convertSpeedUnits(value, unit);
  }

  /* Convert the currencies */
  convertCurrencyUnits(value: number, unit: string |undefined): string {
    return UnitConverter.convertCurrencyPerHourUnits(value, unit);
  }

  clearTimeouts(): void {
    if (this.toggleDurationInputTimeout) {
      clearTimeout(this.toggleDurationInputTimeout);
      this.toggleDurationInputTimeout = null;
    }
  }

  updateOriginState(): void {
    const historyState = history.state;

    /* If originState is present, update the isDynamic value */
    if (historyState && historyState.originState) {
      historyState.originState.isDynamic = this.isDynamic;
    }
    /* If originState is not present, create a new object and assign the isDynamic value */
    else {
      historyState.originState = { isDynamic: this.isDynamic };
    }

    history.replaceState(historyState, '');   // Update the router state
  }

  handleSwitchChange(event: SwitchChangeEvent): void {
    /* Clear all timeouts before setting new ones */
    this.clearTimeouts();
    
    /* If the switch is checked, show the duration input field */
    if (event.checked) {
      this.isDynamic = false; // Set the state to not dynamic which adds the duration input field to the DOM
      this.updateOriginState();

      this.toggleDurationInputTimeout = setTimeout(() => {
        this.durationInputClasses = 'visible-div';
      }, 0);
      this.toggleDurationInputTimeout = setTimeout(() => {
        this.durationInputClasses = 'visible-div animate-in';
      }, 200);
    } else { // If the switch is unchecked, hide the duration input field
      this.durationInputClasses = 'visible-div animate-out';
      this.toggleDurationInputTimeout = setTimeout(() => {
        this.durationInputClasses = 'hidden-div';
      }, 200);
      this.toggleDurationInputTimeout = setTimeout(() => {
        this.isDynamic = true; // Set the state back to dynamic which removes the duration input field from the DOM
        this.updateOriginState();
      }, 400);
    }
  }

  /* if plus button is clicked */
  handlePlusClick(): void {
    // console.log('Plus-Button wurde geklickt!');
    // Check whether the string contains only numbers
    if (/^\d+$/.test(this.checkoutForm.get('duration')!.value)) {
      const intValue = parseInt(this.checkoutForm.get('duration')!.value, 10); // Convert the string to an integer
      const newValue = intValue + 1; // add +1
      if (newValue <= 48){
        this.checkoutForm.get('duration')!.setValue(newValue.toString()); // Convert the integer back into a string
      }
      else {
        this.checkoutForm.get('duration')!.setValue('48');
      }
    }
  }
  
  /* if minus button is clicked */
  handleMinusClick():void {
    // console.log('Minus-Button wurde geklickt!');
    // Check whether the string contains only numbers
    if (/^\d+$/.test(this.checkoutForm.get('duration')!.value)) {
      const intValue = parseInt(this.checkoutForm.get('duration')!.value, 10); // Convert the string to an integer
      const newValue = intValue - 1; // subtract -1
      if (newValue >= 1){
        this.checkoutForm.get('duration')!.setValue(newValue.toString()); // Convert the integer back into a string
      }
      else {
        this.checkoutForm.get('duration')!.setValue('1');
      }
    }
  }

  onClickAddPaymentMethod(): void {
    const redirectUrl = `search/checkout/${this.scooter?.id}`;
    const currentDuration = this.checkoutForm.get('duration')!.value;
    const oldOriginState = history.state.originState || {};
    this.router.navigateByUrl('settings/payment/add', {
      state: {
        originState: {
          ...oldOriginState,
          path: redirectUrl,
          duration: currentDuration
        }
      }
    });
  }

  /* Reset all error variables to empty strings */
  resetErrorMessages(): void {
    this.checkoutForm.get('duration')!.setErrors(null);
    this.checkoutForm.get('radioButtonChoice')!.setErrors(null);
  }

  /* Set an error in the respective input form control of this form if the backend
  * returns a validation error for that input field to visually mark the input field as invalid.
  * Additionally assign the error messages to the respective error message variables. */
  assignErrorMessage(validationErrors: CheckoutObject): void {
    if (validationErrors.duration) {
      this.checkoutForm.get('duration')!.setErrors({ 'inInterval': validationErrors.duration });
    }
    if (validationErrors.paymentMethodId) {
      this.checkoutForm.get('radioButtonChoice')!.setErrors({ 'required': validationErrors.paymentMethodId });
    }
    if(validationErrors.scooterId) {
      this.errorMessage = validationErrors.scooterId as string;
      this.toastComponentError.showToast();
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
    if (!this.checkoutForm.valid) {
      this.checkoutForm.markAllAsTouched();
      return; // Form submission canceled
    }

    const finalForm: { scooterId: number; duration?: number; paymentMethodId?: number } = {
      scooterId: this.scooter!.id,
      paymentMethodId: this.checkoutForm.value.radioButtonChoice ? Number(this.checkoutForm.value.radioButtonChoice) : undefined
    };

    if (!this.isDynamic) {
      finalForm.duration = Number(this.checkoutForm.value.duration);
    }

    /* Send the form data to the backend */
    this.isLoading = true;
    this.bookingService.postCheckout(finalForm).subscribe({
      next: (response) => {
        this.errorMessage = '';
        this.isLoading = false;

        /* Update originState before redirecting to the payment success page */
        const historyState = history.state;
        /* Clear listScrollPosition from originState because we can't scroll to this scooter
           in the list because we have just booked it and it is not in the list anymore. */
        if (historyState && historyState.originState && 'listScrollPosition' in historyState.originState) {
          delete historyState.originState.listScrollPosition;
        }
        history.replaceState(historyState, '');   // Update the router state

        /* Destroy the reservation island */
        this.bookingService.destroyReservationIsland();

        /* Navigate to the success page inclduding the booking object and originState if it exists */
        const oldOriginState = history.state.originState || {};
        this.router.navigateByUrl('search/checkout/success', {
          state: {
            ...(Object.keys(oldOriginState).length > 0 && { originState: oldOriginState }),
            booking: response.booking
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.handleBackendError(err);
        console.error(err);
      }
    });
  }

  onCancel(): void {
    /* Pass the originState object to the next route if it exists. */
    const originState = history.state.originState ? { originState: history.state.originState } : {};
    this.router.navigateByUrl(`search/scooter/${this.scooter?.id}`, {
      state: originState
    });
  }

  onCloseInfoModal(): void {
    this.showInfoModal = false;
  }

  onInfoClick(): void {
    this.showInfoModal = true;
  }
}
