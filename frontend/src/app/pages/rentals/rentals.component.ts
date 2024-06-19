import { Component, OnInit } from '@angular/core';
import { ActiveRental, PastRental } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';
import { MapService } from 'src/app/services/map.service';
import { Product } from 'src/app/models/product';
import { CommonModule } from '@angular/common';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { BookingService } from 'src/app/services/booking.service';
import { Router } from '@angular/router';
import { Reservation } from 'src/app/models/reservation';

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rentals.component.html',
  styleUrl: './rentals.component.css'
})
export class RentalsComponent implements OnInit {
  public constructor(private rentalService: RentalService, private mapService: MapService, private optionService: OptionService, private bookingService: BookingService, private router: Router) {}

  // Variables for storing all rentals and the product information
  public loadingDataScooter = true;
  public loadingDataProduct = true;
  public loadingDataOption = true;
  public loadingDataReservation = true;
  public activeRentals: ActiveRental[] = [];
  public pastRentals: PastRental[] = [];
  public products: Product[] = [];
  public reservation: Reservation | null = null;
  public errorMessage = '';

  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  ngOnInit(): void {
    /* Get all scooter bookings for the User from the backend*/
    this.rentalService.getRentalInfo().subscribe({
      next: (value) => {
        this.activeRentals = value.activeRentals;
        this.pastRentals = value.pastRentals;
        this.loadingDataScooter = false;
        console.log(this.activeRentals, this.pastRentals);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingDataScooter = false;
        console.log(err);
      }
    });

    /* Get all scooters from backend */
    this.mapService.getProductInfo().subscribe({
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

    // get the user's reservation info
    this.bookingService.getUserReservation().subscribe({
      next: (value) => {
        this.reservation = value.reservation;
        this.loadingDataReservation = false;
      },
      error: (err) => {
        this.reservation = null;
        if(err.code !== 404) { // if the error was anything other than there being no reservation
          this.errorMessage = err.message;
          console.error(err);
        }
        this.loadingDataReservation = false;
      }
    });
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
  getPriceByProductId(productId: number): number | undefined {
    const product = this.products.find(p => p.id === productId);
    return product ? product.price_per_hour : undefined;
  }

  /* Calculates the total price for a scooter booking*/
  getTotalPrice(productId: number, begin: string, end: string): string | undefined {
    const pricePerHour = this.getPriceByProductId(productId);
    if (pricePerHour === undefined) return undefined;

    const durationHours = Number(this.rentalDuration(begin, end));
    const totalPrice = pricePerHour * durationHours;

    // Round to two decimal places
    const roundedPrice = totalPrice.toFixed(2);

    // Check whether the decimal value has only one digit
    return roundedPrice.includes('.') ? roundedPrice : `${roundedPrice}.00`;
  }

  /* Get the name for each scooter */
  getNameByProductId(productId: number): string | undefined {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name.toUpperCase() : undefined;
  }

  /* Get Picture from the product list*/
  getPictureByProductId(productId: number): String{
    const product = this.products.find(p => p.id === productId);
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
      str = intValue.toFixed(2) + '$'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + '€';
    }
    return str;
  }

  // navigate to the info page for a given scooter
  goToScooterPage(scooter_id: number): void {
    const oldOriginState = history.state.originState || {};
    this.router.navigateByUrl(`search/scooter/${scooter_id}`, {
      state: {
        originState: {
          ...oldOriginState,
          path: 'reservation'
        }
      }
    });
  }
}