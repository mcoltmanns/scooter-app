import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Scooter } from 'src/app/models/scooter';
import { MapService } from 'src/app/services/map.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';

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
  public filteredScooters: Scooter[] = [];
  public errorMessage = '';
  
  ngOnInit(): void {
    /* get all scooters from backend */
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
  }

  ngOnChanges(): void {
    this.filterScooters(); // Call filter method whenever searchTerm changes
  }

  /* filters the scooters for the "search scooter" input field */
  filterScooters(): void {
    this.filteredScooters = this.scooters.filter(scooter =>
      scooter.product_id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // DUMMY METHODE - MUSS AUSIMPLEMENTIERT WERDEN FALLS NÖTIG
  buttonToScooter(scooterId: string): void {
    console.log('Button Pressed for scooter ID:', scooterId);
    // SIEHE USER STORY ZUM ENWICKLUNGSHINWEIS MIT INNER HTML UND URL
  }

  /* Function that rounds up Battery */
  roundUpBattery(battery: number): number {
    return Math.ceil(battery);
  }

  /* Function that capitalizes all letters */
  uppercaseProductId(productId: string): string {
    return productId.toUpperCase();
  }

  /* METHODE MUSS NOCH IMPLEMENTIERT WERDEN */
  calculateRange(battery: number): number {
    return Math.ceil(battery);
  }

  /* gets the image url for the scooters from the backend */
  getImageUrl(fileName: string): string {
    return `http://localhost:8000/img/products/${fileName}.jpg`;
  }
}