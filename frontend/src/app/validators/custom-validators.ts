import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static inInterval(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      /* Check if the value is a natural number and in the interval [min, max] and also disallow leading zeros */
      if (!/^[1-9]\d*$/.test(value) || !Number.isInteger(+value) || +value < min || +value > max) {
        return { 'inInterval': `Nur Werte zwischen ${min} und ${max}.` };
      }
      return null;
    };
  }
}
