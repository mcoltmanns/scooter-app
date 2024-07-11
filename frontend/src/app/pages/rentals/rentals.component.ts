import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActiveRental, PastRental, ProductWithScooterId } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';
import { MapService } from 'src/app/services/map.service';
import { CommonModule } from '@angular/common';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { FilterButtonComponent } from 'src/app/components/filter-button/filter-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Filters } from 'src/app/utils/util-filters';
import { InfoModalComponent } from 'src/app/components/info-modal/info-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { trigger, transition, style, animate, sequence } from '@angular/animations';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { ConfirmModalComponent } from 'src/app/components/confirm-modal/confirm-modal.component';
import { UserPosition } from 'src/app/utils/userPosition';
import { PositionService } from 'src/app/utils/position.service';


interface InfoModal {
  show: boolean;
  title: string;
  rentalId: number;
  rentalObj: PastRental | ActiveRental | null;
  scooterId: number;
  createdAt: string;
  endedAt: string;
  renew: boolean;
  isActive: boolean;
  remainingTime?: string;
  pastTime?: string;
  mode: 'past' | 'prepaid' | 'dynamic';
}

@Component({
    selector: 'app-rentals',
    standalone: true,
    templateUrl: './rentals.component.html',
    styleUrl: './rentals.component.css',
    animations: [
      trigger('itemEnter', [
        transition('void => *', [
          sequence([
            style({ height: '0', opacity: 0, transform: 'scale(0)' }), // Initial state
            animate('300ms ease-out', style({ height: '*', opacity: 0, transform: 'scale(0.925)' })), // Animate height first
            animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })) // Then animate opacity
          ])
        ]),
      ]),
    ],
    imports: [CommonModule, FilterButtonComponent, UserInputComponent, ButtonComponent, ReactiveFormsModule, InfoModalComponent, LoadingOverlayComponent, ToastComponent, ConfirmModalComponent]
})
export class RentalsComponent implements OnInit, OnDestroy {
  /* Access the DOM elements that get animated */
  @ViewChildren('rentalItem') rentalItems!: QueryList<ElementRef>;
  @ViewChild('greenBar') greenBar!: ElementRef;
  @ViewChild('activeRentalList') activeRentalList!: ElementRef;
  @ViewChild('pastRentalsTitle') pastRentalsTitle!: ElementRef;

  /* Variables to manage the animation timeouts */
  private animationTimeout: ReturnType<typeof setTimeout> | null = null;
  private waitForAnimationEndTimeout: ReturnType<typeof setTimeout> | null = null;

  /* Variables for controlling intervals */
  private updateIntervals: Map<number, ReturnType<typeof setInterval>> = new Map();

  /* Get references to the toast component */
  @ViewChild('toastComponentError') toastComponentError!: ToastComponent;

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public bookingFilterForm!: FormGroup;

  public constructor(private rentalService: RentalService, private mapService: MapService, private optionService: OptionService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private positionService: PositionService) {
    //form group for the booking filter
    this.bookingFilterForm = this.fb.group({
      lower: ['', this.dateValidator],
      upper: ['', this.dateValidator]
    });

    /* Bind Information Modal to this instance */
    this.onNavigateToScooter = this.onNavigateToScooter.bind(this);
    this.onCloseInfoModal = this.onCloseInfoModal.bind(this);
    this.onClosePaymentOffsetInfoModal = this.onClosePaymentOffsetInfoModal.bind(this);

    /* Bind Confirm Modal to this instance */
    this.onConfirmConfirmModal = this.onConfirmConfirmModal.bind(this);
    this.onCloseConfirmModal = this.onCloseConfirmModal.bind(this);

    /* Bind Hot Error Modal to this instance */
    this.onCloseHotError = this.onCloseHotError.bind(this);
  }

  // Variable to control the visibility of the loading spinner
  public isLoading = true;
  public processingEndRental = false;

  // Object to track loaded state of images by scooterId
  imageLoaded: { [scooterId: string]: boolean } = {};

