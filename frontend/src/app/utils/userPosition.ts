import { PositionService } from './position.service';
import * as Leaflet from 'leaflet';

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

  static createUserPositionIcon(): Leaflet.DivIcon {
    /* Blue Pulse */
    const primaryColor = '#80d2e0';
    const highlightColor = '#9af0ff';
    const borderColor = '#00363d';

    /* Green Pulse */
    // const primaryColor = '#75db42';
    // const highlightColor = '#97FB64';
    // const borderColor = '#123800';

    const styleSheet = document.createElement('style');
    styleSheet.innerText = `
    @keyframes pulse-animation-shadow {
      0% {
        box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.35);
      }
      50% {
        box-shadow: 0 0 0 20px rgba(0, 0, 0, 0);
      }
      100% {
        box-shadow: 0 0 0 20px rgba(0, 0, 0, 0);
      }
    }

    @keyframes pulse-animation-inner1 {
      0% {
        background-color: ${primaryColor};
      }
      50% {
        background-color: ${primaryColor};
      }
      51% {
        background-color: ${highlightColor};
      }
      100% {
        background-color: ${primaryColor};
      }
    }

    @keyframes pulse-animation-inner2 {
      0% {
        background-color: ${highlightColor};
        transform: scale(0);
        opacity: 0;
      }
      50% {
        background-color: ${highlightColor};
        transform: scale(1);
        opacity: 1;
      }
      51% {
        background-color: ${highlightColor};
        transform: scale(1);
        opacity: 1;
      }
      52% {
        background-color: ${highlightColor};
        transform: scale(0);
        opacity: 0;
      }
      100% {
        background-color: ${highlightColor};
        transform: scale(0);
        opacity: 0;
      }
    }
      
    @keyframes animate-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }`;
    document.head.appendChild(styleSheet);

    const userIconPulseWrapper = `
      margin: 20px;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      box-shadow: 0px 0px 0px 0px #000000;
      animation: pulse-animation-shadow 3s infinite 0.625s, animate-in 0.3s ease-out;
    `;
    const userIconPulseStyleOuter = `
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${borderColor};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.3);
    `;
    const userIconPulseStyleInner1 = `
      margin: 1px;
      background-color: ${highlightColor};
      width: 23px;
      height: 23px;
      border-radius: 50%;
      transform: scale(1);
      animation: pulse-animation-inner1 3s infinite;
    `;
    const userIconPulseStyleInner2 = `
      background-color: ${primaryColor};
      width: 23px;
      height: 23px;
      border-radius: 50%;
      transform: scale(1);
      opacity: 1;
      animation: pulse-animation-inner2 3s infinite;
    `;
    const userIconPulseStyleInner3 = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: transparent;
      border: 3px solid ${borderColor};
      border-radius: 50%;
      box-sizing: border-box;
      margin: auto;
      z-index: 2;
    `;

    return Leaflet.divIcon({
      className: '',
      html: `<div style="${userIconPulseWrapper}">
              <div style="${userIconPulseStyleOuter}">
                <div style="${userIconPulseStyleInner1}">
                  <div style="${userIconPulseStyleInner2}">
                  </div>
                </div>
                <div style="${userIconPulseStyleInner3}"></div>
              </div>
            </div>`,
      iconSize: [65, 65],
      iconAnchor: [32, 32],
    });
  }
}
