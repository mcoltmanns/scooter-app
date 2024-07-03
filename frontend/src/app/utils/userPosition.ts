import { PositionService } from './position.service';

export class UserPosition {
  /**
   * get current latitude and longitude from the user position
   * @param positionService 
   */
  static setUserPosition(positionService: PositionService): Promise<boolean> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            positionService.setLatitude(position.coords.latitude); // update the global variable user latitude 
            positionService.setLongitude(position.coords.longitude); // update the global variable user longitude
            resolve(true);
          },
          (error) => {
            console.error('Fehler beim Abrufen der Position', error);
            resolve(false);
          }
        );
      } else {
        console.error('Geolocation wird von diesem Browser nicht unterstützt');
        resolve(false);
      }
    });
  }
}
