import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { PaymentOptionsComponent } from 'src/app/components/payment-options/payment-options.component';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { AddButtonComponent } from 'src/app/components/add-button/add-button.component';


@Component({
    selector: 'app-payment',
    standalone: true,
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule, PaymentOptionsComponent, ToastComponent, AddButtonComponent]
})
export class PaymentComponent implements AfterViewInit, OnInit {
  /* Get references to the toast component */
  @ViewChild('toastComponent') toastComponent!: ToastComponent;

  /* Manage the states of the confirm modal, loading overlay and toast */
  public showToast = false;
  public toastMessage = 'Zahlungsmethode hinzugefügt!';
  public toastType: 'success' | 'error' = 'success';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    /* Check if a payment method was added and show the toast */
    if(history.state.addedPayment) {
      this.showToast = true;
    }
    history.replaceState({}, '');   // Clear the router state to prevent the toast from showing again
  }

  ngAfterViewInit(): void {
    /* Show the toast after the view has been initialized */
    if(this.showToast) {
      this.toastComponent.showToast();
      this.showToast = false; // Reset the state to prevent the toast from showing again
    }
  }

  onClickAdd(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  back(): void {
    this.router.navigate(['settings']);
  }
}