import { Component, OnInit } from '@angular/core';
import { PaymentOptions } from 'src/app/models/payment';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
    selector: 'app-payment-options',
    standalone: true,
    templateUrl: './payment-options.component.html',
    styleUrl: './payment-options.component.css',
})

export class PaymentOptionsComponent implements OnInit{

    paymentOptions: PaymentOptions[] = [];

    constructor(private paymentService: PaymentService) {}

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

    onDelete(id: number): void {
      this.paymentService.deletePaymentMethod(id).subscribe({
        next: () => {
          console.log('Deleted payment option with id: ', id);
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
}