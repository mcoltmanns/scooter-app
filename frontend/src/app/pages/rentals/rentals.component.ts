import { Component, OnInit } from '@angular/core';
import { Rental } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';
import { MapService } from 'src/app/services/map.service';
import { Product } from 'src/app/models/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rentals.component.html',
  styleUrl: './rentals.component.css'
})
export class RentalsComponent implements OnInit {
  public constructor(private rentalService: RentalService, private mapService: MapService) {}

  public rentals: Rental[] = [];
  public products: Product[] = [];
  public errorMessage = '';

  ngOnInit(): void {
    /* Get all scooter bookings for the User from the backend*/
    this.rentalService.getRentalInfo().subscribe({
      next: (value) => {
        this.rentals = value;
        console.log(this.rentals);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });

    /* Get all scooters from backend */
    this.mapService.getProductInfo().subscribe({
      next: (value) => {
        this.products = value;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });
  }
  
  /* how long a user booked the scooter */
  rentalDuration(begin: string, end: string): string {
    const date1 = new Date(begin);
    const date2 = new Date(end);

    const diffMs = date2.getTime() - date1.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

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
}