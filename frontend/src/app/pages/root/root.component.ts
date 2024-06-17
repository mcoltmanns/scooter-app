import { AfterViewInit, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationBarComponent } from 'src/app/components/navigation-bar/navigation-bar.component';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { StatusIslandComponent } from 'src/app/components/status-island/status-island.component';
import { BookingService } from 'src/app/services/booking.service';

/**
 *  Die Root-Komponente stellt die "Haupt-Komponente" dar, die alle anderen Komponenten enthält.
 *  Hier können wir z.B. HTML Komponenten festlegen, die auf allen Seiten erscheinen (beispielsweise
 *  eine Navigation Bar).  In der "app.module.ts" Datei legen wir für Angular fest, dass
 *  diese Komponente die "Haupt-Komponente" ist.
 */
@Component({
  standalone: true,
  imports: [CommonModule, NavigationBarComponent, RouterModule, StatusIslandComponent],
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
  selector: 'app-root',
})
export class RootComponent implements AfterViewInit {
  constructor(public authService: AuthService, private bookingService: BookingService) {}

  ngAfterViewInit(): void {
    this.bookingService.restoreReservationIsland();
  }
}
