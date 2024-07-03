import { CommonModule } from '@angular/common';
import { Component, OnInit, NgZone, OnDestroy, ElementRef, ViewChild, Renderer2, ChangeDetectorRef} from '@angular/core';
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
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { Sorts } from 'src/app/utils/util-sorts';

// QR-Code imports:
import { Html5Qrcode } from 'html5-qrcode';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';

//Slider for the filter
import { SliderModule } from 'primeng/slider';
//Drop down menu
import { DropdownModule } from 'primeng/dropdown';


/* user icon for showing the user position */
const userIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/person.png',
});

interface City {
  name: string;
}

@Component({
    standalone: true,
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    imports: [LeafletModule, CommonModule, ScooterListComponent, FormsModule, FilterButtonComponent, ButtonComponent, ReactiveFormsModule, UserInputComponent, SortButtonComponent, LoadingOverlayComponent, ToastComponent, SliderModule, DropdownModule]
})

export class MapComponent implements OnInit, OnDestroy{
  // Variables for scooters
  public scooters: Scooter[] = [];
  public products: Product[] = [];
  public errorMessage = '';
  public searchTerm  = ''; // value for the input field of "search scooter"
  public listScrollPosition: string | null = null;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  /* Variables for QR-Code */
  private qrReader: Html5Qrcode | null = null;
  public qrActive = false;
  public qrButtonpressed = false;
  public isLoading = false; // camera loading variable
  /* variables for the qr Code toast */
  @ViewChild('toastComponent') toastComponent!: ToastComponent;
  public showToast = false;
  public toastMessage = 'Kamerazugriff verweigert!';
  public toastType: 'success' | 'error' = 'error';

  // Variables for the slider:
  priceRange: number[] = [0, 20];
  scooterRange: number[] = [0, 300];
  batteryPercentageRange: number[] = [0, 100];
  speedRange: number[] = [0, 540];
  public  showSlider = true;
  


  public scooterFilterForm!: FormGroup;
  //scooter arrays for the filters and sorting---
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
  //---------------------------------------------
   // User Units variables
   public selectedSpeed = ''; 
   public selectedDistance = '';
   public selectedCurrency = '';
   public option: Option | null = null;

  cities: City[];
  selectedCity: City = { name: ''};

