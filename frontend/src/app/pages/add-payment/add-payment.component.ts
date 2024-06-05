import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class AddPaymentComponent {

  constructor(private router: Router, private route: ActivatedRoute) { }

  onNavigate(relativePath: string): void {
    /* Pass the originState object to the next route if it exists */
    const originState = history.state.originState ? { originState: history.state.originState } : {};
    this.router.navigate([relativePath], { 
      relativeTo: this.route,
      state: originState
    });
  }

  onCancel(): void {
    /* Check if the originState object exists and navigate back to the origin path */
    if (history.state.originState && history.state.originState.path) {
      const originState = { originState: history.state.originState };
      this.router.navigate([history.state.originState.path], { state: originState });
      return;
    }
    /* Navigate back to the payment page as default */
    this.router.navigate(['settings/payment']);
  }
}