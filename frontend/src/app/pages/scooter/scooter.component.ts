import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { Product } from 'src/app/models/product';
import { MapService } from 'src/app/services/map.service';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { Scooter } from 'src/app/models/scooter';
import * as Leaflet from 'leaflet';
import { OptionService } from 'src/app/services/option.service';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { BookingService } from 'src/app/services/booking.service';
import { forkJoin } from 'rxjs';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';

const defaultIcon = Leaflet.icon({
  iconSize: [40, 40],
  iconUrl: '/assets/marker.png',
});

@Component({
  selector: 'app-scooter',
  standalone: true,
  imports: [ButtonComponent, BackButtonComponent, CommonModule, LeafletModule, LoadingOverlayComponent],
  templateUrl: './scooter.component.html',
  styleUrl: './scooter.component.css'
})
export class ScooterComponent implements OnInit {
  public backButtonPath: string | null = '/search';

  public batteryStatus = 0;
  public rangeStatus = 0;
  public speedStatus = 0;

  public loadingOperations = 2; // One scooter image in html code the forkJoin in ngOnInit

  public constructor(private route: ActivatedRoute, private mapService: MapService, private router: Router, private optionService: OptionService, private bookingService: BookingService) { }

  public errorMessage = '';
  public scooterNotFound = false;
  public loadingScooter = true;
  public product: Product | null = null;
  public scooter: Scooter | null = null;
  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;

  public canRent = false; // is the scooter free for booking/reservation?
  public canReserve = false; // can the user reserve the scooter?
  public canCancel = false; // can the user end the reservation on this scooter?

  options: Leaflet.MapOptions = {
    layers: [
      new Leaflet.TileLayer(
        'http://konstrates.uni-konstanz.de:8080/tile/{z}/{x}/{y}.png',
      ),
    ],
    zoom: 16,
    attributionControl: false,
    center: new Leaflet.LatLng(0, 0) // Initial center value
  };
  
  public center = new Leaflet.LatLng(0, 0);

