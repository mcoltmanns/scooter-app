/**
 * Converts speed
 */
export class UnitConverter {
    /* Converts the currency */
    static convertCurrency(value: number, fromCurrency: string, toCurrency: string): number {
        const exchangeRate = 1.09;
        if (fromCurrency === toCurrency){
            return value * exchangeRate;
        }
        return value;
    }

    /* Convert the currencies */
    static convertCurrencyUnits(value: number, unit: string): string {
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
}