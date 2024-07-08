interface Payload {
  [key: string]: string | number | boolean | null | undefined;
}


/**
 * Allows to have errors with a payload.
 * 
 * @param message The error message such as with the usual Error class.
 * @param payload An object with key-value pairs that can be used to provide additional information.
 * @type Payload: { [key: string]: string }
 */
export class CustomError extends Error {
  public payload: Payload;

  constructor(message: string, payload: Payload) {
    super(message);
    this.payload = payload;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}