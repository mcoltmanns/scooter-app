import { CommonModule } from '@angular/common';
import { Component, OnInit, NgZone, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
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
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { FilterButtonComponent } from 'src/app/components/filter-button/filter-button.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { UserInputComponent } from 'src/app/components/user-input/user-input.component';
import { Filters } from 'src/app/utils/util-filters';
import { Product } from 'src/app/models/product';
import { SortButtonComponent} from '../../components/sort-button/sort-button.component';
import { UserPosition } from 'src/app/utils/userPosition'; // get methods from utils folder 
import { PositionService } from 'src/app/utils/position.service';

// QR-Code imports:
import { Html5Qrcode } from 'html5-qrcode';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';

/**
 * Konstante Variablen können außerhalb der Klasse definiert werden und sind dann
 * innerhalb der ganzen Klasse verfügbar.
 */
const defaultIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker.png',
});

/**
 * Icon for the user -> is displayed on the map
 */
const userIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/person.png',
});

@Component({
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [LeafletModule, CommonModule, ScooterListComponent, FormsModule, FilterButtonComponent, ButtonComponent, ReactiveFormsModule, UserInputComponent, SortButtonComponent, LoadingOverlayComponent]
})

export class MapComponent implements OnInit, OnDestroy {
  public scooters: Scooter[] = [];
  public products: Product[] = [];
  public errorMessage = '';
  public searchTerm  = ''; // value for the input field of "search scooter"
  public listScrollPosition: string | null = null;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  /* variables for QR-Code */
  private qrReader: Html5Qrcode | null = null;
  public qrActive = false;
  public qrButtonpressed = false;
  public isLoading = false; // camera loading variable


  public scooterFilterForm!: FormGroup;
//scooter arrays for the filters and sorting----
//contains filtered scooters, unsorted
  public filteredScooters: Scooter[] = [];
//contains filtered scooters, sorted
  public sortedScooters: Scooter[] = [];
//---------------------------------------------


//variables for the filters--------------------
  filterMenuVisible = false;
  //variables for the input of the form and hence the filters
  public minPrice = '';
  public maxPrice = '';
  public minRange = '';
  public maxRange = '';
  public minBty = '';
  public maxBty = '';
  public minSpeed = '';
  public maxSpeed = '';
//---------------------------------------------

//Variables for the sorting--------------------
  sortMenuVisible = false;
  //variables that say what is to be filtered by
  public price = false;
  public range = false;
  public bty = false;
  public speed = false;
  //variable for ascending filtered or not
  public asc = true;
//---------------------------------------------

