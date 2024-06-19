import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements AfterViewInit, OnDestroy {
  @Input() public text = 'Button';
  @Input() public disabled = false;
  @Input() public type: 'button' | 'submit' | 'reset' = 'button';
  @Input() public design: 'thin' | '' = '';
  @Input() public color: 'primary' | 'accent' | 'warn' = 'primary';

  @ViewChild('myButton') myButton!: ElementRef;

  private transitionTimeout?: ReturnType<typeof setTimeout>;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.transitionTimeout = setTimeout(() => {
      this.renderer.addClass(this.myButton.nativeElement, 'transition');
    },100);
  }

  ngOnDestroy(): void {
    if (this.transitionTimeout !== undefined) {
      clearTimeout(this.transitionTimeout);
    }
  }
}
