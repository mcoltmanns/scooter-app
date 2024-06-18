import { Rental } from 'src/app/models/rental';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { parse, isAfter, isBefore, isEqual } from 'date-fns';


/**
 * This class has all filters, both for map/list and rentals/booking
 */
export class Filters {

//filter for the Booking component ---------------------------------------------------------------------------
    /**
     * Filters the given list of rentals wrt to a date frame given by lower and upper
     * @param startAfter is the lower bound date of the filter
     * @param endBefore is the upper bound date of the filter
     * @param rentals list of scooters that where booked by the user in total
     * @returns list of scooters that where booked in the given date frame
     */
    static filterDate(startAfter: string, endBefore: string, rentals: Rental[]) : Rental[] {
        const filteredRentals: Rental[] = [];
        if(startAfter === ''){
            startAfter = '01-01-2000';
        }
        if(endBefore === ''){
            endBefore = '01-01-3000';
        }
        const begin = this.stringToDate(startAfter);
        const end = this.stringToDate(endBefore);
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

    static stringToDate(input:string): Date{
        return parse(input, 'dd-MM-yyyy', new Date());
    }

    static backendToDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return day+'-'+month+'-'+year;
    }
//------------------------------------------------------------------------------------------------------------




//Filters for scooter-map and scooter-list -------------------------------------------------------------------

    /**
     * Filters the given scooter list by the price parameter wrt to lower and upper
     * @param minPrice lower bound for cost 
     * @param maxPrice upper bound for cost
     * @param scooters list of scooters in List/map
     * @param products list of products corresponding to scooters in list/map
     * @returns 
     */
    static filterPrice(minPrice: string, maxPrice: string, scooters: Scooter[], products: Product[]) : Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            const cost = products.find(p => String (p.id) === scooter.product_id)?.price_per_hour;
            if ( (!(cost === undefined))&&( cost >= Number(minPrice)) && ( cost <= Number(maxPrice))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }

    /**
     * Filters the given scooter list by the remaining range of the scooter
     * @param minRange lower bound for the range of the scooters
     * @param maxRange upper bound for the range of the scooters
     * @param scooters list of scooters to be filtered 
     * @param products list of products corresponding to the list of scooters that is to be filtered
     * @returns list of scooters that fit the requirements of the given range 
     */
    static filterRange(minRange: string, maxRange: string, scooters: Scooter[], products: Product[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            const maxReach = products.find(p => p.id === Number (scooter.product_id))?.max_reach;
            if ( (!(maxReach === undefined)) && (Math.ceil(scooter.battery / 100 * maxReach) >= Number (minRange)) && (Math.ceil(scooter.battery / 100 * maxReach) <= Number (maxRange))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters; 
    }

    /**
     * Filters the given list of scooters by battery "percentage"
     * @param minBattery minimal allowed battery percentage
     * @param maxBattery maximal allowed battery percentage
     * @param scooters list of scooters to be filtered
     * @returns list of scooters that fit the bill wrt battery percentage
     */
    static filterBattery(minBattery: string, maxBattery: string, scooters: Scooter[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            if( (scooter.battery >= Number (minBattery)) && (scooter.battery <= Number (maxBattery))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }

    /**
     * Filters the given list of scooters by maximal speed
     * @param minSpeed minimal speed that the scooter is supposed to have
     * @param maxSpeed maximal speed that the scooter is allowed to have
     * @param scooters list of scooters that is to be filtered
     * @param products list of products corresponding to the list of scooters
     * @returns list of scooters that have a speed in the desired interval
     */
    static filterSpeed(minSpeed: string, maxSpeed: string, scooters: Scooter[], products: Product[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            const speed = products.find(p => p.id === Number(scooter.product_id))?.max_speed;
            if ( (!(speed === undefined)) && (speed >= Number (minSpeed)) && (speed <= Number (maxSpeed))){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }
}