  layers: Leaflet.Layer[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.processRoutingState();  // Handle the state of the previous page

      /* Get the scooter id from the URL */
      const scooterId = parseInt(params.get('id')!, 10);
      
      forkJoin([
        this.mapService.getSingleScooterInfo(scooterId),
        this.mapService.getSingleProductInfo(scooterId),
        this.optionService.getUserPreferences(),
        this.bookingService.getUserReservation()
      ]).subscribe({
        next: ([scooter, product, option, reservation]) => {
          /* Proess the scooter information */
          this.scooter = scooter;
          const marker = Leaflet.marker([this.scooter.coordinates_lat, this.scooter.coordinates_lng], {icon: defaultIcon});
          this.layers.push(marker); 
          this.center = new Leaflet.LatLng(this.scooter.coordinates_lat, this.scooter.coordinates_lng);
          this.options.center = this.center; // Set the map center
      
          /* Process the product information */
          this.product = product;
      
          /* Process the user preferences */
          this.option = option;
          this.selectedSpeed = this.option.speed;
          this.selectedDistance = this.option.distance;
          this.selectedCurrency = this.option.currency;

          /* Process the reservation information */
          if (reservation.reservation) {
            // got a reservation? (user has a reservation)
            this.canCancel = reservation.reservation.scooter_id === this.scooter!.id; // user can cancel the reservation if their reservation was on this scooter
            this.canRent = (this.scooter!.reservation_id === null && this.scooter!.active_rental_id === null) || this.canCancel; // user can rent this scooter if they can cancel or if scooter is neither reserved nor rented
            this.canReserve = false; // user can't reserve this scooter (already reserved)
          } else {
            this.canCancel = false; // user can't cancel reservation on this scooter
            this.canReserve = this.canRent = this.scooter!.reservation_id === null && this.scooter!.active_rental_id === null; // user can reserve or rent this scooter if it isn't otherwise reserved or rented
          }
  
          /* Load the product image */
          const imageLoadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            img.src = this.getImageUrl(this.product!.name);
            img.onload = resolve;
            img.onerror = reject;
          });
          imageLoadPromise
            .then(() => {
              this.loadingScooter = false;
  
              /* Animate the scooter status circles */
              this.animateScooterStatusCircles();
            })
            .catch(error => {
              console.error('Image failed to load:', error);
  
              this.loadingScooter = false;
  
              /* Animate the scooter status circles */
              this.animateScooterStatusCircles();
            });
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          this.loadingScooter = false;
          this.scooterNotFound = true;
          console.log(err);
        }
      });
    });
  }

  processRoutingState(): void {
    /* Handle the state of the previous page */
    const historyState = history.state;
  
    /* Set the back button path to null if the originator was the reservation island
      to bring the user back to the page they were on before. */
    if (historyState.originState && historyState.originState.island) {
      this.backButtonPath = null;
    }
  
    /* Clear the stateOrigin when coming from the reservation island */
    if (historyState && historyState.originState && 'island' in historyState.originState) {
      delete historyState.originState.island;
    }
  
    /* Clear the originState object if it is empty */
    if (historyState.originState && Object.keys(historyState.originState).length === 0) {
      delete historyState.originState;
    }
  
    /* Update the router state */
    history.replaceState(historyState, '');
  }

  animateScooterStatusCircles(): void {
    /* Calculate the maximum status values, limit them to 100 and animate the status circles */
    const maxBatteryStatus = Math.min(this.roundUpBattery(this.scooter!.battery), 100);
    const maxRangeStatus = Math.min(this.calcRange(this.scooter!.battery, this.product!.max_reach), 100);
    const maxSpeedStatus = Math.min(this.product!.max_speed, 100);
  
    const duration = 1500; // Duration of the animation in milliseconds
    const startTime = performance.now(); // Start time of the animation
  
    const easeOutCubic = (t: number): number => 1 - (1 - t) * (1 - t) * (1 - t);
  
    const animateStatus = (status: 'batteryStatus' | 'rangeStatus' | 'speedStatus', maxStatus: number): void => {
      const timeElapsed = performance.now() - startTime;  // Time elapsed since the start of the animation
      const t = Math.min(timeElapsed / duration, 1);    // Progress of the animation (between 0 and 1)
      this[status] = Math.round(maxStatus * easeOutCubic(t));  // Calculate the current status value
  
      if (t < 1) {  // Continue the animation if it is not finished
        requestAnimationFrame(() => animateStatus(status, maxStatus));
      }
    };
  
    animateStatus('batteryStatus', maxBatteryStatus);
    animateStatus('rangeStatus', maxRangeStatus);
    animateStatus('speedStatus', maxSpeedStatus);
  }

  /* Gets the image url for the scooters from the backend */
  getImageUrl(fileName: string): string {
    return `http://localhost:8000/img/products/${fileName}.jpg`;
  }

  /* If "Scooter Buchen" is pressed */
  onBook(): void {
    // console.log('scooterBook button pressed');
    const scooterId = this.scooter?.id;

    /* Pass the originState object to the next route if it exists. */
    const originState = history.state.originState ? { originState: history.state.originState } : {};
    this.router.navigate(['search/checkout', scooterId], { 
      state: originState
    });
  }

  // if "Scooter Reservieren" is pressed
  onReserve(): void {
    const scooterId = this.scooter!.id;
    this.canReserve = false;

    console.log(`reserve scooter ${scooterId}`);
    // ask the booking service to try and take out a reservation on this scooter
    this.bookingService.makeReservation({ scooterId: scooterId }).subscribe({
      next: (value) => {
        this.canCancel = true;

        const showReservationObj = {
          imagePath: this.getImageUrl(this.product!.name),
          redirectPath: `search/scooter/${scooterId}`,
          scooterName: this.product!.name,
          reservationEnd: value.reservation!.endsAt
        };

        this.bookingService.showReservationIsland(showReservationObj);
      },
      error: (err) => {
        console.error(err); // TODO: needs more feedback on if reservation failed - popup?
      }
    });
  }

  // if "Reservierung beenden" is pressed
  onEndReservation(): void {
    this.canCancel = false;
    
    // ask the booking service to end the reservation for this user
    this.bookingService.endReservation().subscribe({
      next: () => {
        this.canReserve = true;

        /* Destroy the reservation island */
        this.bookingService.destroyReservationIsland();
      },
      error: (err) => {
        console.error(err); // TODO also needs more feedback
      }
    });
  }

  // Method to calculate the range of the scooter
  calcRange(battery: number | undefined, max_reach: number | undefined): number {
    if(battery === undefined || max_reach === undefined){
      return 0;
    }
    else{
      return Math.ceil(battery / 100 * max_reach);
    }
  }

  /* Function that rounds up Battery */
  roundUpBattery(battery: number): number {
    return Math.ceil(battery);
  }

  /* Converts the distances */
  convertDistanceUnits(value: number | undefined, unit: string | undefined): string {
    if(unit === undefined ||value === undefined){
      return 'error';
    }

    let str = '';
    if(unit === 'mi'){
      value = UnitConverter.convertDistance(value, 'km', unit);
      str = value.toFixed(0) + ' mi'; // toFixed(0) shows no decimal places
    } 
    else{
      str = value.toString() + ' km';
    }
    return str;
  }

  /* converts the speeds */
  convertSpeedUnits(value: number | undefined, unit: string |undefined): string {
    if(unit === undefined ||value === undefined){
      return 'error';
    }

    let str = '';
    if(unit === 'mp/h'){
      value = UnitConverter.convertSpeed(value, 'km/h', unit);
      str = value.toFixed(1) + ' mp/h'; // toFixed(1) only shows the last decimal place
    }
    else{
      str = value.toString() + ' km/h';
    }
    return str;
  }

  /* Convert the currencies */
  convertCurrencyUnits(value: number, unit: string |undefined): string {
    if(unit === undefined){
      return 'error';
    }

    let str = '';
    if(unit === '$'){
      value = UnitConverter.convertCurrency(value, unit, '$');
      str = value.toFixed(2) + ' $/h'; // toFixed(2) only shows the last two decimal place
    }
    else{
      str = value.toString() + ' €/h';
    }
    return str;
  }
}