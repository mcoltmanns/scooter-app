export interface ActiveRentalObject {
  id: number;
  nextActionTime: Date;
  renew: boolean;
  price_per_hour: number;
  total_price: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  scooterId: number;
  paymentMethodId: number;
  paymentToken: string;
}

export interface PastRentalObject {
  id: number;
  endedAt: Date;
  price_per_hour: number;
  total_price: number;
  createdAt: Date;
  userId: number;
  scooterId: number;
  paymentMethodId: number;
}
