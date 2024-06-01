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
                this.paymentOptions = [ { type: 'ERR', data: {name:'ERR'} }]; 
            }
        });
    }
}