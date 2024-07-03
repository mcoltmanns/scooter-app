import { parse } from 'csv-parse';
import get from 'axios';
import { SwpSafeData } from '../../interfaces/payment-service.interface';

abstract class SwpSafe {
    private static processResponse(data: string, fieldWanted: string): Promise<{ status: number, message: string }> {
        return new Promise((resolve) => {
            console.log(data);
            parse(data, {delimiter: ',', skip_empty_lines: true}, (err, records) => {
                if(err) resolve({status: 500, message: `csv parse error: ${err}`});
                resolve({status: parseInt(records[1][0]), message: records[1][records[0].indexOf(records[1][0] === '200' ? fieldWanted : 'errormessage')]});
            });
        });
    }

    public static getCountryCode(accountId: string): Promise<{ status: number; message: string; }> {
        return new Promise((resolve, reject) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/country/code/${encodeURIComponent(accountId)}`)
            .then((response) => {
                resolve(this.processResponse(response.data, 'country'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error('NETWORK_ERROR_OR_SERVICE_UNAVAILABLE'));
                }
                resolve(this.processResponse(error.response.data, 'errormessage'));
            });
        });
    }

    public static initTransaction(dataObject: SwpSafeData, amount: number): Promise<{status: number, message: string}> {
        const { swpCode } = dataObject;
        return new Promise((resolve, reject) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/check/code/${encodeURIComponent(swpCode)}/amount/${encodeURIComponent(amount.toString())}`)
            .then((response) => {
                resolve(this.processResponse(response.data, 'token'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error('NETWORK_ERROR_OR_SERVICE_UNAVAILABLE'));
                }
                resolve(this.processResponse(error.response.data, 'errormessage'));
            });
        });
    }

    public static commitTransaction(token: string): Promise<{status: number, message: string}> {
        return new Promise((resolve, reject) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/use/${encodeURIComponent(token)}`)
            .then((response) => {
                resolve(this.processResponse(response.data, 'errormessage'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error('NETWORK_ERROR_OR_SERVICE_UNAVAILABLE'));
                }
                resolve(this.processResponse(error.response.data, 'errormessage'));
            });
        });
    }

    public static rollbackTransaction(token: string): Promise<{status: number, message: string}> {
        return new Promise((resolve, reject) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/return/${encodeURIComponent(token)}`)
            .then((response) => {
                resolve(this.processResponse(response.data, 'errormessage'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error('NETWORK_ERROR_OR_SERVICE_UNAVAILABLE'));
                }
                resolve(this.processResponse(error.response.data, 'errormessage'));
            });
        });
    }
}

export default SwpSafe;