import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { PaymentOptionsComponent } from 'src/app/components/payment-options/payment-options.component';
import { ToastComponent } from 'src/app/components/toast/toast.component';


@Component({
    selector: 'app-payment',
    standalone: true,
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule, PaymentOptionsComponent, ToastComponent]
})
export class PaymentComponent implements AfterViewInit {
  /* Get references to the toast component */
  @ViewChild('toastComponent') toastComponent!: ToastComponent;

  /* Manage the states of the confirm modal, loading overlay and toast */
  public showToast = false;
  public toastMessage = 'Zahlungsmethode hinzugefügt!';
  public toastType: 'success' | 'error' = 'success';

  constructor(private router: Router) {
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    if(routerState && routerState['addedPayment']) {
      this.showToast = true;
    }
  }

  ngAfterViewInit(): void {
    if(this.showToast) {
      this.toastComponent.showToast();
      this.showToast = false;
    }
  }

  back(): void {
    this.router.navigate(['settings']);
  }
}