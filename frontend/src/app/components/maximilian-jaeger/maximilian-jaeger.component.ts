import { Component, OnInit } from '@angular/core';
import { AboutService, NameInfo } from 'src/app/services/about.service';

@Component({
  selector: 'app-maximilian-jaeger',
  standalone: true,
  imports: [],
  templateUrl: './maximilian-jaeger.component.html',
  styleUrl: './maximilian-jaeger.component.css'
})
export class MaximilianJaegerComponent implements OnInit{
  public myName?: NameInfo;

  constructor(private aboutService: AboutService) { }

  ngOnInit(): void {
    this.aboutService.getMaximilianJaegerInfo().subscribe({
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
        };
      },
    });
  }
}