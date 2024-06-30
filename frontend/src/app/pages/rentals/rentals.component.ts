import { Component, OnInit } from '@angular/core';
import { ActiveRental, PastRental, ProductWithScooterId, Rental } from 'src/app/models/rental';
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

@Component({
    selector: 'app-rentals',
    standalone: true,
    templateUrl: './rentals.component.html',
    styleUrl: './rentals.component.css',
    imports: [CommonModule, FilterButtonComponent, UserInputComponent, ButtonComponent, ReactiveFormsModule, InfoModalComponent, LoadingOverlayComponent]
})
export class RentalsComponent implements OnInit {

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public bookingFilterForm!: FormGroup;

  public constructor(private rentalService: RentalService, private mapService: MapService, private optionService: OptionService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    //form group for the booking filter
    this.bookingFilterForm = this.fb.group({
      lower: ['', this.dateValidator],
      upper: ['', this.dateValidator]
    });

    /* Bind Information Modal to this instance */
    this.onNavigateToScooter = this.onNavigateToScooter.bind(this);
    this.onCloseInfoModal = this.onCloseInfoModal.bind(this);
  }

  // Variable to control the visibility of the loading spinner
  public isLoading = true;

  // Object to track loaded state of images by scooterId
  imageLoaded: { [scooterId: string]: boolean } = {};

  // Variables for storing all rentals and the product information
  public rentals: Rental[] = [];
  public activeRentals: ActiveRental[] = [];
  public pastRentals: PastRental[] = [];
  public products: ProductWithScooterId[] = [];
  public errorMessage = '';

  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  // Info modal configuration
  public showInfoModal = false;
  public infoModalTitle = 'Buchungsdetails';
  public infoModalRentalId = 0;
  public infoModalScooterId = 0;
  public infoModalCreatedAt = '';
  public infoModalEndedAt = '';
  public infoModalTotalPrice = 0;
  public infoModalRenew = false;
  public infoModalIsActive = false;

  //variables for the filters----------------------

  public filteredRentals: Rental[] = []; //filtered version of the Rental[]
  
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
        // this.rentals = rentalsResponse;
        // this.filteredRentals = rentalsResponse;
        this.filteredRentals = this.rentals;
        this.activeRentals = rentalsResponse.activeRentals;
        this.pastRentals = rentalsResponse.pastRentals;
        // this.loadingDataScooter = false;

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
        this.isLoading = false;
        console.log(err);
      }
    });
  }

  // Function to call when an image is loaded
  onImageLoad(scooterId: string): void {
    this.imageLoaded[scooterId] = true;
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
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    // If the number of hours is less than 10, remove the leading zero
    const hoursStr = diffHours < 10 ? String(diffHours) : String(diffHours).padStart(2, '0');

    return `${hoursStr}`;
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


  /* This method should retrieve the invoice pdf from the backend */
  displayInvoice(rentalId: number): void {
    // send a request to the backend to generate the file
    this.rentalService.generateInvoicePdf(rentalId, this.selectedCurrency).subscribe(
      
      // read and interpret the Blob from the backend 
      (pdfBlob: Blob) => {
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
      (error) => {
        console.error('Fehler beim Herunterladen der Rechnung:', error);
      }
    );
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

  setUpAndShowInfoModal(rental: ActiveRental | PastRental, type: 'past' | 'prepaid' | 'dynamic'): void {
    if (type === 'past') {
      rental = rental as PastRental;
      this.infoModalTitle = this.getNameByScooterId(rental.scooterId) || 'Buchungsdetails';
      this.infoModalRentalId = rental.id;
      this.infoModalScooterId = rental.scooterId;
      this.infoModalCreatedAt = rental.createdAt;
      this.infoModalEndedAt = rental.endedAt;
      this.infoModalTotalPrice = rental.total_price;
      this.infoModalIsActive = false;
      this.infoModalRenew = false;
      this.showInfoModal = true;
    }
    if (type === 'prepaid') {
      console.log('Prepaid booking clicked');
      rental = rental as ActiveRental;
      this.infoModalTitle = this.getNameByScooterId(rental.scooterId) || 'Buchungsdetails';
      this.infoModalRentalId = rental.id;
      this.infoModalScooterId = rental.scooterId;
      this.infoModalCreatedAt = rental.createdAt;
      this.infoModalEndedAt = rental.nextActionTime.toString();
      this.infoModalTotalPrice = rental.price_per_hour;
      this.infoModalIsActive = true;
      this.infoModalRenew = rental.renew;
      this.showInfoModal = true;
    }
    if (type === 'dynamic') {
      console.log('Dynamic booking clicked');
      rental = rental as ActiveRental;
      this.infoModalTitle = this.getNameByScooterId(rental.scooterId) || 'Buchungsdetails';
      this.infoModalRentalId = rental.id;
      this.infoModalScooterId = rental.scooterId;
      this.infoModalCreatedAt = rental.createdAt;
      this.infoModalEndedAt = rental.nextActionTime.toString();
      this.infoModalTotalPrice = rental.price_per_hour;
      this.infoModalIsActive = true;
      this.infoModalRenew = rental.renew;
      this.showInfoModal = true;
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
    this.showInfoModal = false;

    /* Remove the rental query parameter from the URL */
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { rental: null },
      queryParamsHandling: 'merge',
    });
  }

  onNavigateToScooter(): void {
    this.showInfoModal = false;

    /* Navigate to the scooter page including the island state because then the scooter page will treat the back button as history back */
    const originState = history.state.originState
    ? { originState: { ...history.state.originState, island: true } }
    : { originState: { island: true } };
    this.router.navigate(['search/scooter', this.infoModalScooterId], { 
      state: originState
    });
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

      this.filteredRentals = Filters.filterDate(this.lower.replace('.', '-').replace('.', '-'), this.upper.replace('.', '-').replace('.', '-'), this.rentals);
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
    this.filteredRentals = this.rentals;
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
