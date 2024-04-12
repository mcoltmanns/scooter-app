import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  /**
   *  Bitte die Logik entsprechend anpassen in Sprint 1!
   */
  public loggedIn = false;

  constructor() {}

  public isLoggedIn(): boolean {
    /**
     *  Bitte die Logik entsprechend anpassen in Sprint 1!
     */
    return this.loggedIn;
  }
}
