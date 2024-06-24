import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private localStorageKey = 'user_position';

  public latitude = 47.663557;
  public longitude = 9.175365;

  constructor() {
    // load values from local storage if available
    const storedPosition = JSON.parse(localStorage.getItem(this.localStorageKey) || '{}');
    this.latitude = storedPosition.latitude || this.latitude;
    this.longitude = storedPosition.longitude || this.longitude;
  }

  setLatitude(latitude: number): void {
    this.latitude = latitude;
    this.saveToLocalStorage();
  }

  setLongitude(longitude: number): void {
    this.longitude = longitude;
    this.saveToLocalStorage();
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  private saveToLocalStorage(): void {
    const position = {
      latitude: this.latitude,
      longitude: this.longitude
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(position));
  }
}
