import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [BackButtonComponent, ButtonComponent, CommonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css'
})
export class OptionsComponent implements OnInit{
  public constructor(private router: Router, private optionService: OptionService) {}

  /* variables used in HTML and for stuff from the backend  */
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public errorMessage = '';
  public option: Option | null = null;

  ngOnInit(): void {
    /* Retrieves the current selected units from the backend */
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

  /* Selects the speed unit in the HTML */
  selectSpeed(unit: string): void {
    this.selectedSpeed = unit;
  }

  /* Selects the distance unit in the HTML */
  selectDistance(unit: string): void {
    this.selectedDistance = unit;
  }

  /* Selects the currency unit in the HTML */
  selectCurrency(unit: string): void {
    this.selectedCurrency = unit;
  }

  /* "Änderungen speichern" button is clicked */
  submit(): void {
    console.log('Submit');
    if (!this.option) {
      console.error('No option data available.');
      return;
    }
  
    // Call the service to update the user settings
    this.optionService.updateUserPreferences(this.selectedSpeed, this.selectedDistance, this.selectedCurrency).subscribe({
      next: (updatedOption) => {
        console.log('User preferences updated successfully:', updatedOption);
        this.router.navigate(['/settings']);
      },
      error: (err) => {
        console.error('Error updating user preferences:', err);
      }
    });
  }

  /* Abbbrechen Button is clicked */ 
  cancel(): void {
    this.router.navigate(['/settings']);
  }

  // Diese Methoden sind nur zum Test geschrieben -> Kann in alle Methoden copy pasted werden wo man etwas umrechnen muss

  /* converts the speeds */
  convertSpeedUnits(value: number, unit: string): string {
    let str = '';
    if(unit === 'mp/h'){
      value = UnitConverter.convertSpeed(value, 'km/h', unit);
      str = value.toFixed(1) + ' mp/h'; // toFixed(1) only shows the last decimal place
    }
    else{
      str = value.toString() + ' km/h';
    }
    console.log(str);
    return str;
  }

  /* Converts the distances */
  convertDistanceUnits(value: number, unit: string): string {
    let str = '';
    if(unit === 'mi'){
      value = UnitConverter.convertDistance(value, 'km', unit);
      str = value.toFixed(1) + ' mi'; // toFixed(1) only shows the last decimal place
    } 
    else{
      str = value.toString() + ' km';
    }
    console.log(str);
    return str;
  }

  /* Convert the currencies */
  convertCurrencyUnits(value: number, unit: string): string {
    let str = '';
    if(unit === '$'){
      value = UnitConverter.convertCurrency(value, unit, '$');
      str = value.toFixed(2) + ' $'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + ' €';
    }
    console.log(str);
    return str;
  }
}