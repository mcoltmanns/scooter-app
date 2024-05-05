import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ResponseMessage } from '../models/response-message';

interface AuthResponse {
  code: number;
  authenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService{
  public loggedIn = false;
  public authChecked = false;

  constructor(private http: HttpClient) { }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  //check if authenticated
  // public checkAuth(): Observable<boolean> {
  //   const authObservable : Observable<boolean> = this.http.get<boolean>('/api/authenticate').pipe(shareReplay());
  //   authObservable.subscribe({
  //     next: (value) => {
  //       this.loggedIn = value;
  //       this.authChecked = true;
  //     },
  //     error: (err) => {
  //       this.loggedIn = false;
  //       console.log(err);
  //     }
  //   });
  //   return authObservable;
  // }
  public checkAuth(): Observable<boolean> {
    return this.http.get<AuthResponse>('/api/authenticate').pipe(
      tap(response => {
        this.loggedIn = response.authenticated;
        this.authChecked = true;
      }),
      map(response => response.authenticated),
      catchError(err => {
        console.log(err);
        this.loggedIn = false;
        this.authChecked = true;
        return of(false);
      }),
      shareReplay()
    );
  }

  // register method
  public register(name: string, street: string, houseNumber: string, zipCode: string, city: string, email: string, password: string):Observable<ResponseMessage>{
    const registerObservable = this.http.post<ResponseMessage>('/api/register', { // Route to register in the backend
        name: name,
        street: street,
        houseNumber: houseNumber,
        zipCode: zipCode,
        city: city,
        email: email,
        password: password
    }).pipe(shareReplay());
    registerObservable.subscribe({ // This line creates a pipe including the shareReplay observable operation, which shares the stream of data among all subscribers, caching a buffer of events and serving future subscribers with the last emitted values if available without re-executing the stream.
        next: () => {
            this.loggedIn = true;
        },
        error: (err) => {
            this.loggedIn = false;
            console.log(err);
        }
    });
    return registerObservable;
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
