import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Option } from '../models/option';


@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})
export class OptionService {

  constructor(private http: HttpClient) {}

  /* Method to get the option settings for a user */
  public getUserPreferences(): Observable<Option> {
    return this.http.get<Option>('/api/preferencesForUser');
  }

  /* Method to update the option settings for a user */
  public updateUserPreferences(speed: string, distance: string, currency: string): Observable<Option> {
    const updatedOptions = { speed, distance, currency };
    return this.http.post<Option>('/api/updateUserPreferences', updatedOptions);
  }
}
