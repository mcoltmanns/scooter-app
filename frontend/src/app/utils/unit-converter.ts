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
}