import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sort-button',
  standalone: true,
  imports: [],
  templateUrl: './sort-button.component.html',
  styleUrls: ['./sort-button.component.css'],
})
export class SortButtonComponent {
  @Input() public path: string | null = null;

  constructor(private location: Location, private router: Router) {}

  @Output() sortToggle = new EventEmitter<void>();

  toggleSort():void {
    this.sortToggle.emit();
  }
}
