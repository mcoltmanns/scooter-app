import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Product } from 'src/app/models/product';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-scooter',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './scooter.component.html',
  styleUrl: './scooter.component.css'
})
export class ScooterComponent implements OnInit {
  public constructor(private mapService: MapService, private router: Router) {}

  public errorMessage = '';
  public product: Product | null = null;

  ngOnInit(): void {
    // read the last number from the url:
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const lastPart = parts[parts.length - 1];
    const scooterId = parseInt(lastPart); // save the last number of URL in scooterId

    /* get the product information for the */
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
  }

  /* If "Scooter Buchen" is pressed */
  onSubmit(): void {
    console.log('scooterBook button pressed');

    const id = this.product?.id;
    const name = this.product?.name;
    const brand = this.product?.brand;
    const image = this.product?.image;
    const max_reach = this.product?.max_reach;
    const max_speed = this.product?.max_speed;
    const price_per_hour = this.product?.price_per_hour;
    const description_html = this.product?.description_html;

    // Pass the booking Function the parametes
    const navigationExtras: NavigationExtras = { // IN DER TODO COMPONENT IN NgOnInit wird das ganze beispielhaft erhalten
      queryParams: {
        id: id,
        name: name,
        brand: brand,
        image: image,
        max_reach: max_reach,
        max_speed: max_speed,
        price_per_hour: price_per_hour,
        description_html: description_html
      }
    };
    this.router.navigate(['/booking'], navigationExtras); // Route to booking page
  }
}