  public constructor(private mapService: MapService, private router: Router, private ngZone: NgZone, private fb: FormBuilder, private positionService: PositionService, private renderer: Renderer2, private el: ElementRef, private optionService: OptionService, private cdr: ChangeDetectorRef) 
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
  }),this.cities = [
    { name: 'Preis aufsteigend'},
    { name: 'Preis absteigend'},
    { name: 'Reichweite aufsteigend'},
    { name: 'Reichweite absteigend'},
    { name: 'Batteriestand aufsteigend'},
    { name: 'Batteriestand absteigend'},
  ];}

  /* user can choose an ordering method from the drop down bar */
  onOrderChange(event: { value: { name: string; }; }):void {
    console.log('Selected city:', event.value);
    if(event.value.name === 'Preis aufsteigend'){
      this.sortPrice(true);
    }
    if(event.value.name === 'Preis absteigend'){
      this.sortPrice(false);
    }
    if(event.value.name === 'Reichweite aufsteigend'){
      this.sortRange(true);
    }
    if(event.value.name === 'Reichweite absteigend'){
      this.sortRange(false);
    }
    if(event.value.name === 'Batteriestand aufsteigend'){
      this.sortBty(true);
    }
    if(event.value.name === 'Batteriestand absteigend'){
      this.sortBty(false);
    }
  }

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

  /* This method adds a marker on the map for every scooter in this.scooters */
  addScootersToMap(): void {
    for(const scooter of this.filteredScooters) {
      
      // Decide what color does the marker have.
      let batteryColor = '#4df353';
      
      if (scooter.battery <= 20) {
        batteryColor = '#d81204';
      } else if (scooter.battery <= 50 && scooter.battery >= 20) {
        batteryColor = '#fad609';
      }

      // This part contains all css styles for the scooter marker.
      const batteryPieStyle = `
      position: relative;
      width: 30px;  /* reduced from 50px */
      height: 30px; /* reduced from 50px */
      border-radius: 50%;
      background: conic-gradient(
        ${batteryColor} calc(var(--percentage) * 1%), 
        #f8fdff calc(var(--percentage) * 1%)
      );
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
      border: 2px solid rgb(46, 90, 120); /* reduced from 4px */
      --percentage: ${scooter.battery};
    `;

    const batteryInnerPieStyle =`
      position: absolute;
      width: 18px;  /* reduced from 30px */
      height: 18px; /* reduced from 30px */
      background: ${batteryColor};
      border: 4px solid rgb(46, 90, 120); /* reduced from 8px */
      border-radius: 50%;
    `;
      
      // Define the marker icon.
      const icon = Leaflet.divIcon({
        className: 'marker',
        html: `<div style="${batteryPieStyle}"><div style="${batteryInnerPieStyle}"></div></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42] 
      });

      // Add markers to the map.
      const marker = Leaflet.marker([scooter.coordinates_lat, scooter.coordinates_lng],
        {icon: icon}
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

    this.optionService.getUserPreferences().subscribe({
      next: (value) => {
        this.option = value;
        this.selectedSpeed = this.option.speed;
        this.selectedDistance = this.option.distance;
        this.selectedCurrency = this.option.currency;
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error(err);
      }
    });
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
          this.qrButtonpressed = false;
          this.qrActive = false;
          this.showToast = true;
          this.toastComponent.showToast();
          this.showToast = false; // Reset the state to prevent the toast from showing again
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
              this.qrButtonpressed = false;
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


// things necessary for the filter------------------------------------------------------------------------------

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
      //convert units to default backend units of metric and euro, using inline if to catch empty input fields
      this.minPrice = (this.minPrice === '') ? '' : String (UnitConverter.convertCurrency(Number (this.minPrice), this.selectedCurrency, '€'));
      this.maxPrice = (this.maxPrice === '') ? '' : String (UnitConverter.convertCurrency(Number (this.maxPrice), this.selectedCurrency, '€'));
      this.minRange = (this.minRange === '') ? '' : String (UnitConverter.convertDistance(Number(this.minRange), this.selectedDistance, 'km'));
      this.maxRange = (this.maxRange === '') ? '' : String (UnitConverter.convertDistance(Number(this.maxRange), this.selectedDistance, 'km'));
      this.minSpeed = (this.minSpeed === '') ? '' : String (UnitConverter.convertSpeed(Number (this.minSpeed), this.selectedSpeed, 'km/h'));
      this.maxSpeed = (this.maxSpeed === '') ? '' : String (UnitConverter.convertSpeed(Number (this.maxSpeed), this.selectedSpeed, 'km/h'));
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
    this.updateUserPosition();
  }

  /**
   * when we press the "Zurücksetzen"-Button, this resets all variables associated with filters
   */
  onCancel(): void {
    Filters.resetBounds();
    this.filteredScooters = this.scooters;
    this.layers=[];
    this.addScootersToMap();
    this.updateUserPosition();
    this.toggleFilterView();
    this.minPrice = '';
    this.maxPrice = '';
    this.minRange = '';
    this.maxRange = '';
    this.minBty = '';
    this.maxBty = '';
    this.minSpeed = '';
    this.maxSpeed = '';
    this.sortCancel();
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

  // the auto formatters for all the input field pairs
  autoFormatPrice(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
    
    //only allow 2 digit input
    if (value.length > 2) {
      value = value.slice(0, 2);
    }
  
    // Restrict the input to values between 0 and 20, overwrite all values not in range with either minimal or maximal value
    let numValue = Number(value);
    if (numValue < 0) {
      numValue = 0;
      value = String (0);
    } else if (numValue > 20) {
      numValue = 20;
      value = String(20);
    }

    this.scooterFilterForm.controls[controlName].setValue(value.toString(), { emitEvent: false });
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
    this.sortedScooters = this.filteredScooters;
    this.sortedScooters = Sorts.redoSort(this.sortedScooters, this.products);
  }

  /**
   * is called when we press "Zurücksetzen"-Button in the sort-options, this resets all values to default,
   * same value they are initialized with
   */
  sortCancel(): void{
    Sorts.sortCancel();

    this.sortedScooters = this.filteredScooters;
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooters by price
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortPrice(asc: boolean):void{
    this.sortedScooters = this.filteredScooters;
    this.sortedScooters = Sorts.sortPrice(asc, this.sortedScooters, this.products);
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooters by range2
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortRange(asc: boolean):void{
    this.sortedScooters = this.filteredScooters;
    this.sortedScooters = Sorts.sortRange(asc, this.sortedScooters, this.products);
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooter by battery percentage
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortBty(asc: boolean):void{
    this.sortedScooters = this.filteredScooters;
    this.sortedScooters = Sorts.sortBty(asc, this.sortedScooters);
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /**
   * sorts scooter by speed
   * @param asc says whether they are sorted in ascending or descending order
   */
  sortSpeed(asc: boolean):void{
    this.sortedScooters = this.filteredScooters;
    this.sortedScooters = Sorts.sortSpeed(asc, this.sortedScooters, this.products);
    this.sortMenuVisible = !this.sortMenuVisible;
  }

  /* updates when price slider changes */
  onPriceRangeChange():void{
    this.scooterFilterForm.patchValue({
      minPrice: this.priceRange[0],
      maxPrice: this.priceRange[1]
    });
  }

  /* updates max price slider */
  onMaxPriceRangeChange():void {
    this.scooterFilterForm.get('maxPrice')?.valueChanges.subscribe(maxPrice => {
      this.priceRange[1] = maxPrice;
    });
    this.updateSlider();
  }

  /* updates min price slider */
  onMinPriceRangeChange():void {
    this.scooterFilterForm.get('minPrice')?.valueChanges.subscribe(minPrice => {
      this.priceRange[0] = minPrice;
    });
    this.updateSlider();
  }

  /* updates when price slider changes */
  onScooterRangeChange():void{
    console.log(this.scooterRange[0]);
    this.scooterFilterForm.patchValue({
      minRange: this.scooterRange[0],
      maxRange: this.scooterRange[1]
    });
  }

  
  onMaxScooterRangeChange():void {
    this.scooterFilterForm.get('maxRange')?.valueChanges.subscribe(maxRange => {
      this.scooterRange[1] = maxRange;
    });
    this.updateSlider();
  }

  
  onMinScooterRangeChange():void {
    this.scooterFilterForm.get('minRange')?.valueChanges.subscribe(minRange => {
      this.scooterRange[0] = minRange;
    });
    this.updateSlider();
  }

  
  onBatteryRangeChange():void{
    this.scooterFilterForm.patchValue({
      minBty: this.batteryPercentageRange[0],
      maxBty: this.batteryPercentageRange[1]
    });
  }

  onMaxBatteryRangeChange():void {
    this.scooterFilterForm.get('maxBty')?.valueChanges.subscribe(maxBty => {
      this.batteryPercentageRange[1] = maxBty;
    });
    this.updateSlider();
  }

  onMinBatteryRangeChange():void {
    this.scooterFilterForm.get('minBty')?.valueChanges.subscribe(minBty => {
      this.batteryPercentageRange[0] = minBty;
    });
    this.updateSlider();
  }

  onSpeedRangeChange():void{
    this.scooterFilterForm.patchValue({
      minSpeed: this.speedRange[0],
      maxSpeed: this.speedRange[1]
    });
  }

  onMaxSpeedRangeChange():void {
    this.scooterFilterForm.get('maxSpeed')?.valueChanges.subscribe(maxSpeed => {
      this.speedRange[1] = maxSpeed;
    });
    this.updateSlider();
  }

  onMinSpeedRangeChange():void {
    this.scooterFilterForm.get('minSpeed')?.valueChanges.subscribe(minSpeed => {
      this.speedRange[0] = minSpeed;
    });
    this.updateSlider();
  }

  /* updates the slider */
  updateSlider():void{
    this.showSlider = false; // Disable Slider
    setTimeout(() => {
      this.showSlider = true;
    }, 0); // Re-enable the slider
  }
}