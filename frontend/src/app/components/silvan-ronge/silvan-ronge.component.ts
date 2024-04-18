import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
  selector: 'app-silvan-ronge',
  standalone: true,
  templateUrl: './silvan-ronge.component.html',
  styleUrls: ['./silvan-ronge.component.css'],
})
export class SilvanRongeComponent implements OnInit {
  public myName?: NameInfo;

  constructor(private aboutService: AboutService) { }

  ngOnInit(): void {
    this.aboutService.getSilvanRongeInfo().subscribe({
      // next: Unser Wert kam erfolgreich an!
      next: (val) => {
        this.myName = val;
      },

      // error: Es gab einen Fehler
      error: (err) => {
        console.error(err);
        this.myName = {
          firstName: 'Error!',
          lastName: 'Error!',
          optionalAttribut: 'Error!',
        };
      },
    });
  }
}
