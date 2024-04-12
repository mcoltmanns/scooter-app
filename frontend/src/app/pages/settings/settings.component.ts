import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  logout(): void {
    // Bitte Logik einfügen
  }
}
