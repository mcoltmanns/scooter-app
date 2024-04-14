import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface NameInfo{
  firstname: string,
  lastname: string
}

@Component({
  selector: 'app-maximilian',
  standalone: true,
  imports: [],
  templateUrl: './maximilian.component.html',
  styleUrl: './maximilian.component.css'
})
export class MaximilianComponent implements OnInit{
  public myName?: NameInfo;

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.http.get<NameInfo>('/api/my-name').subscribe({
      next: (val) => {
        this.myName = val;
      },

      // error: Es gab einen Fehler
      error: (err) => {
        console.error(err);
        this.myName = {
          firstname: 'Error!',
          lastname: 'Error!',
        };
      },
    });
  }
}
