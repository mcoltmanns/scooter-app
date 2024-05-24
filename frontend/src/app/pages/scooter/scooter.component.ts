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

    // Pass the booking Function the the scooterID
    const scooterId = this.product?.id;
    const navigationExtras: NavigationExtras = { // ZU EINEM SPÄTERN ZEITPUNKT KÖNNTE MAN SICH ÜBERLEGEN DAS KOMPLETTE SCOOTER OBJECT ZU SCHICKEN
      queryParams: {
        scooterId: scooterId
      }
    };
    this.router.navigate(['/booking'], navigationExtras);
  }
}