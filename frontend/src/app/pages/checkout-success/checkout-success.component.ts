import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [ButtonComponent],
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

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log(history.state);
    /* Redirect to search if there is no booking object in the history state */
    if (!history.state.booking) {
      this.router.navigate(['/search']);
      return;
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
    this.router.navigate([path], { 
      state: originState
    });
  }
}
