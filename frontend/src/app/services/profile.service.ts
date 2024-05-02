import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';
import { GetUserRes} from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class ProfileService{
    constructor(private http: HttpClient) {}

    public changedPersonalInformation = false;

    /**
     * checks whether the information has been changed
     */
    public isChanged(): boolean{
        return this.changedPersonalInformation;
    }

    /**
     * Retrieves all user information from the backend for the profile page using the GetUsersRes interface.
     */
    public getUser(): Observable<GetUserRes> {
        const userObservable: Observable<GetUserRes> = this.http.get<GetUserRes>('/api/user').pipe(shareReplay()); // route to get the personal information from the backend
        userObservable.subscribe({
          error: (err) => {
            console.error(err);
          }
        });
        return userObservable;
      }
    

      /**
       * sends the edited user information to the backend
       */
    public editPersonalInformation(name: string, street: string, houseNumber: string, zipCode: string, city: string, email: string, password: string):Observable<ResponseMessage>{
        const editPersonalInformationObservable = this.http.put<ResponseMessage>('/api/user', { // rroute to change the perosnal information in the backend
            name: name,
            street: street,
            houseNumber: houseNumber,
            zipCode: zipCode,
            city: city,
            email: email,
            password: password
        }).pipe(shareReplay());
        editPersonalInformationObservable.subscribe({
            next: () => {
                this.changedPersonalInformation = true;
            },
            error: (err) => {
                this.changedPersonalInformation = false;
                console.log(err);
            }
        });
        return editPersonalInformationObservable;
    }
}