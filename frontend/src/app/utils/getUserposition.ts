import { PositionService } from './position.service';

export class GetUserPosition {
    static userPosition(positionService: PositionService): void {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                positionService.setLatitude(position.coords.latitude);
                positionService.setLongitude(position.coords.longitude);
                //console.log(`Latitude: ${positionService.getLatitude()}, Longitude: ${positionService.getLongitude()}`);
              },
              (error) => {
                console.error('Fehler beim Abrufen der Position', error);
              },
            );
        } else {
            console.error('Geolocation wird von diesem Browser nicht unterstützt');
        }
    }

    static getUserPosition(positionService: PositionService): number | null {
        return positionService.getLatitude();
    }
}