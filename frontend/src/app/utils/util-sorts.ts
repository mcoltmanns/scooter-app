import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { PositionService } from './position.service';
import { PastRental } from '../models/rental';
import { Duration, intervalToDuration, isAfter, isBefore } from 'date-fns';

/**
 * This class provides the sort functionalities for the scooter list
 */
export class Sorts {

  //methods for sorting on the bookings page------------------------------
  
  static sortDate(asc:boolean, rentals: PastRental[]): PastRental[] {
    rentals = rentals.sort((a,b) => {
      const dateA = new Date (a.createdAt);
      const dateB = new Date (b.createdAt);
      if(asc){//compate ascending
        if(isBefore(dateA, dateB)){
          return -1;
        } else if(isAfter(dateA, dateB)){
          return 1;
        }
        return a.id - b.id; //default sort is by id
      } else {//compare descending
        if(isBefore(dateA, dateB)){
          return 1;
        } else if(isAfter(dateA, dateB)){
          return -1;
        }
        return a.id-b.id; //default sort is by id
      }
    });
    return rentals;
  }

  static sortDauer(asc:boolean, rentals: PastRental[]): PastRental[] {
    rentals = rentals.sort((a,b) => {
      const dauerA = this.durationToMilliseconds(intervalToDuration({start : new Date (a.createdAt), end : new Date (a.endedAt)}));
      const dauerB = this.durationToMilliseconds(intervalToDuration({start : new Date (b.createdAt), end: new Date (b.endedAt)}));
      if(asc){//compate ascending
        const c = dauerA - dauerB;
        if (c === 0){
          return a.id - b.id; //default sort
        }
        return c;
      } else {//compare descending
        const c = dauerB - dauerA;
        if (c === 0){
          return a.id - b.id; //default sort
        }
        return c;
      }
    });
    return rentals;
  }

  //computes duration in ms to compare using number comparators
  static durationToMilliseconds(duration: Duration): number {
    const { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
    const msYears = years * 365 * 24 * 60 * 60 * 1000; // Approximation
    const msMonths = months * 30 * 24 * 60 * 60 * 1000; // Approximation
    const msDays = days * 24 * 60 * 60 * 1000;
    const msHours = hours * 60 * 60 * 1000;
    const msMinutes = minutes * 60 * 1000;
    const msSeconds = seconds * 1000;
  
    return msYears + msMonths + msDays + msHours + msMinutes + msSeconds;
  }

  static sortPriceR(asc: boolean, rentals: PastRental[]): PastRental[]{
    rentals = rentals.sort((a,b) =>{
      const priceA = Number (a.total_price);
      const priceB = Number (b.total_price);
      if(asc){
        const c = priceA - priceB;
        if (c === 0){
          return a.id-b.id; //default sort is by id 
        }
        return c;
      } else {
        const c = priceB - priceA;
        if (c === 0){
          return a.id - b.id; //default is by id
        }
        return c;
      }
    });
    return rentals;
  }

  
  







    //Variables for the sorting-------------------- memory variables for previous sorting
  //variables that say what is to be filtered by
  private static price = false;
  private static range = false;
  private static bty = false;
  private static speed = false;
  private static dist = false;
  //variable for ascending filtered or not
  private static asc = true;
//---------------------------------------------



    /**
   * checks if we have already applied a filter previously and if so, we apply again
   * 
   * is called after we change the @filteredScooters array due to new filters to maintain the sorting if it existed
   */
  static redoSort(scooters: Scooter[], products: Product[]): Scooter[]{
    //check what the last category filtered by and do the right sorting
    if(this.price){
      return this.sortPrice(this.asc, scooters, products);
    } else if(this.range) {
      return this.sortRange(this.asc, scooters, products);
    } else if(this.bty){
      return this.sortBty(this.asc, scooters);
    } else if(this.speed){
      return this.sortSpeed(this.asc, scooters, products);
    } else if(this.dist){
      return this.sortDist(this.asc, scooters);
    }
    else{
      return scooters;
    }
  }

  /**
   * is called when we press "Zurücksetzen"-Button in the sort-options, this resets all values to default,
   * same value they are initialized with
   */
  static sortCancel(): void{
    //reset to default values
    this.asc= true;
    this.price = false;
    this.range = false;
    this.bty = false;
    this.speed = false;
    this.dist = false;
  }

  /**
   * sorts scooters by price
   * @param asc says whether they are sorted in ascending or descending order
   */
  static sortPrice(asc: boolean, scooters: Scooter[], products: Product[]):Scooter[]{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = true;
    this.range = false;
    this.bty = false;
    this.speed = false;
    this.dist = false;
    scooters = scooters.sort((a,b) => {
      //get the price of the scooters being compared
    const priceA = products.find(p => p.name === a.product_id)?.price_per_hour;
    const priceB = products.find(p => p.name === b.product_id)?.price_per_hour;
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
    return scooters;
  }

  /**
   * sorts scooters by range2
   * @param asc says whether they are sorted in ascending or descending order
   */
  static sortRange(asc: boolean, scooters: Scooter[], products: Product[]):Scooter[]{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = true;
    this.bty = false;
    this.speed = false;
    this.dist = false;
    scooters = scooters.sort((a,b) => {
    let rangeA = products.find(p => p.name === a.product_id)?.max_reach;
    let rangeB = products.find(p => p.name === b.product_id)?.max_reach;
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
    return scooters;
  }

  /**
   * sorts scooter by battery percentage
   * @param asc says whether they are sorted in ascending or descending order
   */
  static sortBty(asc: boolean, scooters: Scooter[]):Scooter[]{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = false;
    this.bty = true;
    this.speed = false;
    this.dist = false;
    scooters = scooters.sort((a,b) => {
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
    return scooters;
  }

  /**
   * sorts scooter by speed
   * @param asc says whether they are sorted in ascending or descending order
   */
  static sortSpeed(asc: boolean, scooters: Scooter[], products: Product[]):Scooter[]{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = false;
    this.bty = false;
    this.speed = true;
    this.dist = false;
    scooters = scooters.sort((a,b) => {
      //get the speed of the scooters being compared
    const speedA = products.find(p => p.name === a.product_id)?.max_speed;
    const speedB = products.find(p => p.name === b.product_id)?.max_speed;
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
    return scooters;
  }

  /**
   * sorts scooters by distance to user
   */
  static sortDist(asc: boolean, scooters: Scooter[]): Scooter[]{
    //set the variables to remember the last used sorting
    this.asc = asc;
    this.price = false;
    this.range = false;
    this.bty = false;
    this.speed = false;
    this.dist = true;
    scooters = scooters.sort( (a,b) => {
      //calculate the distances of a, b respectively
      const distA = PositionService.calculateDist(a.coordinates_lat, a.coordinates_lng);
      const distB = PositionService.calculateDist(b.coordinates_lat, b.coordinates_lng);
      if(asc){//compare ascending
        if(!(distA === -1) && !(distB === -1)){
          const c = distA - distB;
          //if equal sort by id
          if(c === 0){
            return a.id - b.id;
          }
          return c;
        }
      } else {
        if(!(distA === -1) && !(distB === -1)){
          const c = distB - distA;
          //if equal sort by id
          if(c === 0){
            return a.id - b.id;
          }
          return c;
        }
      }
      return 0;
    });
    return scooters;
  }
}