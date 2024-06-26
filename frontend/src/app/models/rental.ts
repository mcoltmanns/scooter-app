export interface ActiveRental {
    id: number;
    nextActionTime: Date;
    renew: boolean;
    price_per_hour: number;
    createdAt: string;
    updatedAt: string;
    userId: number;
    scooterId: number;
    paymentMethodId: number;
}

export interface PastRental {
    id: number;
    total_price: number;
    createdAt: string;
    endedAt: string;
    userId: number;
    scooterId: number;
    paymentMethodId: number;
}