  // Variables for storing all rentals and the product information
  public activeRentals: ActiveRental[] = [];
  public pastRentals: PastRental[] = [];
  public products: ProductWithScooterId[] = [];
  public errorMessage = '';
  public hotErrorMessage: string | null = null;

  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  /* Info modal configuration */
  public infoModal: InfoModal = {
    show: false,
    title: 'Buchungsdetails',
    rentalId: 0,
    rentalObj: null,
    scooterId: 0,
    createdAt: '',
    endedAt: '',
    renew: false,
    isActive: false,
    remainingTime: undefined,
    pastTime: undefined,
    mode: 'past'
  };

  public showPaymentOffsetInfoModal = false;

  /* Confirm modal configuration */
  public confirmModal = {
    showConfirmModal: false,
    infoModalWasOpen: false,
    scooterName: '',
    confirmCallback: (): void => {
      // Do nothing by default
    }
  };

  // User Location
  public userLocation: { latitude: number, longitude: number } | null = null;

  //variables for the filters----------------------

  public filteredRentals: PastRental[] = []; //filtered version of the PastRental[]
  
  filterMenuVisible = false;//visibility variable of filter menu
  //filter form input variables
  public lower = '';
  public upper = '';

  //-----------------------------------------------

  ngOnInit(): void {
    /* Fetch all rental information, product information and user preferences */
    forkJoin([
      this.rentalService.getRentalInfo(),
      this.rentalService.getRentalProduct(),
      this.optionService.getUserPreferences()
    ]).subscribe({
      next: ([rentalsResponse, productsResponse, preferencesResponse]) => {
        /* Get all scooter bookings (rentals) for the User from the backend */
        this.activeRentals = rentalsResponse.activeRentals;

        /* Start the countdown/countups for each active rental */
        this.initIntervalsForActiveRental();

        this.pastRentals = rentalsResponse.pastRentals;
        this.pastRentals.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());  // Sort past rentals by descending end date (most recently ended rental first)
        this.filteredRentals = this.pastRentals;  // Initially show all past rentals
        // this.loadingDataScooter = false;
        // this.filteredRentals = this.pastRentals; //to see something on the list of past rentals

        /* Get all products for the rentals of the user */
        this.products = productsResponse;
        // this.loadingDataProduct = false;

        /* Get the metrics/units the user set in the settings */
        this.option = preferencesResponse;
        this.selectedSpeed = this.option.speed;
        this.selectedDistance = this.option.distance;
        this.selectedCurrency = this.option.currency;
        // this.loadingDataOption = false;

        this.isLoading = false;

        /* Accessing the optional rental query parameter to show the info modal for that rental if it exists */
        this.route.queryParams.subscribe(params => {
          const paramRentalId = params['rental'];

          const rental = this.getRentalObjByRentalId(paramRentalId);
          if (rental) {
            this.setUpAndShowInfoModal(rental.rental, rental.type);
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        // this.loadingDataScooter = false;
        // this.loadingDataProduct = false;
        // this.loadingDataOption = false;
        this.toastComponentError.showToast();
        this.isLoading = false;
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    /* Clear timeouts if still running */
    this.clearAnimationTimeout();
    this.clearWaitForAnimationTimeout();

    /* Clear all rental countdown intervals */
    this.updateIntervals.forEach((interval) => clearInterval(interval));

    /* Clear the Map after clearing all intervals */
    this.updateIntervals.clear();
  }

  // Function to call when an image is loaded
  onImageLoad(scooterId: string): void {
    this.imageLoaded[scooterId] = true;
  }

  initIntervalsForActiveRental(): void {
    /* Start the countdown for each preipaid active rental */
    this.activeRentals.forEach((rental) => {
      if (!rental.renew) {
        const now = new Date();
        const nextActionTime = new Date(rental.nextActionTime);
        rental.remainingTime = this.rentalDuration(now.toISOString(), nextActionTime.toISOString());
        this.startCountdownForPrepaidActiveRental(rental);
      }
      if (rental.renew) {
        const now = new Date();
        rental.pastTime = this.rentalDuration(rental.createdAt, now.toISOString());
        rental.total_price = this.convertCurrencyUnits((this.getExactRentalDurationInHours(rental.createdAt, now.toString())*this.toNumber(rental.price_per_hour)).toString(), this.selectedCurrency);
        this.startCountupForDynamicActiveRental(rental);
      }
    });
  }

  /* Function to start a countdown for a prepaid active rental */
  startCountdownForPrepaidActiveRental(rental: ActiveRental): void {
    const interval = setInterval(() => {
      const now = new Date();
      const nextActionTime = new Date(rental.nextActionTime);
      const remainingTimeMs = nextActionTime.getTime() - now.getTime();
      if (remainingTimeMs <= 0) {
        clearInterval(interval);
        this.updateIntervals.delete(rental.id);
        rental.remainingTime = '0m 0s';

        /* Animate moving the active rental to the past rentals */
        this.moveRentalFromActiveToPast(rental, this.generatePastRentalFromActiveRental(rental));
      } else {
        // Update the remaining time in a human-readable format
        rental.remainingTime = this.rentalDuration(now.toISOString(), nextActionTime.toISOString());
      }
    }, 1000); // Update every second

    this.updateIntervals.set(rental.id, interval);
  }

  /* Function to start a countup for a prepaid active rental */
  startCountupForDynamicActiveRental(rental: ActiveRental): void {
    const interval = setInterval(() => {
      const now = new Date();
      rental.pastTime = this.rentalDuration(rental.createdAt, now.toISOString());
      rental.total_price = this.convertCurrencyUnits((this.getExactRentalDurationInHours(rental.createdAt, now.toString())*this.toNumber(rental.price_per_hour)).toString(), this.selectedCurrency);
    }, 1000); // Update every second

    this.updateIntervals.set(rental.id, interval);
  }

  generatePastRentalFromActiveRental(activeRental: ActiveRental): PastRental {
    const targetPaidDuration = (new Date()).getTime() - new Date(activeRental.createdAt).getTime();
    return {
      id: activeRental.id,
      price_per_hour: activeRental.price_per_hour,
      total_price: (parseFloat(activeRental.price_per_hour) * (targetPaidDuration / (1000 * 60 * 60))).toFixed(2),
      paymentOffset: activeRental.paymentOffset,
      createdAt: activeRental.createdAt,
      endedAt: activeRental.nextActionTime.toString(),
      userId: activeRental.userId,
      scooterId: activeRental.scooterId
    };
  }

  async getUserLatestUserLocation(): Promise<boolean> {
    /* Set the latest user position so that the we can later send the longitude and latitude to the backend */
    return UserPosition.setUserPosition(this.positionService).then((result) => {
      if (result) {
        this.userLocation = { latitude: this.positionService.latitude, longitude: this.positionService.longitude };
        return true;
      } else {
        this.userLocation = null;
        this.errorMessage = 'Standort nicht verfügbar.';
        this.toastComponentError.showToast();
        return false;
      }
    }).catch((error) => {
      console.error(error);
      this.userLocation = null;
      this.errorMessage = 'Standort nicht verfügbar.';
      this.toastComponentError.showToast();
      return false;
    });
  }

  getExactRentalDurationInHours(begin: string, end: string): number {
    const date1 = new Date(begin);
    const date2 = new Date(end);

    const diffMs = date2.getTime() - date1.getTime();
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
  }

  /* how long a user booked the scooter */
  rentalDuration(begin: string, end: string): string {
    const date1 = new Date(begin);
    const date2 = new Date(end);

    const diffMs = date2.getTime() - date1.getTime();
    const diffSecondsTotal = Math.round(diffMs / 1000); // Round to the nearest second
    const hours = Math.floor(diffSecondsTotal / 3600); // 3600 seconds in an hour
    const minutes = Math.floor((diffSecondsTotal % 3600) / 60); // Remaining minutes
    const seconds = diffSecondsTotal % 60; // Remaining seconds, already rounded

    if (hours > 0) {
      return `${hours}h ${minutes}m`; // Return hours and minutes if hours > 0
    } else {
      return `${minutes}m ${seconds}s`; // Return minutes and seconds if hours == 0
    }
  }

  /* Get the price for each scooter */
  getPriceByScooterId(scooterId: number): number | undefined {
    const product = this.products.find(p => p.scooterId === scooterId);
    return product ? product.price_per_hour : undefined;
  }

  /* Calculates the total price for a scooter booking*/
  getTotalPrice(scooterId: number, begin: string, end: string): string | undefined {
    const pricePerHour = this.getPriceByScooterId(scooterId);
    if (pricePerHour === undefined) return undefined;

    const durationHours = Number(this.rentalDuration(begin, end));
    const totalPrice = pricePerHour * durationHours;
    const roundedPrice = totalPrice.toFixed(2);

    // Check whether the decimal value has only one digit
    return roundedPrice.includes('.') ? roundedPrice : `${roundedPrice}.00`;
  }

  /* Get the name for each scooter */
  getNameByScooterId(scooterId: number): string | undefined {
    const product = this.products.find(p => p.scooterId === scooterId);
    return product ? product.name.toUpperCase() : undefined;
  }

  /* Get Picture from the product list*/
  getPictureByScooterId(scooterId: number): string | null {
    const product = this.products.find(p => p.scooterId === scooterId);
    if (!product) {
      return null;
    }
    return `http://localhost:8000/img/products/${product ? product.name : undefined}.jpg`;
  }

  /* Formats date time from the backend */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  /* Convert the currencies values */
  convertCurrencyUnits(value: string | undefined, unit: string): string {
    return UnitConverter.convertCurrencyUnits(value, unit);
  }

  /* Convert a string into a number */
  toNumber(value: string): number {
    return Number(value);
  }


  /* This method should retrieve the invoice pdf from the backend */
  displayInvoice(rentalId: number): void {
    // send a request to the backend to generate the file
    this.rentalService.generateInvoicePdf(rentalId, this.selectedCurrency).subscribe({
      // read and interpret the Blob from the backend 
      next: (pdfBlob: Blob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        //window.open(url, '_blank'); // used for debugging pdf file 
        
        // download invoice pdf:
        const fileName = 'InvoiceScooter'; // pdf file name
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.pdf`; // name of the invoice pdf file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (error) => {
        if (error.error instanceof Blob) {
          error.error.text().then((text: string) => {
            try {
              const errorData = JSON.parse(text);
              console.log(errorData);
              this.errorMessage = errorData.message;
            } catch (e) {
              // Handle generic error if parsing fails
              this.errorMessage = 'Fehler beim Herunterladen der Rechnung.';
            }
          });
        } else {
          // Handle non-Blob errors
          this.errorMessage = error.error.message;
        }
        this.toastComponentError.showToast();
      }
    });
  }

  getRentalObjByRentalId(rentalId: number): { rental: ActiveRental | PastRental, type: 'past' | 'prepaid' | 'dynamic' } | null {
    let rental: ActiveRental | PastRental | undefined = undefined;

    rental = this.activeRentals.find(rental => Number(rental.id) === Number(rentalId));
    if (rental) {
      return { rental, type: rental.renew ? 'dynamic' : 'prepaid' };
    }

    rental = this.pastRentals.find(rental => Number(rental.id) === Number(rentalId));
    if (rental) {
      return { rental, type: 'past' };
    }
    
    return null;
  }

  clearAnimationTimeout(): void {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
  }

  clearWaitForAnimationTimeout(): void {
    if (this.waitForAnimationEndTimeout) {
      clearTimeout(this.waitForAnimationEndTimeout);
      this.waitForAnimationEndTimeout = null;
    }
  }

  waitForAnimationToEnd(): Promise<void> {
    return new Promise((resolve) => {
      const checkAnimation = (): void => {
        if (this.animationTimeout === null) {
          resolve();
        } else {
          // Check again after a delay
          this.waitForAnimationEndTimeout = setTimeout(checkAnimation, 100); // Check every 100 milliseconds
        }
      };
      checkAnimation();
    });
  }

  /* Animate the removal of the active rental from the active rentals array */
  async moveRentalFromActiveToPast(activeRental: ActiveRental, newPastRental?: PastRental): Promise<void> {
    /* Check if an animation is currently running and wait for it to end before starting a new one */
    if (this.animationTimeout) {
      await this.waitForAnimationToEnd();
      this.clearWaitForAnimationTimeout();
    }

    /* Convert the active rental to a past rental if no new past rental is provided */
    if (!newPastRental) {
      console.log('Converting the active rental to a past rental');
      const endTimestamp = new Date().toISOString();
      const totalPrice = (Number(activeRental.price_per_hour) * this.getExactRentalDurationInHours(activeRental.createdAt, endTimestamp)).toFixed(2);
      newPastRental = {
        id: activeRental.id,
        scooterId: activeRental.scooterId,
        userId: activeRental.userId,
        createdAt: activeRental.createdAt,
        endedAt: endTimestamp,
        total_price: totalPrice,
        price_per_hour: activeRental.price_per_hour,
        paymentOffset: '0'
      };
    }
    
    /* Access the specific rental item in the DOM */
    const specificItem = this.rentalItems.find(item => Number(item.nativeElement.getAttribute('data-id')) === Number(activeRental.id));
    if (!specificItem) {
      return;
    }

    /* Configure the animation */
    const fastAnimationDuration = 250;
    const fastAnimationDurationStr = `${fastAnimationDuration}ms`;
    const slowAnimationDuration = 1000;
    const slowAnimationDurationStr = `${slowAnimationDuration}ms`;
    const crossFadeDuration = Math.floor(fastAnimationDuration / 2);
    const crossFadeDurationStr = `${slowAnimationDuration - fastAnimationDuration}ms`;

    /* Set some initial styles for the elements */
    const margin = 20;

    /* Set up the animation for the list element (the specific rental item, i.e. the li element) */
    const liElement = specificItem.nativeElement;
    const liElementHeight = liElement.offsetHeight;
    liElement.style.height = `${liElementHeight}px`;
    liElement.style.transform = 'scale(1)';
    liElement.style.transition = `height ${slowAnimationDurationStr} ease-in-out, margin-bottom ${slowAnimationDurationStr} ease-in-out, opacity ${fastAnimationDurationStr} ease-in, transform ${fastAnimationDurationStr} ease-in`;
    
    /* Set up the animation for the active rental list (i.e. the ul element) */
    const activeRentalListEl = this.activeRentalList.nativeElement;
    const activeRentalListElHeight = activeRentalListEl.offsetHeight;
    activeRentalListEl.style.height = `${activeRentalListElHeight}px`;
    activeRentalListEl.style.transition = `height ${slowAnimationDurationStr} ease-in-out`;

    /* Set up the animation for the green bar, the past rentals title and the active rentals list 
       in case the last active rental is being removed */
    let greenBarEl: HTMLElement;
    let pastRentalsTitleEl: HTMLElement;
    if (this.greenBar && this.activeRentals.length === 1) {
      greenBarEl = this.greenBar.nativeElement;
      greenBarEl.style.transition = `margin-top ${slowAnimationDurationStr} ease-in-out, margin-bottom ${slowAnimationDurationStr} ease-in-out, opacity ${crossFadeDurationStr} ease-in-out`;

      activeRentalListEl.style.transition = `height ${slowAnimationDurationStr} ease-in-out, margin-top ${slowAnimationDurationStr} ease-in-out`;

      pastRentalsTitleEl = this.pastRentalsTitle.nativeElement;
      pastRentalsTitleEl.style.transition = `margin-top ${slowAnimationDurationStr} ease-in-out`;
    }

    /* Start the animation */
    let wholeAnimationDuration = 0;

    /* Animate a fade-out effect for the list element (li) */
    this.animationTimeout = setTimeout(() => {
      liElement.style.opacity = '0';
      liElement.style.transform = 'scale(0.925)';
    }, 0);       
    wholeAnimationDuration += fastAnimationDuration;

    /* Animate a height reduction for the list element (li) to visually close the gap */
    this.animationTimeout = setTimeout(() => {
      liElement.style.height = '0';
      liElement.style.marginBottom = '0';

      /* In case the last active rental is being removed, also fade and squeeze out
         the green bar, and adjust the past rentals title and the active rentals list */
      if (this.greenBar && this.activeRentals.length === 1) {
        greenBarEl.style.marginTop = '-3px';
        greenBarEl.style.marginBottom = '0';
        greenBarEl.style.opacity = '0';
        activeRentalListEl.style.height = '0';
        activeRentalListEl.style.marginTop = '0';
        pastRentalsTitleEl.style.marginTop = `${margin}px`;
      } else { // Otherwise, just reduce the height of the ul element to close the gap
        const newActiveRentalListElHeight = activeRentalListElHeight - liElementHeight - margin;
        activeRentalListEl.style.height = `${newActiveRentalListElHeight}px`;
      };
    }, fastAnimationDuration - crossFadeDuration);
    wholeAnimationDuration += slowAnimationDuration - crossFadeDuration;

    /* After the animation is finished, remove the active rental from the active rentals array
       and add it to the past rentals array */
    this.animationTimeout = setTimeout(() => {
      this.clearAnimationTimeout();

      /* Remove the active rental from the active rentals array */
      this.activeRentals = this.activeRentals.filter(rental => rental.id !== activeRental.id);

      /* Add the past rental to the past rentals array */
      // this.pastRentals.push(newPastRental!);  // Add the new past rental to the end of the past rentals array
      // this.pastRentals.unshift(newPastRental!);  // Add the new past rental to the beginning of the past rentals array
      this.filteredRentals.unshift(newPastRental!);  // Add the new past rental to the beginning of the filtered rentals array
    }, wholeAnimationDuration);
  }

  hasRemainingTime(rental: PastRental | ActiveRental): rental is ActiveRental {
    return (rental as ActiveRental).remainingTime !== undefined;
  }

  hasPastTime(rental: PastRental | ActiveRental): rental is ActiveRental {
    return (rental as ActiveRental).pastTime !== undefined;
  }

  getInvoiceDownloadFontSize(): string {
    if (window.innerWidth < 260) {
      return '13px';
    } else {
      return '16px';
    }
  }

  getPaymentOffsetAsFloat(rental: PastRental | ActiveRental): number {
    return parseFloat(rental.paymentOffset);
  }

  setUpAndShowInfoModal(rental: ActiveRental | PastRental, type: 'past' | 'prepaid' | 'dynamic'): void {
    if (type === 'past') {
      rental = rental as PastRental;
      this.infoModal.title = this.getNameByScooterId(rental.scooterId) || 'Buchungsdetails';
      this.infoModal.rentalId = rental.id;
      this.infoModal.rentalObj = rental;
      this.infoModal.scooterId = rental.scooterId;
      this.infoModal.createdAt = rental.createdAt;
      this.infoModal.endedAt = rental.endedAt;
      this.infoModal.isActive = false;
      this.infoModal.renew = false;
      this.infoModal.show = true;
      this.infoModal.mode = 'past';
      this.infoModal.remainingTime = undefined;
      this.infoModal.pastTime = undefined;
    }
    if (type === 'prepaid') {
      rental = rental as ActiveRental;
      this.infoModal.title = this.getNameByScooterId(rental.scooterId) || 'Buchungsdetails';
      this.infoModal.rentalId = rental.id;
      this.infoModal.rentalObj = rental;
      this.infoModal.scooterId = rental.scooterId;
      this.infoModal.createdAt = rental.createdAt;
      this.infoModal.endedAt = rental.nextActionTime.toString();
      this.infoModal.isActive = true;
      this.infoModal.renew = rental.renew;
      this.infoModal.show = true;
      this.infoModal.mode = 'prepaid';
      this.infoModal.remainingTime = rental.remainingTime;
      this.infoModal.pastTime = undefined;
    }
    if (type === 'dynamic') {
      rental = rental as ActiveRental;
      this.infoModal.title = this.getNameByScooterId(rental.scooterId) || 'Buchungsdetails';
      this.infoModal.rentalId = rental.id;
      this.infoModal.rentalObj = rental;
      this.infoModal.scooterId = rental.scooterId;
      this.infoModal.createdAt = rental.createdAt;
      this.infoModal.endedAt = rental.nextActionTime.toString();
      this.infoModal.isActive = true;
      this.infoModal.renew = rental.renew;
      this.infoModal.show = true;
      this.infoModal.mode = 'dynamic';
      this.infoModal.remainingTime = undefined;
      this.infoModal.pastTime = rental.pastTime;
    }
  }

  onClickRental(rentalId: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { rental: rentalId },
      queryParamsHandling: 'merge',
    });
  }

  onCloseInfoModal(): void {
    this.infoModal.show = false;

    /* Remove the rental query parameter from the URL */
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { rental: null },
      queryParamsHandling: 'merge',
    });
  }

  onNavigateToScooter(): void {
    this.infoModal.show = false;

    /* Navigate to the scooter page including the island state because then the scooter page will treat the back button as history back */
    const originState = history.state.originState
    ? { originState: { ...history.state.originState, island: true } }
    : { originState: { island: true } };
    this.router.navigate(['search/scooter', this.infoModal.scooterId], { 
      state: originState
    });
  }

  cancelRental(activeRental: ActiveRental | PastRental | null): void {
    /* Do nothing if the rental is null, a PastRental, or not a dynamic rental */
    if (!activeRental || 'endedAt' in activeRental || activeRental.renew === false) {
      return;
    }

    /* Hide the info modal if it was open while processing the request so that we can show the loading overlay */
    if (this.confirmModal.infoModalWasOpen) {
      this.infoModal.show = false;
    }

    /* Show the loading overlay */
    this.processingEndRental = true;

    /* Request to end the dynamic rental */
    this.rentalService.postEndRental({ rentalId: activeRental.id, userLocation: this.userLocation }).subscribe({
      next: (response) => {
        console.log(response);

        /* Hide the loading overlay */
        this.processingEndRental = false;

        /* Restore the info modal if it was open before */
        if (this.confirmModal.infoModalWasOpen) {
          this.infoModal.show = true;
          this.confirmModal.infoModalWasOpen = false;  // Reset the state in the confirm modal
        }

        /* Close the info modal if the user ended the rental from the info modal */
        if (this.infoModal.show) {
          /* Close the info modal */
          this.onCloseInfoModal();   // Not only hides the info modal but also clears the rental query parameter from the URL
        }

        /* Clear the interval for the ended dynamic rental */
        const interval = this.updateIntervals.get(activeRental.id);
        if (interval) {
          clearInterval(interval);
          this.updateIntervals.delete(activeRental.id);
        }
    
        /* Animate moving the active rental to the past rentals */
        this.moveRentalFromActiveToPast(activeRental, response.newPastRental);
      },
      error: (error) => {
        console.log(error);

        /* Hide the loading overlay */
        this.processingEndRental = false;
        this.errorMessage = error.error.message;
        this.hotErrorMessage = error.error.hotMessage;
        this.toastComponentError.showToast();

        /* Restore the info modal if it was open before */
        if (this.confirmModal.infoModalWasOpen) {
          this.infoModal.show = true;
          this.confirmModal.infoModalWasOpen = false;  // Reset the state in the confirm modal
        }

        /* Close the info modal in case of a hot error */
        if (this.hotErrorMessage) {
          this.onCloseInfoModal();
        }
      }
    });
  }

  async onCancelRental(activeRental: ActiveRental | PastRental | null): Promise<void> {
    /* Set up and show the confirm modal */
    this.confirmModal.infoModalWasOpen = this.infoModal.show;
    
    if (this.confirmModal.infoModalWasOpen) {
      this.infoModal.show = false;
    }

    /* Show the loading overlay while waiting for the user's location */
    this.processingEndRental = true;    // turns on the loading overlay
    await this.getUserLatestUserLocation();
    this.processingEndRental = false;   // turns off the loading overlay
    
    this.confirmModal.showConfirmModal = true;

    if (activeRental) {
      this.confirmModal.scooterName = this.getNameByScooterId(activeRental.scooterId) || '';
    }
    this.confirmModal.confirmCallback = (): void => this.cancelRental(activeRental);
  }

  onCloseConfirmModal(): void {
    /* Restore the info modal if it was open before */
    if (this.confirmModal.infoModalWasOpen) {
      this.infoModal.show = true;
    }
    
    /* Reset the confirm modal */
    this.confirmModal.showConfirmModal = false;
    this.confirmModal.infoModalWasOpen = false;
    this.confirmModal.scooterName = '';
    this.confirmModal.confirmCallback = (): void => {
      // Do nothing by default
    };
  }

  onConfirmConfirmModal(): void {
    /* Call the confirm callback function */
    this.confirmModal.confirmCallback();

    /* Reset the confirm modal */
    this.confirmModal.showConfirmModal = false;
    this.confirmModal.scooterName = '';
    this.confirmModal.confirmCallback = (): void => {
      // Do nothing by default
    };
  }

  onCloseHotError(): void {
    this.hotErrorMessage = null;  // Reset the hot error message, this also closes the hot error modal

    /* Reload the page to fetch the latest data because we don't know what actually happened to the data in case of a hot error */
    window.location.reload();
  }

  onOpenPaymentOffsetInfoModal(): void {
    this.infoModal.show = false;
    this.showPaymentOffsetInfoModal = true;
  }

  onClosePaymentOffsetInfoModal(): void {
    this.showPaymentOffsetInfoModal = false;
    this.infoModal.show = true;
  }

  //functionalities for the filters-----------------------------------------------------------------

  /**
   * change visibility of the filter menu page
   */
  toggle(): void {
    this.filterMenuVisible = !this.filterMenuVisible;
  }

  /**
   * when pressing the "Anwenden"-Button, this is called
   * it will apply the filter if the user did provide correct input else do not do anything
   */
  onSubmit(): void {
    if (this.bookingFilterForm.valid) {
      console.log('Form Submitted');
      this.lower = this.bookingFilterForm.get('lower')?.value;
      this.upper = this.bookingFilterForm.get('upper')?.value;

      this.filteredRentals = Filters.filterDate(this.lower.replace('.', '-').replace('.', '-'), this.upper.replace('.', '-').replace('.', '-'), this.pastRentals);
      this.toggle();
    } 
    else {
      console.log('Form is invalid');
    }
  }

  /**
   * is called when we press the "Zurücksetzen"-button, 
   * removes upper and lower bound an shows all rentals again
   */
  onCancel(): void {
    this.filteredRentals = this.pastRentals;
    this.lower='';
    this.upper='';
    this.toggle();
  }


//validator and auto formatter

/**
 * checks whether the input is a correctly formatted date or not
 * @param control 
 * @returns null if it is a correct date
 */
dateValidator(control: FormControl): { [key: string]: Boolean } | null {
  const value = control.value;
  if (value === '') {
    return null;  // Allow empty input
  }
  const dateRegex = /^\d{2}.\d{2}.\d{4}$/;
  if (!dateRegex.test(value)) {
    return { 'invalidDate': true };
  }
  const [day, month, year] = value.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return { 'invalidDate': true };
  }
  return null;
}

  /**
   * auto formats the input to the german standard form of dd.mm.yyyy, as the app is for use in german language space 
   * also ensures the user just can provide numerics as input, by not not writing any non-numeric input
   */
  autoFormatDate(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '.' + value.slice(2);
    }
    if (value.length > 5) {
      value = value.slice(0, 5) + '.' + value.slice(5);
    }
    if(value.length > 10){
      value = value.slice(0,10);
    }
    this.bookingFilterForm.controls[controlName].setValue(value, { emitEvent: false });
  }
}
