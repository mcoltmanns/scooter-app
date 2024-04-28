import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';

@Injectable({
  providedIn: 'root',
})
export class LoginService{
  public loggedIn = false;
  public authChecked = false;

  constructor(private http: HttpClient) { }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  //check if authenticated
  public checkAuth(): Observable<boolean> {
    const authObservable : Observable<boolean> = this.http.get<boolean>('/api/authenticate').pipe(shareReplay());
    authObservable.subscribe({
      next: (value) => {
        this.loggedIn = value;
        this.authChecked = true;
      },
      error: (err) => {
        this.loggedIn = false;
        console.log(err);
      }
    });
    return authObservable;
  }

  //method to log in
  public login(email: string, password: string): Observable<ResponseMessage>{
    const loginObservable = this.http.post<ResponseMessage>('/api/login', {
      email : email,
      password : password
    }).pipe(shareReplay());
    loginObservable.subscribe({
      next: () => {
        this.loggedIn = true;
      },
      error : (err) => {
        this.loggedIn = false;
        console.log(err);
      }
    });
    return loginObservable;
  }

  //method to log out
  public logout(): Observable<ResponseMessage> {
    const logoutObservable: Observable<ResponseMessage> = this.http.delete<ResponseMessage>('/api/logout').pipe(shareReplay());
    logoutObservable.subscribe({
        next : () => {
            this.loggedIn = false;
        },
        error: (err) =>{
          this.checkAuth();
          console.error(err);
        }
    });
    return logoutObservable;
  }
}
