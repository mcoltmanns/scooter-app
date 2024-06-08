import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './tmp-page.component.html',
  styleUrls: ['./tmp-page.component.css'],
  selector: 'app-tmp-page',
})
export class TmpPageComponent {
  constructor(private router: Router) {}

  onNavigate(path: string): void {
    /* Pass the originState object to the next route if it exists */
    const originState = { originState: {
      searchToggle: 'list',
      listScrollPosition: '15'
    } };
    this.router.navigate([path], { 
      state: originState
    });
  }
}
