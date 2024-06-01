import { Component, OnInit } from '@angular/core';
import { PaymentOptions } from 'src/app/models/payment';
import { PaymentService } from 'src/app/services/payment.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';

@Component({
    selector: 'app-payment-options',
    standalone: true,
    templateUrl: './payment-options.component.html',
    styleUrl: './payment-options.component.css',
    imports: [ConfirmModalComponent, LoadingOverlayComponent]
})

export class PaymentOptionsComponent implements OnInit{

    paymentOptions: PaymentOptions[] = [];

    /* Manage the ID of the payment to be deleted */
    public paymentId: number | null = null;

    /* Manage the state of the confirm modal and loading overlay */
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
        next: () => {
          console.log('Deleted payment option with id: ', this.paymentId);
          this.paymentId = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.log('Error deleting payment option with id: ', this.paymentId);
          console.error(err);
          this.paymentId = null;
          this.isLoading = false;
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