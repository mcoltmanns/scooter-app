export interface CheckoutObject {
  duration?: number | string;
  paymentMethodId?: number | string;
  scooterId?: number | string;
}

export interface ReservationObject {
  scooterId: number | string;
}
