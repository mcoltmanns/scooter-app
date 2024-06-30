import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './info-modal.component.html',
  styleUrl: 'info-modal.component.css',
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
export class InfoModalComponent {
  @Input() public showModal = false;
  @Input() public showIcon = true;
  @Input() public showActionButton = false;
  @Input() public centerControls = false;
  @Input() public title = 'Hinweis';
  @Input() public actionText = 'Aktion';
  @Input() public closeText = 'Schließen';
  @Input() action: () => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };
  @Input() close: () => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };

  onAction(): void {
    this.action();
  }

  onClose(): void {
    this.close();
  }
}
