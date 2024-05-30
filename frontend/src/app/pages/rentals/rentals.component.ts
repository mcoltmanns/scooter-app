import { Component, OnInit } from '@angular/core';
import { Rental } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';
import { MapService } from 'src/app/services/map.service';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [],
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
}
