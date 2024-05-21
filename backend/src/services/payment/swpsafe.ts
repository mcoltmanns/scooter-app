import { parse } from 'csv-parse';
import https from 'https';

abstract class SwpSafe {
    private static async performRequestWithOptions(options: {hostname: string, port: number, path: string, method: string}): Promise<{status: number, message: string}> {
        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                let data = '';

                res.on('data', d => { // when we recieve data, add it to the chunk to be parsed
                    data += d;
                });

                res.on('end', () => { // when the request finishes, parse the data
                    parse(data.toString(), { delimiter: ',', skip_empty_lines: true}, (err, records) => {
                        if(err) {
                            reject(new Error(`Could not parse csv: ${err}`)); // if things are bad, reject the promise
                        }
                        resolve({status: records[1][0], message: records[1][1]}); // resolve if the request was ok
                    });
                });
            });

            req.on('error', e => {
                reject(new Error(`Could not make request: ${e}`)); // if things are bad, reject the promise
            });
    
            req.end();
        });
    }

    public static async getCountryCode(accountId: string): Promise<{status: number, message: string}> {
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443,
            path: `/swpsafe/country/code/${accountId}`,
            method: 'GET'
        };
        
       return this.performRequestWithOptions(options);
    }

    public static getTransaction(accountId: string, amount: number): Promise<{status: number, message: string}> {
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443,
            path: `/swpsafe/check/code/${accountId}/amount/${amount}`,
            method: 'GET'
        };

        return this.performRequestWithOptions(options);
    }

    public static commitTransaction(token: string): Promise<{status: number, message: string}> {
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443,
            path: `/swpsafe/use/${token}`,
            method: 'GET'
        };

        return this.performRequestWithOptions(options);
    }

    public static rollbackTransaction(token: string): Promise<{status: number, message: string}> {
        const options = {
            hostname: 'pass.hci.uni-konstanz.de',
            port: 443,
            path: `/swpsafe/return/${token}`,
            method: 'GET'
        };

        return this.performRequestWithOptions(options);
    }
}

export default SwpSafe;