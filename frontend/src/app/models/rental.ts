export interface Rental {
    id: number;
    endedAt: string;
    createdAt: string;
    user_id: number;
    scooter_id: number;
}

export interface RentalWithScooterId{
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