  public constructor(private mapService: MapService, private router: Router, private ngZone: NgZone, private fb: FormBuilder, private positionService: PositionService, private renderer: Renderer2, private el: ElementRef) 
  { //form group for the input on the scooter-filters
    this.scooterFilterForm = this.fb.group({ 
    minPrice: ['', [this.numberStringValidator(0, 99999)]],
      maxPrice: ['', [this.numberStringValidator(0, 99999)]],
      minRange: ['', [this.numberStringValidator(0, 99999)]],
      maxRange: ['', [this.numberStringValidator(0, 99999)]],
      minBty: ['', [this.numberStringValidator(0, 100)]],
      maxBty: ['', [this.numberStringValidator(0, 100)]],
      minSpeed: ['', [this.numberStringValidator(0, 99999)]],
      maxSpeed: ['', [this.numberStringValidator(0, 99999)]]
  });}

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
    center: new Leaflet.LatLng(this.positionService.latitude, this.positionService.longitude),
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
  }

  /**
   * This method adds a marker on the map for every scooter in this.scooters
   */
  addScootersToMap(): void {
    for(const scooter of this.filteredScooters) {
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
   
      //has to be done in this somewhat not nice form to ensure all the data is there when the functions run

      // Using mapService to get the data about products from backend
      this.mapService.getProductInfo().subscribe({
        next: (value) => {
          this.products = value;
          // Using mapService to get the data about scooters from backend
          this.mapService.getScooterInfo().subscribe({
            next: (value) => {
              this.scooters = value;
              this.filteredScooters = Filters.onReload(this.scooters, this.products);
              this.sortedScooters = this.filteredScooters;
              this.sortFiltered();
              this.addScootersToMap();
            },
      
            error: (err) => {
              this.errorMessage = err.error.message;
              console.log(err);
            }
          });
    
        },
  
        error: (err) => {
          this.errorMessage = err.error.message;
          console.log(err);
        }
      });

      // Initializes the QR code scanner with the video element 'qr-reader'.
    this.qrReader = new Html5Qrcode('qr-reader');
    this.updateUserPosition(); // call method to update user Position
  }

  /* if the we change the page */
  ngOnDestroy(): void {
    this.stopQrCodeScanner();

    /* Reset the page height to the app default */
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'overflow', 'auto');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'overflow', 'auto');

    /* Clear all timeouts */
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
  }

  adjustPageHeight(): void {
    if (this.view !== 'list') {
      /* Reset the page height to the app default if the view is not list */
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', '100%');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', '100%');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'overflow', 'auto');
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'overflow', 'auto');
      return;
    }

    /* Set the page height to auto to prevent a content overflow bug */
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'height', 'auto');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'height', 'auto');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'overflow', 'hidden');
    this.renderer.setStyle(this.el.nativeElement.ownerDocument.documentElement, 'overflow', 'hidden');

    /* Scroll to the top of the page with a timeout of 0ms to ensure that the scroll is done after the view is rendered */
    window.scrollTo(0, 0);
    this.scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  toggleListView(): void {
    this.view = this.view === 'map' ? 'list' : 'map';
    if (this.view === 'map') {
      this.listScrollPosition = null;
      this.adjustPageHeight();
    }
    history.replaceState({ originState: { searchToggle: this.view } }, '');
  }

  /* click on the QR Code Button */
  startQrCodeScanner(): void {
    // Button pressed to stop QR Code scanning
    if(this.qrButtonpressed === true){
      this.stopQrCodeScanner();
      this.qrButtonpressed = false;
      return;
    }
    // Button pressed to start QR Code scanning
    if(this.qrButtonpressed === false){
      this.qrButtonpressed = true;
      this.isLoading = true; 
    }
    // reads the qrCode
    if (this.qrReader) {
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

            // Check whether the link begins with "http://localhost:4200/"
            const baseURL = `${window.location.protocol}//${window.location.host}`;
            if (decodedText.startsWith(baseURL)) {
              window.location.href = decodedText;
              this.qrReader?.stop();
            } else {
              console.log('Der Link entspricht nicht den Anforderungen und wird nicht geladen.');
            }
          },
          () => {  //(errorMessage)
            this.isLoading = false;
            //console.warn(`Scan fehlgeschlagen: ${errorMessage}`);
          }
        )
        .catch((err) => {
          this.isLoading = false;
          console.error(`Kamera konnte nicht gestartet werden: ${err}`);
        });

        
        // Access to the video element and display of the camera preview
        if (this.videoElement && this.videoElement.nativeElement) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
              this.isLoading = false;
              this.videoElement.nativeElement.srcObject = stream;
            })
            .catch(err => {
              this.isLoading = false;
              console.error('Kamerazugriff verweigert:', err);
        });
      }
    }
  }

  /* stops QR Code scanning */
  stopQrCodeScanner(): void {
    // stops the QR Code reader
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
  
    // stops the video live stream
    if (this.videoElement && this.videoElement.nativeElement && this.videoElement.nativeElement.srcObject) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        this.videoElement.nativeElement.srcObject = null;
      }
    }
  }

  /* update the user position and put a user icon on the map */
  updateUserPosition(): void {
    UserPosition.setUserPosition(this.positionService)
    .then((result) => {
      console.log(result);
      if (result) {
        const userMarker = Leaflet.marker([this.positionService.latitude, this.positionService.longitude], { icon: userIcon });
        this.layers.push(userMarker); // place the user icon on the map
        console.log('Position successfully set');
      } else {
        console.log('Failed to set position');
      }
    })
    .catch((error) => {
      console.error('An error occurred:', error);
    });
  }


