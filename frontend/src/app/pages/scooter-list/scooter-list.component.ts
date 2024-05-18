import { Component, OnInit } from '@angular/core';
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
export class ScooterListComponent implements OnInit{
  public constructor(private mapService: MapService, private router: Router) {}

  public scooters: Scooter[] = [];
  public errorMessage = '';
  
  ngOnInit(): void {
    /* get all scooters from backend */
    this.mapService.getScooterInfo().subscribe({
      next: (value) => {
        this.scooters = value;
        console.log('All scooters:', this.scooters);
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });
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
  calculateRange(battery: number): number{
    Math.ceil(battery);
    return 46;
  }

  /* gets the image url for the scooters from the backend */
  getImageUrl(fileName: string): string {
    return `http://localhost:8000/img/products/${fileName}.jpg`;
  }
}