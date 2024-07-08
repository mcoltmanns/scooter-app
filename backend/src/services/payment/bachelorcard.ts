import { parseString } from 'xml2js';
import post from 'axios';
import { BachelorCardData, PaymentService } from '../../interfaces/payment-service.interface';
import { errorMessages } from '../../static-data/error-messages';

const merchantName = 'ScooterApp';

const staticImplements = <T>() => <U extends T>(constructor: U): U => constructor;

@staticImplements<PaymentService>()
class BachelorCard {
    private constructor() {} // Private constructor prevents instantiation

    private static processResponse(data: string, fieldWanted: string): Promise<{status: number, message: string}> {
        return new Promise((resolve) => {
          parseString(data, (err, result) => {
            if(err) resolve({ status: 500, message: `xml parse error: ${err}`});
            const interesting = result?.transactionResponse?.response?.[0]; // get the interesting bit of the data
            if (!interesting) resolve({ status: 500, message: 'Unexpected response structure' });
            const status = interesting.status?.[0]?.replace(/\D/g, ''); // get a numerical-only status string
            let message = '';
            if(interesting.hasOwnProperty('transaction-data') && interesting['transaction-data'][0]?.hasOwnProperty(fieldWanted)) message = interesting['transaction-data'][0][fieldWanted][0]; // is there transaction data? if so, set the message to the field in there that we want
            else if(interesting.hasOwnProperty('error') && interesting['error'][0]?.hasOwnProperty(fieldWanted))  message = interesting['error'][0][fieldWanted][0]; // is there an error? if so, set the message to that
            resolve({status: parseInt(status), message: message});
          });
        });
    }

    public static getCountryCode(cardNumber: string): Promise<{status: number, message: string}> {
        const data = `<?xml version="1.0" encoding="utf-8"?><transactionRequest type="country"><version>1.0.0</version><merchantInfo><name>${merchantName}</name></merchantInfo><cardNumber>${cardNumber}</cardNumber></transactionRequest>`;
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/bachelorcard', { headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': data.length,
                },
                data: data,
                method: 'POST'
            })
            .then((response) => {
                resolve(this.processResponse(response.data, 'country'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(error.response.data, 'error'));
            });
        });
    }

    public static initTransaction(dataObject: BachelorCardData, amount: number): Promise<{status: number, message: string}> {
      const { cardNumber, name, securityCode, expirationDate } = dataObject;

      const data = `<?xml version="1.0" encoding="utf-8"?>
        <transactionRequest type="validate">
        <version>1.0.0</version>
        <merchantInfo>
            <name>${merchantName}</name>
        </merchantInfo>
        <payment type="bachelorcard">
            <paymentDetails>
                <cardNumber>${cardNumber}</cardNumber>
                <name>${name}</name>
                <securityCode>${securityCode}</securityCode>
                <expirationDate>${expirationDate}</expirationDate>
            </paymentDetails>
            <dueDetails>
                <amount>${amount}</amount>
                <currency>EUR</currency>
                <country>de</country>
            </dueDetails>
        </payment>
        </transactionRequest>
        `;
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/bachelorcard', { headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': data.length,
                },
                data: data,
                method: 'POST'
            })
            .then((response) => {
                resolve(this.processResponse(response.data, 'transactionCode'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(error.response.data, 'error'));
            });
        });
    }

    public static commitTransaction(token: string): Promise<{status: number, message: string}> {
        const data = `<?xml version="1.0" encoding="utf-8"?>
        <transactionRequest type="pay">
        <version>1.0.0</version>
        <merchantInfo>
            <name>${merchantName}</name>
        </merchantInfo>
        <transactionCode>${token}</transactionCode>
        </transactionRequest>
        `;
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/bachelorcard', { headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': data.length,
                },
                data: data,
                method: 'POST'
            })
            .then((response) => {
                resolve(this.processResponse(response.data, 'status'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(error.response.data, 'error'));
            });
        });
    }

    public static rollbackTransaction(token: string): Promise<{status: number, message: string}> {
        const data = `<?xml version="1.0" encoding="utf-8"?>
        <transactionRequest type="cancellation">
        <version>1.0.0</version>
        <merchantInfo>
            <name>${merchantName}</name>
        </merchantInfo>
        <transactionCode>${token}</transactionCode>
        </transactionRequest>
        `;
        return new Promise((resolve, reject) => {
            post('https://pass.hci.uni-konstanz.de/bachelorcard', { headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': data.length,
                },
                data: data,
                method: 'POST'
            })
            .then((response) => {
                resolve(this.processResponse(response.data, 'status'));
            })
            .catch((error) => {
                if (!error.response || !error.response.data) {
                  return reject(new Error(errorMessages.NETWORK_ERROR_OR_SERVICE_UNAVAILABLE));
                }
                resolve(this.processResponse(error.response.data, 'error'));
            });
        });
    }
}

export default BachelorCard;
