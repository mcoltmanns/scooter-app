import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-status-island',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-island.component.html',
  styleUrl: './status-island.component.css',
  animations: [
    trigger('islandAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'scale(0)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'scale(1)'
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
export class StatusIslandComponent implements AfterViewInit, OnDestroy {
  public onDOM = false;
  public isVisible = false;
  @Input() public showDuration = 70000;
  private animationDuration = 300;  // Match this with your animation duration, e.g. 0.3s = 300ms

  public remainingDuration: number = this.showDuration;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  private islandTimeout: ReturnType<typeof setTimeout> | null = null;
  private showTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    this.showAndHide();
  }

  ngOnDestroy(): void {
    this.resetTimer();
  }

  show(): void {
    this.onDOM = true;
    this.showTimeout = setTimeout(() => {
      this.isVisible = true;
    }, 0);
  }

  hide(): void {
    this.isVisible = false;
    this.hideTimeout = setTimeout(() => {
      this.onDOM = false;
      this.resetTimer();
    }, this.animationDuration); // match this with your animation duration
  }

  resetTimer(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.islandTimeout) {
      clearTimeout(this.islandTimeout);
      this.islandTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  destroyIsland(): void {
    this.resetTimer();
    this.hide();
  }

  showAndHide(): void {
    this.show();

    this.remainingDuration = this.showDuration / 1000;
    this.countdownInterval = setInterval(() => {
      if (this.remainingDuration > 0) {
        this.remainingDuration--;
      }
    }, 1000);
    
    this.islandTimeout = setTimeout(() => {
      this.destroyIsland();
    }, this.showDuration);
  }

  getFormattedTime(): string {
    /* Calculate the number of full minutes in the remaining duration */
    const minutes = Math.floor(this.remainingDuration / 60);

    /* Calculate the number of seconds left over when the minutes are subtracted */
    const seconds = this.remainingDuration % 60;

    /* Return the formatted string, padding the minutes and seconds with leading zeros if necessary */
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }
  
  pad(num: number): string {
    /* If the number is less than 10, prepend a '0'. Otherwise, return the number as a string. */
    return num < 10 ? `0${num}` : num.toString();
}
}
