import { Component, OnInit } from '@angular/core';
import { PaymentOptions } from 'src/app/models/paymentOptions';
import { PaymentOptionService } from 'src/app/services/paymentOption.service';

@Component({
    selector: 'app-payment-options',
    standalone: true,
    templateUrl: './payment-options.component.html',
    styleUrl: './payment-options.component.css',
})

export class PaymentOptionsComponent implements OnInit{

    paymentOptions: PaymentOptions[] = []; 

    constructor(private paymentOptionService: PaymentOptionService) {}

    ngOnInit(): void { 
        this.paymentOptionService.getAllPaymentMethods().subscribe({
            next: (payopt) => {
                this.paymentOptions = payopt;
            },

            error: (err) => {
                console.error(err);
                this.paymentOptions = [ { type: 'ERR', info: {name:'ERR'} }]; //only name always exists, thus this is set to ERR
            }
        });
    }
}