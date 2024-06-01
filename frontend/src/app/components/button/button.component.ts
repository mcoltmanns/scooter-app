import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() public text = 'Button';
  @Input() public disabled = false;
  @Input() public type: 'button' | 'submit' | 'reset' = 'button';
  @Input() public design: 'thin' | '' = '';
  @Input() public color: 'primary' | 'accent' | 'warn' = 'primary';
}
