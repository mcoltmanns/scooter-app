import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentOptions } from 'src/app/models/payment';
import { PaymentService } from 'src/app/services/payment.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { ToastComponent } from '../toast/toast.component';

@Component({
    selector: 'app-payment-options',
    standalone: true,
    templateUrl: './payment-options.component.html',
    styleUrl: './payment-options.component.css',
    imports: [ConfirmModalComponent, LoadingOverlayComponent, ToastComponent, CommonModule]
})

export class PaymentOptionsComponent implements OnInit {

    paymentOptions: PaymentOptions[] = [];

    /* Get references to the toast component */
    @ViewChild('toastComponent') toastComponent!: ToastComponent;

    /* Manage the ID of the payment to be deleted */
    public paymentId: number | null = null;

    /* Manage the states of the confirm modal, loading overlay and toast */
    public toastMessage = 'Zahlungsmethode gelöscht!';
    public toastType: 'success' | 'error' = 'success';
    public showModal = false;
    public isLoading = false;

    constructor(private paymentService: PaymentService) {
      this.onConfirm = this.onConfirm.bind(this);
      this.onCancel = this.onCancel.bind(this);
    }

    ngOnInit(): void { 
        this.paymentService.getAllPaymentMethods().subscribe({
            next: (payopt) => {
                this.paymentOptions = payopt;
            },

            error: (err) => {
                console.error(err);
                this.paymentOptions = [ { id: 0, type: 'ERR', data: {name:'ERR'} }]; 
            }
        });
    }

    onConfirm(): void {
      this.showModal = false;
      this.isLoading = true;

      this.paymentService.deletePaymentMethod(this.paymentId).subscribe({
        next: (resObj) => {
          console.log(resObj);
          console.log('Deleted payment option with id: ', this.paymentId);
          this.paymentId = null;
          this.isLoading = false;

          /* Configure the toast and show it */
          this.toastType = 'success';
          this.toastMessage = resObj.message;
          this.toastComponent.showToast();
        },
        error: (err) => {
          console.log('Error deleting payment option with id: ', this.paymentId);
          console.error(err);
          this.paymentId = null;
          this.isLoading = false;

          /* Configure the toast and show it */
          this.toastType = 'error';
          this.toastMessage = err.error.message || 'Fehler beim Löschen der Zahlungsmethode!';
          this.toastComponent.showToast();
        }
      });
    }

    onCancel(): void {
      this.paymentId = null;
      this.showModal = false;
    }

    onDelete(id: number): void {
      this.paymentId = id;
      this.showModal = true;
    }

    onShowToast(): void {
      this.toastComponent.showToast();
    }

    onChangeToast(): void {
      this.toastType = 'error';
      this.toastMessage = 'Fehler beim Löschen der Zahlungsmethode!';
      this.toastComponent.showToast();
    }
}