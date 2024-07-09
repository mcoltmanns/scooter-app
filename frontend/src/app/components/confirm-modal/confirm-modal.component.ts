import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: 'confirm-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ConfirmModalComponent {
  @Input() public showModal = false;
  @Input() public showIcon = true;
  @Input() public iconMode: 'normal' | 'warn' = 'normal';
  @Input() public reverseControls = true;
  @Input() public centerControls = false;
  @Input() public title = 'Bastätigung';
  @Input() public confirmText = 'Ja';
  @Input() public cancelText = 'Nein';
  @Input() public confirmMode: 'normal' | 'warn' = 'normal';
  @Input() confirm: () => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };
  @Input() cancel: () => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };

  onConfirm(): void {
    this.confirm();
  }

  onCancel(): void {
    this.cancel();
  }
}
