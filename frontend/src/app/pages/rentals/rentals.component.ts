import { Component, OnInit } from '@angular/core';
import { Rental, ProductWithScooterId } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';
import { MapService } from 'src/app/services/map.service';
import { CommonModule } from '@angular/common';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { FilterButtonComponent } from 'src/app/components/filter-button/filter-button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Filters } from 'src/app/utils/util-filters';

@Component({
    selector: 'app-rentals',
    standalone: true,
    templateUrl: './rentals.component.html',
    styleUrl: './rentals.component.css',
    imports: [CommonModule, FilterButtonComponent, UserInputComponent, ButtonComponent, ReactiveFormsModule]
})
export class RentalsComponent implements OnInit {

  /* Initialize the FormGroup instance that manages all input fields and their validators */
  public bookingFilterForm!: FormGroup;

  public constructor(private rentalService: RentalService, private mapService: MapService, private optionService: OptionService, private fb: FormBuilder) 
  {this.bookingFilterForm = this.fb.group({
      lower: ['', this.dateValidator],
      upper: ['', this.dateValidator]
  });}

  // Variables for storing all rentals and the product information
  public loadingDataScooter = true;
  public loadingDataProduct = true;
  public loadingDataOption = true;
  public rentals: Rental[] = [];
  public filteredRentals: Rental[] = [];
  public products: ProductWithScooterId[] = [];
  public errorMessage = '';

  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  ngOnInit(): void {
    /* Get all scooter bookings for the User from the backend*/
    this.loadRentalInfo();

    /* Get all scooters from backend */
    this.rentalService.getRentalProduct().subscribe({
      next: (value) => {
        this.products = value;
        this.loadingDataProduct = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingDataProduct = false;
        console.log(err);
      }
    });

    /* Get the metrics settings for a user */
    this.optionService.getUserPreferences().subscribe({
      next: (value) => {
        this.option = value;
        this.selectedSpeed = this.option.speed;
        this.selectedDistance = this.option.distance;
        this.selectedCurrency = this.option.currency;
        this.loadingDataOption = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loadingDataOption = false;
        console.error(err);
      }
    });
  }

  /* load information about all booked scooters for a user */
  loadRentalInfo(): void {
    this.rentalService.getRentalInfo().subscribe({
      next: (value) => {
        this.rentals = value;
        this.filteredRentals = value;
        this.loadingDataScooter = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingDataScooter = false;
        console.log(err);
      }
    });
    this.filteredRentals = this.rentals;
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
  getPictureByScooterId(scooterId: number): String{
    const product = this.products.find(p => p.scooterId === scooterId);
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

  /* Convert the currencies */
  convertCurrencyUnits(value: string | undefined, unit: string): string {
    if (value === undefined){
      console.log('Something went wrong while converting Currency Units...');
      return '';
    }
    let intValue = parseInt(value);
    let str = '';
    if(unit === '$'){
      intValue = UnitConverter.convertCurrency(intValue, unit, '$');
      str = intValue.toFixed(2) + ' $'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + ' €';
    }
    return str;
  }


  /* This method should retrieve the invoice pdf from the backend */
  displayInvoice(rentalId: number, scooterId: number, createdAt : string, endedAt: string): void {
    // variables for the invoice pdf
    const scooterName = this.getNameByScooterId(scooterId);
    let total = this.getTotalPrice(scooterId, createdAt, endedAt);
    total = this.convertCurrencyUnits(total, this.selectedCurrency);
    const duration = this.rentalDuration(createdAt, endedAt);
    let pricePerHour = this.getPriceByScooterId(scooterId);
    pricePerHour = parseFloat(this.convertCurrencyUnits(pricePerHour?.toString(), this.selectedCurrency));

    // check if an attribut is not defined
    if(scooterName === undefined || total === undefined || pricePerHour === undefined){
      console.log('Error - An Attribute is not defined');
      return;
    }

    // send a request to the backend to generate the file
    this.rentalService.generateInvoicePdf(rentalId, createdAt, endedAt, scooterName, total, duration, pricePerHour, this.selectedCurrency).subscribe(
      
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

  //functionalities for the filters

  filterMenuVisible = false;
  
  public lower = '';
  public upper = '';



  toggle(): void {
    this.filterMenuVisible = !this.filterMenuVisible;
  }

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

  onCancel(): void {
    this.filteredRentals = this.rentals;
    this.lower='';
    this.upper='';
    this.toggle();
  }


//validator and auto formatter

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

  /*auto formats the input to the german standard form of dd.mm.yyyy, as the app is for use in german language space */
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