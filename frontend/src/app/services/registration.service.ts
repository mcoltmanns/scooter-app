import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';

@Injectable({
    providedIn: 'root',
})
export class RegistrationService {

    public registered = false;

    constructor(private http: HttpClient) {}

    public isregistered(): boolean{
        return this.registered;
    }

    public register(name: string, street: string, houseNumber: string, zipCode: string, city: string, email: string, password: string):Observable<ResponseMessage>{
        const registerObservable = this.http.post<ResponseMessage>('/api/register', { //Route to backend
            name: name,
            street: street,
            houseNumber: houseNumber,
            zipCode: zipCode,
            city: city,
            email: email,
            password: password
        }).pipe(shareReplay());
        registerObservable.subscribe({
            next: () => {
                this.registered = true;
            },
            error: (err) => {
                this.registered = false;
                console.log(err);
            }
        });
        return registerObservable;
    }
}