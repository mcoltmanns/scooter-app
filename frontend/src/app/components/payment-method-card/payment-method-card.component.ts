import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PaymentOptions } from 'src/app/models/payment';

@Component({
  selector: 'app-payment-method-card',
  standalone: true,
  templateUrl: './payment-method-card.component.html',
  styleUrls: ['./payment-method-card.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodCardComponent {
  @Input() public paymentMethod: PaymentOptions | undefined = undefined;
  @Input() public isDeletable = false;
  @Input() public isChecked = false;
  @Input() delete: (id: number) => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };

  onDelete(id: number): void {
    this.delete(id);
  }
}