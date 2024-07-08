import { Injectable } from '@angular/core';
import { UnitConverter } from 'src/app/utils/unit-converter';


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

  /**
   * This method calculates the distance between the current
   * and a given position in km.
   * @param lat2  latitude in deg.
   * @param lon2  longitude in deg.
   * @returns the distance as a number in km. If input undefined the method 
   * returns -1.
   */
  public calcDistance(lat2: number | undefined, lon2: number | undefined): number {
    if (lat2 === undefined || lon2 === undefined) {
      return -1;
    }
    const lat1 = this.latitude;
    const lon1 = this.longitude;
   
    const lat = (lat1 + lat2) / 2 * 0.01745;

    const dx  = 111.3 * Math.cos(lat) * (lon1 - lon2);
    const dy = 111.3 * (lat1 - lat2);

    return Math.sqrt(dx * dx + dy * dy);
  }

  //static version for other util classes which are static
  static calculateDist (lat2: number | undefined, lon2: number | undefined): number {
    if (lat2 === undefined || lon2 === undefined) {
      return -1;
    }
    const currentPos = JSON.parse(localStorage.getItem('user_position') || '{}');
    const lat1 = currentPos.latitude || 47.663557;
    const lon1 = currentPos.longitude || 9.175365;
   
    const lat = (lat1 + lat2) / 2 * 0.01745;

    const dx  = 111.3 * Math.cos(lat) * (lon1 - lon2);
    const dy = 111.3 * (lat1 - lat2);

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * This method converts the given distance in the selected unit
   * and returns a string
   * @param distance is a number >= 0 or -1 if an error occurred.
   * @param unit is a string.
   * @returns a string.
   */
  public distanceToString(distance : number, unit: string | undefined): string {
    if (distance === -1 || unit === undefined) {
      return 'Error';
    }

    let str = '';

    if(unit === 'mi'){
      distance = UnitConverter.convertDistance(distance, 'km', unit);
      if (distance < 1) {
        str = (distance * 1760).toFixed(0) + ' yd';
      } else {
        str = distance.toFixed(2)  + ' mi';
      }
    } else {
      if (distance < 1) {
        str = (distance * 1000).toFixed(0) + ' m ';
      } else {  
        str = distance.toFixed(2)  + ' km';
      }
    }

    return str;
  }
}

