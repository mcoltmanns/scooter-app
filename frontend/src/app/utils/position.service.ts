import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * @public latitude - global persistent variable
 * @public longitude - gloabl persistent variable
 * Service for managing user position (latitude and longitude).
 * Uses local storage to persist position data across sessions.
 */
export class PositionService {
  private localStorageKey = 'user_position';

  // default values for user coordinates
  public latitude = 47.663557;
  public longitude = 9.175365;

  constructor() {
    // load values from local storage if available
    const storedPosition = JSON.parse(localStorage.getItem(this.localStorageKey) || '{}');
    this.latitude = storedPosition.latitude || this.latitude;
    this.longitude = storedPosition.longitude || this.longitude;
  }

  // sets the latitude and saves it to local storage
  setLatitude(latitude: number): void {
    this.latitude = latitude;
    this.saveToLocalStorage();
  }

  // sets the longitude and saves it to local storage
  setLongitude(longitude: number): void {
    this.longitude = longitude;
    this.saveToLocalStorage();
  }

  // gets the current latitude value
  getLatitude(): number {
    return this.latitude;
  }

  // gets the current longitude value
  getLongitude(): number {
    return this.longitude;
  }

  // saves the current position (latitude and longitude) to local storage.
  private saveToLocalStorage(): void {
    const position = {
      latitude: this.latitude,
      longitude: this.longitude
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(position));
  }
}
