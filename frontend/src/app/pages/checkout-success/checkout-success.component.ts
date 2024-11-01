import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class CheckoutSuccessComponent implements OnInit {
  public dateTimeString = 'Rückgabezeitpunkt';

  public isDynamic = false;

  public rentalId: number | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    /* Redirect to search if there is no booking object in the history state */
    if (!history.state.booking) {
      this.router.navigate(['/search']);
      return;
    }

    if (history.state.booking.isDynamic) {
      this.isDynamic = true;
    }

    if (history.state.booking.rentalId) {
      this.rentalId = history.state.booking.rentalId;
    }

    /* Extract the endTimestamp from the booking object in the history state */
    if (history.state.booking.endTimestamp)  {
      const endedAt = history.state.booking.endTimestamp;
      const date = new Date(endedAt);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      this.dateTimeString = `${date.toLocaleDateString('de-DE', options)} Uhr`;
    }
  }

  onNavigate(path: string): void {
    /* Pass the originState object to the next route if it exists */
    const originState = history.state.originState ? { originState: history.state.originState } : {};

    let navigationObject: NavigationExtras;
    if (path === 'booking' && this.rentalId !== null) {
      /* Pass the rentalId as param to the booking page */
      navigationObject = { 
        state: originState,
        queryParams: { rental: this.rentalId },
        queryParamsHandling: 'merge',
      };
    } else {
      navigationObject = { state: originState };
    }

    this.router.navigate([path], navigationObject);
  }
}
