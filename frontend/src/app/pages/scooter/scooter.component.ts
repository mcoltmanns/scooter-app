import { Component } from '@angular/core';
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  selector: 'app-scooter',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './scooter.component.html',
  styleUrl: './scooter.component.css'
})
export class ScooterComponent {
  public errorMessage = '';

  onSubmit(): void {
    console.log('scooterBook button pressed');
  }
}
