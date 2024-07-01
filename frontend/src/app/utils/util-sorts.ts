import { Scooter } from '../models/scooter';
import { Product } from '../models/product';

/**
 * This class provides the sort functionalities for the scooter list
 */
export class Sorts {
    //Variables for the sorting-------------------- memory variables for previous filtering
  //variables that say what is to be filtered by
  private static price = false;
  private static range = false;
  private static bty = false;
  private static speed = false;
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
    } else{
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
}