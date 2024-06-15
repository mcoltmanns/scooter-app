import { CommonModule } from '@angular/common';
import { Component, OnInit, NgZone } from '@angular/core';
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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterButtonComponent } from 'src/app/components/filter-button/filter-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';

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
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [LeafletModule, CommonModule, ScooterListComponent, FormsModule, FilterButtonComponent, ButtonComponent, ReactiveFormsModule, UserInputComponent]
})

export class MapComponent implements OnInit {
  public scooters: Scooter[] = [];
  public errorMessage = '';
  public searchTerm  = ''; // value for the input field of "search scooter"
  public listScrollPosition: string | null = null;
  public scooterFilterForm!: FormGroup;

  public constructor(private mapService: MapService, private router: Router, private ngZone: NgZone, private fb: FormBuilder) 
  {this.scooterFilterForm = this.fb.group({
    lower: ['', Validators.required],
    upper: ['', Validators.required]
  });}

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
    this.loadScooters();

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
  }

  loadScooters(): void{
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
  }

  toggleListView(): void {
    this.view = this.view === 'map' ? 'list' : 'map';
    if (this.view === 'map') {
      this.listScrollPosition = null;
    }
    history.replaceState({ originState: { searchToggle: this.view } }, '');
  }

  filterMenuVisible = false;
  
  public lower = '';
  public upper = '';



  toggleFilterView(): void {
    this.filterMenuVisible = !this.filterMenuVisible;
  }

  onSubmit(): void {

  }

  onCancel(): void {
   
  }
  
}