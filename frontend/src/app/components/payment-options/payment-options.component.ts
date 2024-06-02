import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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

    constructor(private paymentService: PaymentService, private renderer: Renderer2, private el: ElementRef) {
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

    removeEntryById(id: number | null): void {
      if (!id) return;
      /* Remove a payment entry by id */
      this.paymentOptions = this.paymentOptions.filter(pm => pm.id !== id);
    }

    onConfirm(): void {
      this.showModal = false;
      this.isLoading = true;

      this.paymentService.deletePaymentMethod(this.paymentId).subscribe({
        next: (resObj) => {
          /* Remove the deleted payment entry from the DOM */
          this.removeEntryById(this.paymentId);

          /* Reset the paymentId and isLoading state */
          this.paymentId = null;
          this.isLoading = false;

          /* Configure the toast and show it */
          this.toastType = 'success';
          this.toastMessage = resObj.message;
          this.toastComponent.showToast();
        },
        error: (err) => {
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
}