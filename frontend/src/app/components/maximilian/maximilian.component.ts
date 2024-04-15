import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface NameInfo{
  firstName: string,
  lastName: string
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
    this.http.get<NameInfo>('/api/maximilian-jaeger').subscribe({
      next: (val) => {
        /*
        const firstname = val.firstName;
        const lastname= val.lastName;
        console.log('Firstname:', firstname);
        console.log('Lastname:', lastname);
        //this.myName = val;
        */
        this.myName = {
          firstName: val.firstName,
          lastName: val.lastName
        };
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