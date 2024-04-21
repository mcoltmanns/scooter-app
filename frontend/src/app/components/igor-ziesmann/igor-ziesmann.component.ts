import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
  selector: 'app-igor-ziesmann',
  standalone: true,
  templateUrl: './igor-ziesmann.component.html',
  styleUrls: ['./igor-ziesmann.component.css'],
})
export class IgorZiesmannComponent implements OnInit {
  public myName?: NameInfo;

  constructor(private aboutService: AboutService) {
  }

  ngOnInit(): void {
    this.aboutService.getNameInfo().subscribe({
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
          optionalAttribut: 'Error!'
        };
      },
    });
  }
}
