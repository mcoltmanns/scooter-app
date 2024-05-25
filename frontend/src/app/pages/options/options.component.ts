import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Router } from '@angular/router';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [BackButtonComponent, ButtonComponent, CommonModule ],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css'
})
export class OptionsComponent implements OnInit{
  public constructor(private router: Router, private optionService: OptionService) {}

  /* variables used in HTML and for stuff from the backend  */
  selectedSpeed = ''; 
  selectedDistance = '';
  selectedCurrency = '';
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
        console.log(this.option);
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
}