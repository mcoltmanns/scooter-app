import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: 'confirm-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  @Input() public showModal = false;
  @Input() public showIcon = true;
  @Input() public title = 'Bastätigung';
  @Input() public confirmText = 'Ja';
  @Input() public cancelText = 'Nein';
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
