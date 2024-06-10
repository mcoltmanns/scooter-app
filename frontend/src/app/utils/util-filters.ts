import { Rental } from 'src/app/models/rental';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';

//TODO     connect to pages and  test
//(as of 10.06 11:33  UNTESTED)   


/**
 * This class has all filters, both for map/list and rentals/booking
 */
export class Filters {
    /**
     * Filters the given list of rentals wrt to a date frame given by lower and upper
     * @param startAfter is the lower bound date of the filter
     * @param endBefore is the upper bound date of the filter
     * @param rentals list of scooters that where booked by the user in total
     * @returns list of scooters that where booked in the given date frame
     */
    static filterDate(startAfter: Date, endBefore: Date, rentals: Rental[]) : Rental[] {
        const filteredRentals: Rental[] = [];
        rentals.forEach(rental => {
            if (!( new Date(rental.createdAt) <= startAfter) && !( new Date(rental.endedAt) >= endBefore)){
                filteredRentals.push(rental);
            }      
        });
        return filteredRentals;
    }

    /**
     * Filters the given scooter list by the price parameter wrt to lower and upper
     * @param minPrice lower bound for cost 
     * @param maxPrice upper bound for cost
     * @param scooters list of scooters in List/map
     * @param products list of products corresponding to scooters in list/map
     * @returns 
     */
    static filterPrice(minPrice: number, maxPrice: number, scooters: Scooter[], products: Product[]) : Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            const cost = products.find(p => p.id === Number (scooter.product_id))?.price_per_hour;
            if ( (!(cost === undefined))&&(cost >= minPrice) && (cost <= maxPrice)){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }

    /**
     * Filters the given scooter list by the remaining range of the scooter
     * @param minRange lower bound for the range of the scooters
     * @param maxRange upper bound for teh range of the scooters
     * @param scooters list of scooters to be filtered 
     * @param products list of products corresponding to the list of scooters that is to be filtered
     * @returns list of scooters that fit the requirements of the given range 
     */
    static filterRange(minRange: number, maxRange: number, scooters: Scooter[], products: Product[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            const maxReach = products.find(p => p.id === Number (scooter.product_id))?.max_reach;
            if ( (!(maxReach === undefined)) && (Math.ceil(scooter.battery / 100 * maxReach) >= minRange) && (Math.ceil(scooter.battery / 100 * maxReach) <= maxRange)){
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
    static filterBattery(minBattery: number, maxBattery: number, scooters: Scooter[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            if( (scooter.battery >= minBattery) && (scooter.battery <= maxBattery)){
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
    static filterSpeed(minSpeed: number, maxSpeed: number, scooters: Scooter[], products: Product[]): Scooter[]{
        const filteredScooters: Scooter[] = [];
        scooters.forEach(scooter => {
            const speed = products.find(p => p.id === Number(scooter.product_id))?.max_speed;
            if ( (!(speed === undefined)) && (speed >= minSpeed) && (speed <= maxSpeed)){
                filteredScooters.push(scooter);
            }
        });
        return filteredScooters;
    }
}