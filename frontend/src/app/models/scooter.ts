// Data structure for scooter information.
export interface Scooter {
    id: number, 
    product_id: string,
    battery: number,
    coordinates_lat: number,
    coordinates_lng: number,
    active_rental_id: number,
    reservation_id: number
}