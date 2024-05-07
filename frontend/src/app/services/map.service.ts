import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scooter } from '../models/scooter';

@Injectable({
  providedIn: 'root',
  deps: [HttpClient],
})
export class MapService {
  public globalText =
    'Dieser Text wird in einem Service verwaltet und ist somit unabhängig von Komponenten.';

  constructor(private http: HttpClient) {}

  public getScooterInfo(): Observable<Scooter[]> {
    return this.http.get<Scooter[]>('/api/map');
  }
}
