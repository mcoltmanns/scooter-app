import post from 'axios';
import { HciPalData, PaymentService } from '../../interfaces/payment-service.interface';
import { errorMessages } from '../../static-data/error-messages';

const staticImplements = <T>() => <U extends T>(constructor: U): U => constructor;

@staticImplements<PaymentService>()
class HciPal {
    private constructor() {} // Private constructor prevents instantiation

    private static processResponse(data: string, fieldWanted: string): {status: number, message: string} {
        const jsonData = JSON.parse(data);
        if(jsonData.success) {
            return {status: 200, message: fieldWanted === '' ? '' : jsonData[fieldWanted]};
        }
        return {status: 400, message: jsonData.error};
    }

    public static getCountryCode(accountName: string): Promise<{status: number, message: string}> {
        const data = { accountName: accountName };
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/hcipal/country', {data: data, method: 'POST'})
            .then((response) => {
                resolve(this.processResponse(JSON.stringify(response.data), 'country'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(JSON.stringify(error.response.data), 'error'));
            });
        });
    }

    public static initTransaction(dataObject: HciPalData, amount: number): Promise<{status: number, message: string}> {
        const data = { accountName: dataObject.accountName, accountPassword: dataObject.accountPassword, amount: amount };
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/hcipal/check', {data: data, method: 'POST'})
            .then((response) => {
                resolve(this.processResponse(JSON.stringify(response.data), 'token'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(JSON.stringify(error.response.data), 'error'));
            });
        });
    }

    public static commitTransaction(token: string): Promise<{status: number, message: string}> {
        const data = {token: token};
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/hcipal/payment', {data: data, method: 'POST'})
            .then((response) => {
                resolve(this.processResponse(JSON.stringify(response.data), ''));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(JSON.stringify(error.response.data), 'error'));
            });
        });
    }

    public static rollbackTransaction(token: string): Promise<{status: number, message: string}> {
        const data = {token: token};
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/hcipal/payback', {data: data, method: 'POST'})
            .then((response) => {
                resolve(this.processResponse(JSON.stringify(response.data), ''));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(JSON.stringify(error.response.data), 'error'));
            });
        });
    }
}

export default HciPal;