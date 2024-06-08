import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { Router } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Product } from 'src/app/models/product';
import { MapService } from 'src/app/services/map.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { Scooter } from 'src/app/models/scooter';
import * as Leaflet from 'leaflet';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';

const defaultIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker.png',
});

@Component({
  selector: 'app-scooter',
  standalone: true,
  imports: [ButtonComponent, BackButtonComponent, CommonModule, LeafletModule],
  templateUrl: './scooter.component.html',
  styleUrl: './scooter.component.css'
})
export class ScooterComponent implements OnInit {
  public constructor(private mapService: MapService, private router: Router, private optionService: OptionService) {}

  public errorMessage = '';
  public scooterNotFound = false;
  public loadingScooter = true;
  public product: Product | null = null;
  public scooter: Scooter | null = null;
  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  options: Leaflet.MapOptions = {
    layers: [
      new Leaflet.TileLayer(
        'http://konstrates.uni-konstanz.de:8080/tile/{z}/{x}/{y}.png',
      ),
    ],
    zoom: 16,
    attributionControl: false,
    center: new Leaflet.LatLng(0, 0)
  };
  
  public center = new Leaflet.LatLng(0, 0);

  layers: Leaflet.Layer[] = [];

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
        this.loadingScooter = false;
        const marker = Leaflet.marker([this.scooter.coordinates_lat, this.scooter.coordinates_lng], {icon: defaultIcon});
        this.layers.push(marker); 
        this.center = new Leaflet.LatLng(this.scooter.coordinates_lat, this.scooter.coordinates_lng);
        this.options.center = this.center; // Set the map center
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingScooter = false;
        this.scooterNotFound = true;
        console.log(err);
      }
    });

    /* get the product information for the scooter */
    this.mapService.getSingleProductInfo(scooterId).subscribe({
      next: (value) => {
        this.product = value;
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

  /* If "Scooter Buchen" is pressed */
  onSubmit(): void {
    console.log('scooterBook button pressed');

    const scooterId = this.scooter?.id;
    this.router.navigate(['search/checkout', scooterId]); // Route to booking page
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

  /* Function that rounds up Battery */
  roundUpBattery(battery: number): number {
    return Math.ceil(battery);
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
      str = value.toFixed(2) + ' $/h'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + ' €/h';
    }
    return str;
  }
}