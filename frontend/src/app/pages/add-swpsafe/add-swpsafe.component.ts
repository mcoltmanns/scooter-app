import { Component, } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';


@Component({
    selector: 'app-swpsafe',
    standalone: true,
    templateUrl: './add-swpsafe.component.html',
    styleUrl: './add-swpsafe.component.css',
    imports: [UserInputComponent, ButtonComponent, RouterLink, BackButtonComponent, ReactiveFormsModule]
})
export class AddswpsafeComponent{

  constructor(private router: Router) { }

  confirm(): void {
        this.router.navigate(['settings/payment']);
  }

  cancel(): void {
        this.router.navigate(['settings/payment/addPayment']);
  }

  
}