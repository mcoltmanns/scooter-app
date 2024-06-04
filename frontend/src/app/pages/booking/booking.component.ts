import { Component, OnInit } from '@angular/core';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { Product } from 'src/app/models/product';
import { Scooter } from 'src/app/models/scooter';
import { MapService } from 'src/app/services/map.service';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [BackButtonComponent, CommonModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit{
  public constructor(private mapService: MapService, private optionService: OptionService) {}

  // Variables for data from the backend
  public errorMessage = '';
  public product: Product | null = null;
  public scooter: Scooter | null = null;
  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  ngOnInit(): void {
    // read the last number from the url:
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const lastPart = parts[parts.length - 1];
    const scooterId = parseInt(lastPart); // save the last number of URL in scooterId

    /* get the scooter information by scooterId*/
    this.mapService.getSingleScooterInfo(scooterId).subscribe({
      next: (value) => {
        this.scooter = value;
        console.log('Scooter information:', this.scooter);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });

    /* get the product information for the scooter */
    this.mapService.getSingleProductInfo(scooterId).subscribe({
      next: (value) => {
        this.product = value;
        console.log('Product information:', this.product);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
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
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error(err);
      }
    });
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

  /* Converts the distances */
  convertDistanceUnits(value: number | undefined, unit: string | undefined): string {
    if(unit === undefined ||value === undefined){
      return 'error';
    }

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

  /* converts the speeds */
  convertSpeedUnits(value: number | undefined, unit: string |undefined): string {
    if(unit === undefined ||value === undefined){
      return 'error';
    }

    let str = '';
    if(unit === 'mp/h'){
      value = UnitConverter.convertSpeed(value, 'km/h', unit);
      str = value.toFixed(1) + ' mp/h'; // toFixed(1) only shows the last decimal place
    }
    else{
      str = value.toString() + ' km/h';
    }
    return str;
  }

  /* Convert the currencies */
  convertCurrencyUnits(value: number, unit: string |undefined): string {
    if(unit === undefined){
      return 'error';
    }

    let str = '';
    if(unit === '$'){
      value = UnitConverter.convertCurrency(value, unit, '$');
      str = value.toFixed(2) + ' $'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + ' €';
    }
    return str;
  }
}
