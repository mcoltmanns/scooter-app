import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
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

  toggleFilters(): void {
    //rewrite for filters, so on booking it shows teh booking filters, on scooter it shows the scooter filters


    /* If no path is provided, go back to the previous page. */
    //if (!this.path) {this.location.back();return;}

    /* If a path is provided, navigate to it and
       pass the originState object to the next route if it exists. */
    //const originState = history.state.originState ? { originState: history.state.originState } : {};
    //this.router.navigate([this.path], { state: originState});
  }
}
