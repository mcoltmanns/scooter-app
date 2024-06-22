import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  public latitude = 47.663557;
  public longitude = 9.175365;

  setLatitude(latitude: number): void {
    this.latitude = latitude;
  }

  setLongitude(longitude: number): void {
    this.longitude = longitude;
  }

  getLatitude(): number | null {
    return this.latitude;
  }

  getLongitude(): number | null {
    return this.longitude;
  }
}