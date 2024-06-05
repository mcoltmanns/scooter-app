import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [],
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.css'],
})
export class AddButtonComponent {
  @Input() style: string | undefined = undefined;
  @Input() clickAdd: () => void = () => {
    // This is a default function that does nothing.
    // It will be replaced by a function from the parent component.
  };

  constructor(private router: Router, private route: ActivatedRoute) { }

  onClickAdd(): void {
    this.clickAdd();
  }
}
