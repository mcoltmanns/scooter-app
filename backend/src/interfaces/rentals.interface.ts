export interface ActiveRentalObject {
  id: number;
  nextActionTime: Date;
  renew: boolean;
  price_per_hour: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  scooterId: number;
  paymentMethodId: number;
}

export interface PastRentalObject {
  id: number;
  endedAt: Date;
  total_price: number;
  createdAt: Date;
  userId: number;
  scooterId: number;
  paymentMethodId: number;
}
