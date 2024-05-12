/**
 * rental management service
 * given a scooter, check if it's rented
 * given a user:
 * - initiate a rental with that user and the first availabe instance of the model queried (only if the user isn't already renting)
 * - end a rental
 */

abstract class RentalManager {
    /**
     * check if a scooter is currently being rented
     * 
     * @param scooterId scooter id to check status for
     * @returns         true if scooter is being rented, false if not, null on failure
     */
    public static async isRented(scooterId: number): Promise<boolean> {
        return true;
    }
}