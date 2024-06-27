import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Scooter } from 'src/app/models/scooter';
import { MapService } from 'src/app/services/map.service';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { OptionService } from 'src/app/services/option.service';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { Option } from 'src/app/models/option';
import { UnitConverter } from 'src/app/utils/unit-converter';
import { take } from 'rxjs';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { Levenshtein } from 'src/app/utils/levenshtein';

@Component({
  selector: 'app-scooter-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingOverlayComponent],
  templateUrl: './scooter-list.component.html',
  styleUrls: ['./scooter-list.component.css']
})
export class ScooterListComponent implements OnInit, OnChanges, AfterViewInit {
  public constructor(private mapService: MapService, private router: Router, private optionService: OptionService) {}

  @ViewChild('scrollableContainer', { static: false }) scrollableContainer!: ElementRef;
  @ViewChildren('elementRef') elementsRef!: QueryList<ElementRef>;

  @Input() searchTerm = ''; // Input property to receive the search term
  @Input() scrollPosition: string | null = null; // Input property to receive the scroll position
  @Input() mapScooters: Scooter[] = []; //Input property to get the filtered and sorted Scooter[] from the map
  public scooters: Scooter[] = [];
  public products: Product[] = [];
  public filteredScooters: Scooter[] = [];
  public levenshteinFilteredScooters: Scooter[] = [];
  public errorMessage = '';
  public loadingData = true;
  // User Units variables
  public selectedSpeed = ''; 
  public selectedDistance = '';
  public selectedCurrency = '';
  public option: Option | null = null;
  
  ngOnInit(): void {
    /* Get all scooters from backend */
    this.mapService.getScooterInfo().subscribe({
      next: (value) => {
        this.scooters = value;

        /* Creating an array of promises to load all images. */
        const imageLoadPromises = this.scooters.map(scooter => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = this.getImageUrl(scooter.product_id);
            img.onload = resolve;
            img.onerror = reject;
          });
        });
      
        /* Wait for all images to load and only then set loadingData to false. This way, the loading overlay
        will be removed only after all images are loaded. It is also necessary because it can come to problems
        with the scroll position if they are calculated before the images are loaded. */
        Promise.all(imageLoadPromises)
          .then(() => {
            this.loadingData = false;
            this.filterScooters();
          })
          .catch(error => {
            console.error('One or more images failed to load:', error);
            this.loadingData = false;
          });
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        this.loadingData = false;
        console.log(err);
      }
    });

    /* Get all scooters from backend */
    this.mapService.getProductInfo().subscribe({
      next: (value) => {
        this.products = value;
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.log(err);
      }
    });

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

  ngAfterViewInit(): void {
    /* Scroll to the scroll position where the user was before clicking on a scooter */
    /* take(1) ensures that the subscription is only called once */
    if (this.scrollPosition) {
      this.elementsRef.changes.pipe(take(1)).subscribe(() => {
        this.jumpToPosition(this.scrollPosition);
      });
    }
  }

  ngOnChanges(): void {
    this.filterScooters(); // Call filter method whenever searchTerm changes
    this.levenshteinFilterScooters();
  }

  /* Filters the scooters for the "search scooter" input field */
  filterScooters(): void {
    this.filteredScooters = this.mapScooters.filter(scooter =>
      scooter.product_id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /* Function for the green button */
  buttonToScooter(scooterId: number): void {
    this.router.navigate(['/search/scooter', scooterId], { 
      state: { 
        originState: { searchToggle: 'list', listScrollPosition: scooterId.toString() }
      }
    });
  }

  /* Function that rounds up Battery */
  roundUpBattery(battery: number): number {
    return Math.ceil(battery);
  }

  /* Function that capitalizes all letters */
  uppercaseProductId(productId: string): string {
    return productId.toUpperCase();
  }

  /* Gets the image url for the scooters from the backend */
  getImageUrl(fileName: string): string {
    return `http://localhost:8000/img/products/${fileName}.jpg`;
  }

  /* Get the price for each scooter */
  getPriceByProductId(name: String): number {
    const product = this.products.find(p => p.name === name);
    return product ? product.price_per_hour : 0;
  }

  // Method to calculate the range of the scooter
  calcRange(battery: number, max_reach: number): number {
    return Math.ceil(battery / 100 * max_reach);
  }

  /* Get the range for each scooter */
  getRangeByProductId(name: String, battery: number): number{
    const product = this.products.find(p => p.name === name);
    if (product) {
      return this.calcRange(battery, product.max_reach);
    } else {
      return 0; // Error no range provided
    }
  }

  /* allows fault tolerance for Input string */
  levenshteinFilterScooters(): void {
    const threshold = 2; // threshold for simularity
    const len = this.searchTerm.length;
    this.levenshteinFilteredScooters= this.mapScooters.filter(scooter => 
      Levenshtein.levenshteinMethod(scooter.product_id.substring(0, len).toLowerCase(), this.searchTerm.toLowerCase()) <= threshold
    );
    console.log(this.filterScooters.length);
  }


  /* Converts the distances */
  convertDistanceUnits(value: number, unit: string): string {
    return UnitConverter.convertDistanceUnits(value, unit);
  }

  /* Convert the currencies */
  convertCurrencyUnits(value: number, unit: string): string {
    return UnitConverter.convertCurrencyUnits(value, unit);
  }

  jumpToPosition(id: string | null): void {
    if (!id) {
      return;
    }
    const element = this.elementsRef.find(el => el.nativeElement.id === id);
    if (element) {
      /* Scroll into view with a timeout of 0ms to ensure that the scroll is done after the view is rendered */
      setTimeout(() => {
        element.nativeElement.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 0);
    }
  }
}