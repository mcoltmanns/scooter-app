import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, HostListener, AfterViewChecked, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-status-island',
  standalone: true,
  imports: [CommonModule, ToastComponent, ConfirmModalComponent],
  templateUrl: './status-island.component.html',
  styleUrl: './status-island.component.css',
  animations: [
    trigger('islandAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'scale(0)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('hidden => visible', [
        animate('0.3s ease-out')
      ]),
      transition('visible => hidden', [
        animate('0.3s ease-in')
      ]),
    ])
  ]
})
export class StatusIslandComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('toastComponentError') toastComponentError!: ToastComponent; // Get references to the toast component

  /* Variables for subscriptions */
  private scooterReservedSubscription: Subscription;
  private scooterUnreservedSubscription: Subscription;

  /* Core variables to control the status island */
  public onDOM = false;
  public isVisible = false;
  public errorMessage = 'Da ist etwas schiefgelaufen. Bitte versuche es erneut.';

  /* Variables to control the cancellation confirm modal */
  public showCancellationConfirmModal = false;
  public processingCancellation = false;

  /* Input variables that can be set by the the person setting up the status island */
  @Input() public showCountdown = true;
  @Input() public showDuration = 10000;
  @Input() public imgPath: string | null = null;
  @Input() public redirectPath: string | null = null;
  @Input() public title: string | null = null;
  @Input() public content: string | null = null;  // A secondary text besides the title
  @Input() public showCancelButton = false;
  @Input() public cancellationConfirmModalTitle = 'Bestätigung';
  @Input() public cancellationConfirmModalText = 'Bist du sicher, dass du diese Aktion durchführen willst?';
  @Input() public processingCancellationMsg = 'Beende...';
  @Input() cancel: () => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };

  /* Variables for controlling the length and visibility of all texts on the status island */
  private titleMinLength = 6;
  public showContent = false;
  public showTitle = false;

  /* Variables for controlling the animation and the countdown */  
  private animationDuration = 300;  // Has to match the animation duration of the animation in @Component, e.g. 0.3s = 300ms
  public remainingDuration: number = this.showDuration;

  /* Variables for controlling the countdown interval and timeouts */
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private islandTimeout: ReturnType<typeof setTimeout> | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router, private cdRef: ChangeDetectorRef, private bookingService: BookingService) {
    /* By using bind(this), we ensure that these methods always refer to the StatusIslandComponent instance. */
    this.onConfirmCancellationConfirmModal = this.onConfirmCancellationConfirmModal.bind(this);
    this.onCancelCancellationConfirmModal = this.onCancelCancellationConfirmModal.bind(this);

    /* SUBSCRIPTION: The status island will be used to display a users reservation. Therefore, we subscribe to the scooterReserved event. */
    this.scooterReservedSubscription = this.bookingService.scooterReserved.subscribe(reservation => {
      /* Configure the status island with the information from the reservation */
      this.imgPath = reservation.imagePath;
      this.redirectPath = reservation.redirectPath;
      // this.title = reservation.scooterName;
      this.title = 'Wir verrechnen die Zahlung, indem wir den alten Block erstatten und dann von der alten actionTime bis jetzt nochmal eine Zahlung durchführen.';
      this.content = 'reserviert:';
      this.showCancelButton = true;
      this.cancellationConfirmModalTitle = 'Reservierung aufheben';
      this.cancellationConfirmModalText = 'Bist du sicher, dass du die aktuell laufende Reservierung beenden möchtest?';
      this.processingCancellationMsg = 'Beende Reservierung...';

      /* Configure the cancel function, that will be called when the user confirms the cancellation */
      this.cancel = (): void => {
        /* End the reservation for this user */
        this.processingCancellation = true;
        this.bookingService.endReservation().subscribe({
          next: () => {
            /* Destroy the reservation island */
            this.bookingService.destroyReservationIsland();
          },
          error: (err) => {
            console.error(err);
            if(err.error.message) {
              this.errorMessage = err.error.message;
            }
            this.toastComponentError.showToast();
            this.processingCancellation = false;
          }
        });
      };

      /* Calculate the remaining time until the reservation ends */
      const reservationEnd = new Date(reservation.reservationEnd);
      const currentTime = new Date();
      const remainingTime = reservationEnd.getTime() - currentTime.getTime();
      this.showDuration = remainingTime;

      this.adjustElementsToWindow();
      this.showAndHide();
    });

    /* SUBSCRIPTION: If the scooterUnreserved event is emitted, the status island will be destroyed. */
    this.scooterUnreservedSubscription = this.bookingService.scooterUnreserved.subscribe(() => {
      this.destroyIsland();
    });

    // Other SUBSCRIPTIONS (the status island can be used for other purposes as well)...
   }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.resetTimer();

    /* Unsubscribe from all subscriptions */
    this.scooterReservedSubscription.unsubscribe();
    this.scooterUnreservedSubscription.unsubscribe();
  }

  show(): void {
    this.onDOM = true;
    this.showTimeout = setTimeout(() => {
      this.isVisible = true;
    }, 0);
  }

  hide(): void {
    this.isVisible = false;
    this.hideTimeout = setTimeout(() => {
      this.onDOM = false;
      this.resetTimer();
      this.processingCancellation = false;
    }, this.animationDuration);
  }

  resetTimer(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.islandTimeout) {
      clearTimeout(this.islandTimeout);
      this.islandTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  destroyIsland(): void {
    this.resetTimer();
    this.hide();
  }

  showAndHide(): void {
    this.resetTimer();
    this.show();

    this.remainingDuration = Math.floor(this.showDuration / 1000);
    this.countdownInterval = setInterval(() => {
      if (this.remainingDuration > 0) {
        this.remainingDuration--;
      }
    }, 1000);
    
    this.islandTimeout = setTimeout(() => {
      this.destroyIsland();
    }, this.showDuration);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.adjustElementsToWindow();
  }

  adjustElementsToWindow(): void {
    this.showTitle = true;
    this.showContent = true;
    const screenWidth = window.innerWidth;
    if (screenWidth > 670) {
      this.titleMinLength = 50;
    } else if (screenWidth > 500) {
      this.titleMinLength = 30;
    } else if (screenWidth > 425) {
      this.titleMinLength = 20;
    } else if (screenWidth > 320) {
      this.titleMinLength = 8;
    } else if (screenWidth > 310) {
      this.titleMinLength = 6;
    } else if (screenWidth > 235) {
      this.titleMinLength = 8;
      this.showContent = false;
    } else if (screenWidth > 190) {
      this.titleMinLength = 2;
      this.showContent = false;
    } else {
      this.titleMinLength = 2;
      this.showTitle = false;
      this.showContent = false;
    }
  }

  getShortenedTitle(): string {
    if (!this.title) {
      return '';
    }
    return this.title.length > this.titleMinLength ? `${this.title.slice(0, this.titleMinLength)}...` : this.title;
  }

  getFormattedTime(): string {
    /* Calculate the number of full minutes in the remaining duration */
    const minutes = Math.floor(this.remainingDuration / 60);

    /* Calculate the number of seconds left over when the minutes are subtracted */
    const seconds = this.remainingDuration % 60;

    /* Return the formatted string, padding the minutes and seconds with leading zeros if necessary */
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }
  
  pad(num: number): string {
    /* If the number is less than 10, prepend a '0'. Otherwise, return the number as a string. */
    return num < 10 ? `0${num}` : num.toString();
  }

  onIslandClick(): void {
    if (this.redirectPath) {
      /* If a path is provided, navigate to it and
       pass the originState object to the next route if it exists. */
       const originState = history.state.originState
        ? { originState: { ...history.state.originState, island: true } }
        : { originState: { island: true } };
       this.router.navigate([this.redirectPath], { 
         state: originState
       });
    }
  }

  onConfirmCancellationConfirmModal(): void {
    this.showCancellationConfirmModal = false;
    this.cancel();
  }

  onCancelCancellationConfirmModal(): void {
    this.showCancellationConfirmModal = false;
  }

  onCancelClick(): void {
    this.showCancellationConfirmModal = true;
  }
}
