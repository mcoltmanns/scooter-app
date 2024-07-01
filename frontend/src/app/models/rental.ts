// TODO: Deprecated
export interface Rental {
    id: number;
    endedAt: string;
    createdAt: string;
    user_id: number;
    scooter_id: number;
}

export interface ActiveRental {
    id: number;
    nextActionTime: Date;
    renew: boolean;
    price_per_hour: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
    scooterId: number;
    paymentMethodId: number;
}

export interface PastRental {
    id: number;
    total_price: string;
    createdAt: string;
    endedAt: string;
    userId: number;
    scooterId: number;
    paymentMethodId: number;
}

/* interface with products + scooterId for all bookings */
export interface ProductWithScooterId {
    id: number;
    name: string;
    brand: string;
    image: string;
    max_reach: number;
    max_speed: number;
    price_per_hour: number;
    description_html: string;
    scooterId: number;  
}