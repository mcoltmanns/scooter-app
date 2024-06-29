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
   * This method calculates the distance in km and mi between the current
   * and a given position.
   * @param lat2  latitude in deg.
   * @param lon2  longitude in deg.
   * @returns the distance as a string in km.
   */
  public calcDistances(lat2: number | undefined, lon2: number | undefined, unit: string | undefined): string {
    if (lat2 === undefined || lon2 === undefined || unit === undefined) {
      return 'Error';
    }
    const lat1 = this.latitude;
    const lon1 = this.longitude;
   
    const lat = (lat1 + lat2) / 2 * 0.01745;

    const dx  = 111.3 * Math.cos(lat) * (lon1 - lon2);
    const dy = 111.3 * (lat1 - lat2);

    let value =  Math.sqrt(dx * dx + dy * dy);
    let str = '';

    if(unit === 'mi'){
      value = UnitConverter.convertDistance(value, 'km', unit);
      if (value < 1) {
        str = (value * 1760).toFixed(0) + ' yd';
      } else {
        str = value.toFixed(2)  + ' mi';
      }
    } else {
      if (value < 1) {
        str = (value * 1000).toFixed(0) + ' m ';
      } else {  
        str = value.toFixed(2)  + ' km';
      }
    }

    return str;
  }
}

