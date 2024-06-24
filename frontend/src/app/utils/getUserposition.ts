import { PositionService } from './position.service';

export class GetUserPosition {
    static userPosition(positionService: PositionService): void {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                positionService.setLatitude(position.coords.latitude);
                positionService.setLongitude(position.coords.longitude);
              },
              (error) => {
                console.error('Fehler beim Abrufen der Position', error);
              },
            );
        } else {
            console.error('Geolocation wird von diesem Browser nicht unterstützt');
      }
    }
}