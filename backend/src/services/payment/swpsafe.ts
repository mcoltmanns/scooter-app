import { parse } from 'csv-parse';
import get from 'axios';

abstract class SwpSafe {
    public static async getCountryCode(accountId: string): Promise<{ status: number; message: string; }> {
        return new Promise((resolve) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/country/code/${encodeURIComponent(accountId)}`)
                .then((response) => {
                    parse(response.data, {delimiter: ',', skip_empty_lines: true}, (err, records) => {
                        if(err) {
                            resolve({ status: 500, message: 'could not parse csv' });
                        }
                        resolve({status: parseInt(records[1][0]), message: records[1][0] === '200' ? records[1][3] : records[1][1]});
                    });
                })
                .catch((error) => {
                    resolve({status: 500, message: `could not get country code: ${error}`});
                });
        });
    }

    public static getTransaction(accountId: string, amount: number): Promise<{status: number, message: string}> {
        return new Promise((resolve) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/check/code/${encodeURIComponent(accountId)}/amount/${encodeURIComponent(amount.toString())}`)
            .then((response) => {
                parse(response.data, {delimiter: ',', skip_empty_lines: true}, (err, records) => {
                    if(err) {
                        resolve({ status: 500, message: 'could not parse csv' });
                    }
                    resolve({status: parseInt(records[1][0]), message: records[1][0] === '200' ? records[1][2] : records[1][1]});
                });
            })
            .catch((error) => {
                resolve({status: 500, message: `could not get transaction: ${error}`});
            });
        });
    }

    public static commitTransaction(token: string): Promise<{status: number, message: string}> {
        return new Promise((resolve) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/use/${encodeURIComponent(token)}`)
            .then((response) => {
                parse(response.data, {delimiter: ',', skip_empty_lines: true}, (err, records) => {
                    if(err) {
                        resolve({ status: 500, message: 'could not parse csv' });
                    }
                    resolve({status: parseInt(records[1][0]), message: records[1][1]});
                });
            })
            .catch((error) => {
                resolve({status: 500, message: `could not commit transaction: ${error}`});
            });
        });
    }

    public static rollbackTransaction(token: string): Promise<{status: number, message: string}> {
        return new Promise((resolve) => {
            get(`https://pass.hci.uni-konstanz.de/swpsafe/use/${encodeURIComponent(token)}`)
            .then((response) => {
                parse(response.data, {delimiter: ',', skip_empty_lines: true}, (err, records) => {
                    if(err) {
                        resolve({ status: 500, message: 'could not parse csv' });
                    }
                    resolve({status: parseInt(records[1][0]), message: records[1][1]});
                });
            })
            .catch((error) => {
                resolve({status: 500, message: `could not roll back transaction: ${error}`});
            });
        });
    }
}

export default SwpSafe;