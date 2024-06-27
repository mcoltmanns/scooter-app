// Data structure for scooter information.
export interface Scooter {
    id: number, 
    product_id: string, //corresponds to name of the product, not its id
    battery: number,
    coordinates_lat: number,
    coordinates_lng: number,
    active_rental_id: number,
    reservation_id: number
}