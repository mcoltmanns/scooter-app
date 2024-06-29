/**
 * Converts the distance, speed and currency
 */
export class UnitConverter {
    static convertSpeed(value: number, fromUnit: string, toUnit: string): number {
      if (fromUnit === toUnit) return value;
  
      // Speed units: km/h to mph and vice versa
      if (fromUnit === 'km/h' && toUnit === 'mp/h') {
        return value * 0.621371;
      } 
      else if (fromUnit === 'mp/h' && toUnit === 'km/h') {
        return value / 0.621371;
      }
  
      throw new Error(`Unsupported conversion from ${fromUnit} to ${toUnit}`);
    }
  
    static convertDistance(value: number, fromUnit: string, toUnit: string): number {
      if (fromUnit === toUnit) return value;
  
      // Distance: km to miles and vice versa
      if (fromUnit === 'km' && toUnit === 'mi') {
        return value * 0.621371;
      } 
      else if (fromUnit === 'mi' && toUnit === 'km') {
        return value / 0.621371;
      }
  
      throw new Error(`Unsupported conversion from ${fromUnit} to ${toUnit}`);
    }
  
    /* Converts the currency */
    static convertCurrency(value: number, fromCurrency: string, toCurrency: string): number {
        const exchangeRate = 1.09;
        if (fromCurrency === toCurrency){
            return value * exchangeRate;
        }
        return value;
    }

    /* Converts the distances */
    static convertDistanceUnits(value: number |undefined, unit: string | undefined): string {
      if(unit === undefined || value === undefined){
        console.error('Distance unit converting went wrong!');
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

    /* Convert the currencies per hour value */
    static convertCurrencyPerHourUnits(value: number, unit: string|undefined): string {
      if(unit === undefined){
        console.error('Currency unit converting went wrong!');
        return 'error';
      }
      let str = '';
      if(unit === '$'){
        value = UnitConverter.convertCurrency(value, unit, '$');
        str = value.toFixed(2) + ' $/H'; // toFixed(2) only shows the last two decimal place
      }
      else{
        str = value.toString() + ' €/H';
      }
      return str;
    }

    /* Converts single currency value */
    static convertCurrencyUnits(value: string | undefined, unit: string): string {
      if (value === undefined){
        console.error('Currency unit converting went wrong!');
        return 'error';
      }
      let intValue = parseInt(value);
      let str = '';
      if(unit === '$'){
        intValue = UnitConverter.convertCurrency(intValue, unit, '$');
        str = intValue.toFixed(2) + ' $'; // toFixed(2) only shows the last two decimal place
      }
      else{
        str = Number(value).toFixed(2).toString() + ' €';
      }
      return str;
    }

    /* Converts a speed units  */
    static convertSpeedUnits(value: number|undefined, unit: string|undefined): string{
      if(unit === undefined || value === undefined){
        console.error('Speed unit converting went wrong!');
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
}