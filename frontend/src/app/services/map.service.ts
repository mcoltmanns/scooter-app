import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scooter } from '../models/scooter';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})
export class MapService {

  constructor(private http: HttpClient) {}

  /**
   * Method to get the the information from all avialable scooters.
   */
  public getScooterInfo(): Observable<Scooter[]> {
    return this.http.get<Scooter[]>('/api/map');
  }
}
