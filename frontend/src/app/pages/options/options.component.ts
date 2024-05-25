import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [BackButtonComponent, ButtonComponent, CommonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css'
})
export class OptionsComponent {
  public constructor(private router: Router) {}

  selectedSpeed = 'kmh'; // Initialisierung auf 'kmh' für km/h
  selectedDistance = 'km'; // Initialisierung auf 'km' für km
  selectedCurrency = 'euro'; // Initialisierung auf 'euro' für €

  selectSpeed(unit: string): void {
    this.selectedSpeed = unit;
    console.log(this.selectedSpeed);
  }

  selectDistance(unit: string): void {
    this.selectedDistance = unit;
  }

  selectCurrency(unit: string): void {
    this.selectedCurrency = unit;
    console.log(this.selectedCurrency);
  }

  submit(): void {
    // Registrierung Logik
  }

  cancel(): void {
    this.router.navigate(['/settings']);
  }
}