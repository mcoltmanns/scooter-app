import { Rental } from 'src/app/models/rental';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { parse, isAfter, isBefore, isEqual } from 'date-fns';


/**
 * This class has all filters, both for map/list and rentals/booking
 */
export class Filters {

//filter for the Booking component --------------------------------------------------------------------------- (WORKING)
    /**
     * Filters the given list of rentals wrt to a date frame given by lower and upper
     * @param startAfter is the lower bound date of the filter
     * @param endBefore is the upper bound date of the filter
     * @param rentals list of scooters that where booked by the user in total
     * @returns list of scooters that where booked in the given date frame
     */
    static filterDate(startAfter: string, endBefore: string, rentals: Rental[]) : Rental[] {
        const filteredRentals: Rental[] = [];
        //if one of the fields was empty use a default value; hardcoding of upper value is risky, but in this case no issue, as the app will
        // not be used beyond this summer
        if(startAfter === '' && endBefore === ''){
            return rentals;
        }
        if(startAfter === ''){
            startAfter = '01-01-2000';
        }
        if(endBefore === ''){
            endBefore = '01-01-10000';
        }
        const begin = this.stringToDate(startAfter);
        const end = this.stringToDate(endBefore);
        //check for each rental, if in the desired range, if yes, add to output
        rentals.forEach(rental => {
            const created = this.stringToDate(this.backendToDate(rental.createdAt));
            const ended = this.stringToDate(this.backendToDate(rental.endedAt));
            //isAfter(1,2) checks if "1 > 2" so to say, isBefore (1,2) checks if "1<2" so to say
            if((isAfter(created, begin) || isEqual(created, begin)) && (isBefore(ended, end) || isEqual(ended, end))){
                filteredRentals.push(rental);
            }
        });
        return filteredRentals;
    }

    //turns a string of the format dd-MM-yyyy into a date
    static stringToDate(input:string): Date{
        return parse(input, 'dd-MM-yyyy', new Date());
    }

    //takes the date from rentals and formats it into the same format as the input
    static backendToDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return day+'-'+month+'-'+year;
    }
//------------------------------------------------------------------------------------------------------------





//"Memory" of the scooter filters ---------------------------------------------------------------------------

//functions to delete the global var's for the scooter filters; var's exist, so there is no reset when switching map/list
private static minPrice = '';
private static maxPrice = '';
private static minRange = '';
private static maxRange = '';
private static minBattery = '';
private static maxBattery = '';
private static minSpeed = '';
private static maxSpeed = '';

/**
 * this function is to update the stored variables when a new filter is set
 * @param minPrice 
 * @param maxPrice 
 * @param minRange 
 * @param maxRange 
 * @param minBty 
 * @param maxBty 
 * @param minSpeed 
 * @param maxSpeed 
 */
static setBounds(minPrice: string, maxPrice: string, minRange: string, maxRange: string, minBty: string, maxBty: string, minSpeed: string, maxSpeed: string):void{
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.minBattery = minBty;
    this.maxBattery = maxBty;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
}

/**
 * this function resets the "memory" variables of the filter to default/empty values
 */
static resetBounds():void{
    this.minPrice = '';
    this.maxPrice = '';
    this.minRange = '';
    this.maxRange = '';
    this.minBattery = '';
    this.maxBattery = '';
    this.minSpeed = '';
    this.maxSpeed = '';
}

/**
 * to reload the previously filtered list of scooters by rebuilding it
 */
private static filteredScooters: Scooter[]=[];
static onReload(scooters: Scooter[], products: Product[]):Scooter[]{
    this.filteredScooters = [];
    this.filteredScooters = this.filterPrice(scooters,products);
    this.filteredScooters = this.filterRange(this.filteredScooters,products);
    this.filteredScooters = this.filterBattery(this.filteredScooters);
    this.filteredScooters = this.filterSpeed(this.filteredScooters,products);
    return this.filteredScooters;
}

//------------------------------------------------------------------------------------------------------------





//Filters for scooter-map and scooter-list -------------------------------------------------------------------

    /**
     * Filters the given scooter list by the price parameter wrt to lower and upper bounds
     * @param scooters list of scooters in List/map
     * @param products list of products corresponding to scooters in list/map
     * @returns 
     */
    static filterPrice(scooters: Scooter[], products: Product[]) : Scooter[]{
        const filteredScooters: Scooter[] = [];
        //default values in case field was left empty
        if(this.minPrice === ''){
            this.minPrice = '0';
        }
        if(this.maxPrice===''){
            this.maxPrice = '10000';
        }
        //check if price per hour of the scooter is in the wanted range, then add to output
        scooters.forEach(scooter => {
            const cost = products.find(p => p.name === scooter.product_id)?.price_per_hour;
            if ( (!(cost === undefined))&&( cost >= Number(this.minPrice)) && ( cost <= Number(this.maxPrice))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }

    /**
     * Filters the given scooter list by the remaining range of the scooter
     * @param scooters list of scooters to be filtered 
     * @param products list of products corresponding to the list of scooters that is to be filtered
     * @returns list of scooters that fit the requirements of the given range 
     */
    static filterRange(scooters: Scooter[], products: Product[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        //default values in case field(s) have been left empty
        if(this.minRange ===''){
            this.minRange = '0';
        }
        if(this.maxRange===''){
            this.maxRange = '10000000';
        }
        //if scooter has a remaining reach in the desired range, then add to output
        scooters.forEach(scooter => {
            const maxReach = products.find(p => p.name === scooter.product_id)?.max_reach;
            if ( (!(maxReach === undefined)) && (Math.ceil(scooter.battery / 100 * maxReach) >= Number (this.minRange)) && (Math.ceil(scooter.battery / 100 * maxReach) <= Number (this.maxRange))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters; 
    }

    /**
     * Filters the given list of scooters by battery "percentage"
     * @param scooters list of scooters to be filtered
     * @returns list of scooters that fit the bill wrt battery percentage
     */
    static filterBattery(scooters: Scooter[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        //default values in case of empty input
        if(this.minBattery ===''){
            this.minBattery = '0';
        }
        if(this.maxBattery ===''){
            this.maxBattery = '100';
        }
        //if battery in range of input add to output
        scooters.forEach(scooter => {
            if( (scooter.battery >= Number (this.minBattery)) && (scooter.battery <= Number (this.maxBattery))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }

    /**
     * Filters the given list of scooters by maximal speed
     * @param scooters list of scooters that is to be filtered
     * @param products list of products corresponding to the list of scooters
     * @returns list of scooters that have a speed in the desired interval
     */
    static filterSpeed(scooters: Scooter[], products: Product[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        //default values in case fields are empty
        if(this.minSpeed ===''){
            this.minSpeed = '0';
        }
        if(this.maxSpeed ===''){
            this.maxSpeed = '10000000';
        }
        //if scooters speed in the range of input values, add to output
        scooters.forEach(scooter => {
            const speed = products.find(p => p.name === scooter.product_id)?.max_speed;
            if ( (!(speed === undefined)) && (speed >= Number (this.minSpeed)) && (speed <= Number (this.maxSpeed))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }
}