import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filter-button',
  standalone: true,
  imports: [],
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.css'],
})
export class FilterButtonComponent {
  @Input() public path: string | null = null;

  constructor(private location: Location, private router: Router) {}

  @Output() filterToggle = new EventEmitter<void>();

  toggleFilters():void {
    this.filterToggle.emit();
  }
}
