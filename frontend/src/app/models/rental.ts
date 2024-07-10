export interface ActiveRental {
    id: number;
    nextActionTime: Date;
    renew: boolean;
    price_per_hour: string;
    paymentOffset: string;
    createdAt: string;
    userId: number;
    scooterId: number;
}

export interface PastRental {
    id: number;
    price_per_hour: string;
    total_price: string;
    paymentOffset: string;
    createdAt: string;
    endedAt: string;
    userId: number;
    scooterId: number;
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