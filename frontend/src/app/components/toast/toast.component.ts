import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: 'toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnimation', [
      state('hidden', style({
        opacity: 0,
        bottom: '75px'  // move down when hidden
      })),
      state('visible', style({
        opacity: 1,
        bottom: '100px'  // move to original position when visible
      })),
      transition('hidden => visible', [
        animate('0.3s ease-out')
      ]),
      transition('visible => hidden', [
        animate('0.3s ease-in')
      ]),
    ])
  ]
})
export class ToastComponent {
  public isVisible = false;
  public onDOM = false;
  @Input() public type: 'success' | 'error' = 'success';
  @Input() public showDuration = 5000;
  private animationDuration = 300;  // Match this with your animation duration, e.g. 0.3s = 300ms
  // private startHideAnimation = this.showDuration - this.animationDuration;

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  show(): void {
    this.onDOM = true;
    this.showTimeout = setTimeout(() => {
      this.isVisible = true;
      this.cdr.detectChanges();
    }, 0);
  }

  hide(): void {
    this.isVisible = false;
    this.hideTimeout = setTimeout(() => {
      this.onDOM = false;
      this.cdr.detectChanges();
    }, this.animationDuration); // match this with your animation duration
  }

  startTimer(): void {
    this.toastTimeout = setTimeout(() => {
      this.destroyToast();
    }, this.showDuration);
  }

  resetTimer(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  destroyToast(): void {
    // console.log('destroy toast');
    this.resetTimer();

    this.hide();
    this.cdr.detectChanges();  // Manually trigger change detection
  }

  destroyToastImmediately(): void {
    // console.log('destroy toast immediately');
    this.resetTimer();

    this.isVisible = false;
    this.onDOM = false;
    this.cdr.detectChanges();  // Manually trigger change detection

    this.cdr.detectChanges();  // Manually trigger change detection
  }

  showToast(): void {
    // console.log('showing toast');
    this.destroyToastImmediately();

    this.show();
    this.cdr.detectChanges();  // Manually trigger change detection

    this.startTimer();
  }

  onToastClose(): void {
    this.destroyToast();
  }
}
