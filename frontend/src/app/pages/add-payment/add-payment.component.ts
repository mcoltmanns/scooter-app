import { Component, } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';


@Component({
    selector: 'app-payment',
    standalone: true,
    templateUrl: './add-payment.component.html',
    styleUrl: './add-payment.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule]
})
export class AddPaymentComponent{

  constructor(private router: Router) { }

  onCancel(): void {
        this.router.navigate(['settings/payment']);
  }
}