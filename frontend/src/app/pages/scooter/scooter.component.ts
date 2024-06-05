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
  public constructor(private mapService: MapService, private router: Router) {}

  public errorMessage = '';
  public product: Product | null = null;
  public scooter: Scooter | null = null;

  options: Leaflet.MapOptions = {
    layers: [
      new Leaflet.TileLayer(
        'http://konstrates.uni-konstanz.de:8080/tile/{z}/{x}/{y}.png',
      ),
    ],
    zoom: 16,
    attributionControl: false,
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
        console.log('Scooter information:', this.scooter);
        //console.log(this.scooter.battery);
        const marker = Leaflet.marker([this.scooter.coordinates_lat, this.scooter.coordinates_lng], {icon: defaultIcon});
        this.layers.push(marker); 
        this.center = new Leaflet.LatLng(this.scooter.coordinates_lat, this.scooter.coordinates_lng);
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
        console.log('HTML Discription:', this.product.description_html);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });
  }

  /* If "Scooter Buchen" is pressed */
  onSubmit(): void {
    console.log('scooterBook button pressed');

    const scooterId = this.product?.id;
    this.router.navigate(['search/booking', scooterId]); // Route to booking page
  }

  // Method to calculate the range of the scooter
  calcRange(battery: number, max_reach: number): number {
    return Math.ceil(battery / 100 * max_reach);
  }

  /* Function that rounds up Battery */
  roundUpBattery(battery: number): number {
    return Math.ceil(battery);
  }
}