//things necessary for the filter------------------------------------------------------------------------------

/**
 * enables/disables visibility of filter form
 */
  toggleFilterView(): void {
    this.filterMenuVisible = !this.filterMenuVisible;
  }

  /**
   * if we press "Anwenden"-Button, if input is valid, we get values from input and apply the filters accordingly
   */
  onSubmit(): void {
    if (this.scooterFilterForm.valid) {
      //get the values from the form
      this.minPrice = this.scooterFilterForm.get('minPrice')?.value;
      this.maxPrice = this.scooterFilterForm.get('maxPrice')?.value;
      this.minRange = this.scooterFilterForm.get('minRange')?.value;
      this.maxRange = this.scooterFilterForm.get('maxRange')?.value;
      this.minBty = this.scooterFilterForm.get('minBty')?.value;
      this.maxBty = this.scooterFilterForm.get('maxBty')?.value;
      this.minSpeed = this.scooterFilterForm.get('minSpeed')?.value;
      this.maxSpeed = this.scooterFilterForm.get('maxSpeed')?.value;
      //update the memory values in the filter util file
      Filters.setBounds(this.minPrice, this.maxPrice, this.minRange, this.maxRange, this.minBty, this.maxBty, this.minSpeed, this.maxSpeed);
      //then apply the filters
      this.filterUpdates();
      this.toggleFilterView();
      this.sortFiltered();
    }
  }

  /**
   * applies the filters to the list 
   */
  filterUpdates(): void{
    this.layers=[];
    this.filteredScooters = Filters.filterPrice(this.scooters, this.products);
    this.filteredScooters = Filters.filterRange(this.filteredScooters, this.products);
    this.filteredScooters = Filters.filterBattery(this.filteredScooters);
    this.filteredScooters = Filters.filterSpeed(this.filteredScooters, this.products);
    //add the new selection of scooters to the map
    this.addScootersToMap();
  }

  /**
   * when we press the "Zurücksetzen"-Button, this resets all variables associated with filters
   */
  onCancel(): void {
    Filters.resetBounds();
    this.filteredScooters = this.scooters;
    this.layers=[];
    this.addScootersToMap();
    this.toggleFilterView();
    this.minPrice = '';
    this.maxPrice = '';
    this.minRange = '';
    this.maxRange = '';
    this.minBty = '';
    this.maxBty = '';
    this.minSpeed = '';
    this.maxSpeed = '';
    this.sortFiltered();
  }
  
  /**
    * auto formatter to enforce only numbers in filter input
    */
  autoFormatNumber(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    this.scooterFilterForm.controls[controlName].setValue(value, { emitEvent: false });
  }


  /**
   * validator to ensure the data given is somewhat sensible, allows no input
   */
  numberStringValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === '') {
        // Allow empty input
        return null;
      }
      if (!/^\d*$/.test(value)) {
        return { notNumber: true };
      }
      const numValue = Number(value);
      if (numValue < min || numValue > max) {
        return { outOfRange: true };
      }
      return null;
    };
  }



  //sort functionalities ---------------------------------------------------------------------------------

  //id in ascending is the default format, as this is what the user usually sees

  /**
   * enables/disables visibility of sort-options overlay
   */
  toggleSortView(): void {
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * checks if we have already applied a filter previously and if so, we apply again
   * 
   * is called after we change the @filteredScooters array due to new filters to maintain the sorting if it existed
   */
  sortFiltered(): void {
    //check what the last category filtered by and do the right sorting
    if(this.price){
      this.sortPrice(this.asc);
    } else if(this.range) {
      this.sortRange(this.asc);
      return;
    } else if(this.bty){
      this.sortBty(this.asc);
    } else if(this.speed){
      this.sortSpeed(this.asc);
    } else{
      this.sortedScooters = this.filteredScooters;
    }
  }

  /**
   * is called when we press "Zurücksetzen"-Button in the sort-options, this resets all values to default,
   * same value they are initialized with
   */
  sortCancel(): void{
    //reset to default values
    this.asc= true;
    this.price = false;
    this.range = false;
    this.bty = false;
    this.speed = false;

    this.sortedScooters = this.filteredScooters;
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooters by price
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortPrice(asc: boolean):void{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = true;
    this.range = false;
    this.bty = false;
    this.speed = false;
    this.sortedScooters = this.sortedScooters.sort((a,b) => {
      //get the price of the scooters being compared
    const priceA = this.products.find(p => p.name === a.product_id)?.price_per_hour;
    const priceB = this.products.find(p => p.name === b.product_id)?.price_per_hour;
    if(asc){//compare prices ascending
      if(!(priceA === undefined) && !(priceB === undefined)){
        const c = priceA - priceB;
        //if equal in price sort by id of scooter, always ascending per default
        if(c === 0){
          return a.id -b.id;
        }
        return c;
      }
    } else{//compare prices descending
      if(!(priceA === undefined) && !(priceB === undefined)){
        const c = priceB-priceA;
        //if equal in price sort by id, always ascending per default
        if(c === 0){
          return a.id - b.id;
        }
        return c;
      }
    }
    return 0;
    });
    console.log(this.sortedScooters);
    console.log(this.filteredScooters);
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooters by range2
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortRange(asc: boolean):void{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = true;
    this.bty = false;
    this.speed = false;
    this.sortedScooters = [];
    this.sortedScooters = this.filteredScooters.sort((a,b) => {
    let rangeA = this.products.find(p => p.name === a.product_id)?.max_reach;
    let rangeB = this.products.find(p => p.name === b.product_id)?.max_reach;
    if(!(rangeA === undefined)&&!(rangeB === undefined)){
      rangeA = (a.battery/100 * rangeA);
      rangeB = (b.battery/100 * rangeB);
      if(asc){//compare ascending
        const c = rangeA - rangeB;
        //if equal in range sort by id of scooter, always ascending per default
        if(c === 0){
          return a.id - b.id;
        }
        return c;
      } else{//compare descending
        const c =  rangeB - rangeA;
        //if equal in range, sort by id, always ascending per default
        if (c === 0){
          return a.id - b.id;
        }
        return c;
      }
    }
    return 0;
    });
    console.log(this.sortedScooters);
    console.log(this.filteredScooters);
    
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooter by battery percentage
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortBty(asc: boolean):void{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = false;
    this.bty = true;
    this.speed = false;
    this.sortedScooters = [];
    this.sortedScooters = this.filteredScooters.sort((a,b) => {
    if(asc){//compare ascending
      const c = a.battery - b.battery;
      //if equal in price sort by id of scooter, always ascending per default
      if(c === 0){
        return a.id - b.id;
      }
      return c;
    } else{//compare descending
      const c =  b.battery - a.battery;
      //if equal in battery, sort by id, always ascending per default
      if (c === 0){
        return a.id - b.id;
      }
      return c;
    }
    });
    console.log(this.sortedScooters);
    console.log(this.filteredScooters);
    
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooter by speed
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortSpeed(asc: boolean):void{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = false;
    this.bty = false;
    this.speed = true;
    this.sortedScooters = [];
    this.sortedScooters = this.filteredScooters.sort((a,b) => {
      //get the speed of the scooters being compared
    const speedA = this.products.find(p => p.name === a.product_id)?.max_speed;
    const speedB = this.products.find(p => p.name === b.product_id)?.max_speed;
    if(asc){ //compare ascending
      if(!(speedA === undefined) && !(speedB === undefined)){
        const c = speedA - speedB;
        //if equal in speed, sort by id, always ascending per default
        if (c === 0){
          return a.id - b.id;
        }
        return c;
      }
    } else{//compare descending
      if(!(speedA === undefined) && !(speedB === undefined)){
        const c = speedB-speedA;
        //if equal in speed, sort by id, always ascending per default
        if(c === 0){
          return a.id - b.id;
        }
        return c;
      }
    }
    return 0;
    });
    console.log(this.sortedScooters);
    console.log(this.filteredScooters);
    
    this.sortMenuVisible = !this.sortMenuVisible;
  }

}