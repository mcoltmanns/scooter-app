import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Scooter } from 'src/app/models/scooter';
import { MapService } from 'src/app/services/map.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { OptionService } from 'src/app/services/option.service';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';

@Component({
  selector: 'app-scooter-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './scooter-list.component.html',
  styleUrls: ['./scooter-list.component.css']
})
export class ScooterListComponent implements OnInit, OnChanges {
  public constructor(private mapService: MapService, private router: Router, private optionService: OptionService) {}

  @Input() searchTerm = ''; // Input property to receive the search term
  public scooters: Scooter[] = [];
  public products: Product[] = [];
  public filteredScooters: Scooter[] = [];
  public errorMessage = '';
  public loadingData = true;
  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;
  
  ngOnInit(): void {
    /* Get all scooters from backend */
    this.mapService.getScooterInfo().subscribe({
      next: (value) => {
        this.scooters = value;
        this.loadingData = false;
        this.filterScooters();
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingData = false;
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

    this.optionService.getUserPreferences().subscribe({
      next: (value) => {
        this.option = value;
        this.selectedSpeed = this.option.speed;
        this.selectedDistance = this.option.distance;
        this.selectedCurrency = this.option.currency;
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error(err);
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
    this.router.navigate(['/search/scooter', scooterId]);
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
  getPriceByProductId(name: String): number {
    const product = this.products.find(p => p.name === name);
    return product ? product.price_per_hour : 0;
  }

  // Method to calculate the range of the scooter
  calcRange(battery: number, max_reach: number): number {
    return Math.ceil(battery / 100 * max_reach);
  }

  /* Get the range for each scooter */
  getRangeByProductId(name: String, battery: number): number{
    const product = this.products.find(p => p.name === name);
    if (product) {
      return this.calcRange(battery, product.max_reach);
    } else {
      return 0; // Error no range provided
    }
  }

  /* Converts the distances */
  convertDistanceUnits(value: number, unit: string): string {
    let str = '';
    if(unit === 'mi'){
      value = UnitConverter.convertDistance(value, 'km', unit);
      str = value.toFixed(0) + ' mi'; // toFixed(0) shows no decimal places
    } 
    else{
      str = value.toString() + ' km';
    }
    return str;
  }

  /* Convert the currencies */
  convertCurrencyUnits(value: number, unit: string): string {
    let str = '';
    if(unit === '$'){
      value = UnitConverter.convertCurrency(value, unit, '$');
      str = value.toFixed(2) + ' $/H'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + ' €/H';
    }
    return str;
  }
}