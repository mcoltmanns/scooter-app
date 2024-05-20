import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { PaymentOptionsComponent } from 'src/app/components/payment-options/payment-options.component';


@Component({
    selector: 'app-payment',
    standalone: true,
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule, PaymentOptionsComponent]
})
export class PaymentComponent {}