import { CommonModule } from '@angular/common';
import { Component, OnInit, NgZone, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
 


/**
 * Typescript erlaub es uns, auch einen ganzen Namespace zu importieren statt einzelne Komponenten.
 * Die "Komponenten" (Klassen, Methoden, ...) des Namespace können dann via "Leaflet.Komponente"
 * aufgerufen werden, z.B. "Leaflet.LeafletMouseEvent" (siehe unten)
 */
import * as Leaflet from 'leaflet';
import { MapService } from 'src/app/services/map.service';
import { Scooter } from 'src/app/models/scooter';
import { ScooterListComponent } from '../scooter-list/scooter-list.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Html5Qrcode } from 'html5-qrcode';

/**
 * Konstante Variablen können außerhalb der Klasse definiert werden und sind dann
 * innerhalb der ganzen Klasse verfügbar.
 */
const defaultIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker.png',
});

@Component({
  standalone: true,
  imports: [LeafletModule, CommonModule, ScooterListComponent, FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements OnInit, OnDestroy {
  public scooters: Scooter[] = [];
  public errorMessage = '';
  public searchTerm  = ''; // value for the input field of "search scooter"
  public listScrollPosition: string | null = null;
  /* variables for QR-Code */
  private qrReader: Html5Qrcode | null = null;
  private qrActive = false;
  public qrButtonpressed = false;

  public constructor(private mapService: MapService, private router: Router, private ngZone: NgZone) {}

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  /**
   * Bitte Dokumentation durchlesen: https://github.com/bluehalo/ngx-leaflet
   */
  options: Leaflet.MapOptions = {
    layers: [
      new Leaflet.TileLayer(
        'http://konstrates.uni-konstanz.de:8080/tile/{z}/{x}/{y}.png',
      ),
    ],
    zoom: 16,
    center: new Leaflet.LatLng(47.663557, 9.175365),
    attributionControl: false,
  };

  view: 'map' | 'list' = 'map';

  /**
   * Um z.B. einen Marker auf der Map einzuzeichnen, übergeben wir Leaflet
   * ein Array von Markern mit Koordinaten. Dieses Attribut wird im HTML Code
   * dann an Leaflet weitergegeben.
   * Dokumentation: https://github.com/bluehalo/ngx-leaflet#add-custom-layers-base-layers-markers-shapes-etc
   */
   
  // layers = [Leaflet.marker([47.663557, 9.175365], { icon: defaultIcon })];
   layers: Leaflet.Layer[] = [];

  /**
   * Diese Methode wird im "map.component.html" Code bei Leaflet registriert
   * und aufgerufen, sobald der Benutzer auf die Karte klickt
   */
  onMapClick(e: Leaflet.LeafletMouseEvent): void {
    console.log(`${e.latlng.lat}, ${e.latlng.lng}`);
  }

  buttonToScooter(scooterId: number): void {
    this.ngZone.run(() => this.router.navigate(['search/scooter', scooterId]));
    //this.router.navigate(['/scooter', scooterId]);
    
  }

  /**
   * This method adds a marker on the map for every scooter in this.scooters
   */
  addScootersToMap(): void {
    for(const scooter of this.scooters) {
      const marker = Leaflet.marker([scooter.coordinates_lat, scooter.coordinates_lng],
        {icon: defaultIcon}
      ).on('click', ()=> {
        console.log(`${scooter.id} wurde angeklickt!`);
        this.buttonToScooter(scooter.id);
      }); //this.router.navigate(['/scooter', scooter.id]);
      this.layers.push(marker);
    }
  }

  ngOnInit(): void {
    /* Check if the user has navigated to this page from the list view or the map view and set the view accordingly */
    if (history.state.originState && history.state.originState.searchToggle) {
      this.view = history.state.originState.searchToggle;
    }
    /* Check if the user wants to see the list view at the same scroll position as before */
    if (history.state.originState && history.state.originState.listScrollPosition && history.state.originState.searchToggle === 'list') {
      this.listScrollPosition = history.state.originState.listScrollPosition;
    }

    // Using mapService to get the data about scooters from backend
    // and add markers on the map using addScootersToMap()-method
    this.mapService.getScooterInfo().subscribe({
      next: (value) => {
        this.scooters = value;
        this.addScootersToMap();
      },

      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });

    /*for (const layer of this.layers) {
      // Eventhandler (z.B. wenn der Benutzer auf den Marker klickt) können
      // auch direkt in Typescript hinzugefügt werden
      layer.on('click', (e: Leaflet.LeafletMouseEvent) => {
        // Mittels der (im Browser eingebauten) alert() Methode wird ein
        // Browser Pop-up Fenster geöffnet
        alert('Marker was clicked!');

        // In der Konsole können die Events genauer angeschaut werden,
        // was die Entwicklung erleichtern kann
        console.log(e);
      });
    }*/

    this.qrReader = new Html5Qrcode('qr-reader');
  }

  toggleListView(): void {
    this.view = this.view === 'map' ? 'list' : 'map';
    if (this.view === 'map') {
      this.listScrollPosition = null;
    }
    history.replaceState({ originState: { searchToggle: this.view } }, '');
  }

  /* if we click on an QR Code */
  startQrCodeScanner(): void {
    if(this.qrButtonpressed === true){
      this.stopQrCodeScanner();
      this.qrButtonpressed = false;
      return;
    }
    if(this.qrButtonpressed === false){
      this.qrButtonpressed = true;
    }
    if (this.qrReader) {
      console.log('QR-Button pressed');
      this.qrActive = true;
      this.qrReader
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: 250,
          },
          (decodedText) => {
            console.log(`QR Code gescannt: ${decodedText}`);
            console.log(decodedText);
            window.location.href = decodedText;
            this.qrReader?.stop(); // Stop QR code scanner
          },
          (errorMessage) => {
            //console.warn(`Scan fehlgeschlagen: ${errorMessage}`);
          }
        )
        .catch((err) => {
          console.error(`Kamera konnte nicht gestartet werden: ${err}`);
        });

        
        // Access to the video element and display of the camera preview
        if (this.videoElement && this.videoElement.nativeElement) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
              this.videoElement.nativeElement.srcObject = stream;
            })
            .catch(err => {
              console.error('Kamerazugriff verweigert:', err);
        });
      }
    }
  }

  /* stops QR Code scanning */
  stopQrCodeScanner(): void {
    if (this.qrReader && this.qrActive) {
      this.qrReader.stop()
        .then(() => {
          this.qrActive = false;
          console.log('QR-Code-Scanner gestoppt');
        })
        .catch((err) => {
          console.error('Fehler beim Stoppen des QR-Code-Scanners:', err);
        });
    }
  
    if (this.videoElement.nativeElement.srcObject) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        this.videoElement.nativeElement.srcObject = null;
      }
    }
  }

  /* if the we change the page */
  ngOnDestroy(): void {
    if (this.qrReader && this.qrActive === true) {
      this.qrReader.stop().then(() => {
        console.log('QR-Code-Scanner gestoppt');
      }).catch((err) => {
        console.error('Fehler beim Stoppen des QR-Code-Scanners:', err);
      });
    }

    // Kamera stoppen, wenn sie noch aktiv ist
    if (this.videoElement && this.videoElement.nativeElement.srcObject) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        this.videoElement.nativeElement.srcObject = null;
      }
    }
  }
}