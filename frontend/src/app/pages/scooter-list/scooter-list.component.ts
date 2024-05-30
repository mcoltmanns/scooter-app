import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Scooter } from 'src/app/models/scooter';
import { MapService } from 'src/app/services/map.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-scooter-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './scooter-list.component.html',
  styleUrls: ['./scooter-list.component.css']
})
export class ScooterListComponent implements OnInit, OnChanges {
  public constructor(private mapService: MapService, private router: Router) {}

  @Input() searchTerm = ''; // Input property to receive the search term
  public scooters: Scooter[] = [];
  public products: Product[] = [];
  public filteredScooters: Scooter[] = [];
  public errorMessage = '';
  
  ngOnInit(): void {
    /* Get all scooters from backend */
    this.mapService.getScooterInfo().subscribe({
      next: (value) => {
        this.scooters = value;
        this.filterScooters();
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
        /*
        this.products.forEach(product => {
          console.log(`Product ID: ${product.id}, HTML Discription ${product.description_html}`);
        });
        */
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });
  }

  ngOnChanges(): void {
    this.filterScooters(); // Call filter method whenever searchTerm changes
  }

  /* Filters the scooters for the "search scooter" input field */
  filterScooters(): void {
    this.filteredScooters = this.scooters.filter(scooter =>
      scooter.product_id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /* Function for the green button */
  buttonToScooter(scooterId: number): void {
    this.router.navigate(['/scooter', scooterId]);
  }

  /* Function that rounds up Battery */
  roundUpBattery(battery: number): number {
    return Math.ceil(battery);
  }

  /* Function that capitalizes all letters */
  uppercaseProductId(productId: string): string {
    return productId.toUpperCase();
  }

  /* Gets the image url for the scooters from the backend */
  getImageUrl(fileName: string): string {
    return `http://localhost:8000/img/products/${fileName}.jpg`;
  }

  /* Get the price for each scooter */
  getPriceByProductId(productId: number): number | undefined {
    const product = this.products.find(p => p.id === productId);
    return product ? product.price_per_hour : undefined;
  }

  // Method to calculate the range of the scooter
  calcRange(battery: number, max_reach: number): number {
    return Math.ceil(battery / 100 * max_reach);
  }

  /* Get the range for each scooter */
  getRangeByProductId(productId: number, battery: number): number | undefined {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      return this.calcRange(battery, product.max_reach);
    } else {
      return undefined;
    }
  }

  /* removes a scooter from the list */
  /*
  removeScooter(scooterId: string): void {
    this.scooters = this.scooters.filter(scooter => scooter.product_id !== scooterId);
    this.filteredScooters = this.filteredScooters.filter(scooter => scooter.product_id !== scooterId);
  }
  */

  /* sends rrequest to the backend to book a scooter*/
  /*
  bookScooter(scooterId: string): void {
    this.mapService.bookScooter(scooterId).subscribe({
      next: (response) => {
        console.log('Scooter booked successfully:', response);
        this.removeScooter(scooterId);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });
  }
  */
}