import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AboutService } from 'src/app/services/about.service';
import { Employee } from 'src/models/employee';

@Component({
    selector: 'app-about-us',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about-us.component.html',
    styleUrl: './about-us.component.css',
})
export class AboutUsComponent implements OnInit {
    employees: Employee[] = []; // empty at first

    constructor(private aboutService: AboutService) {}

    ngOnInit(): void { // when we wake up, get the array of employees from the about service
        this.aboutService.getEmployeeInfo().subscribe({
            next: (emps) => {
                this.employees = emps;
            },

            error: (err) => {
                console.error(err);
                this.employees = [ { name: 'ERR', info: 'ERR' }];
            }
        });
    }
}