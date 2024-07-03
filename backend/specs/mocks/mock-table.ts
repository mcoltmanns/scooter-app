import { CreateOptions, FindOptions } from 'sequelize';

export type dbEntryType = {[key: string]: string};

// mockup for a database table
// provides findOne, findAll, and create
export class MockTable {
    public data: dbEntryType[];

    constructor(mockData: dbEntryType[]) {
        this.data = mockData;
    }

    // currently only supports where
    public findOne(opt?: FindOptions): dbEntryType | null {
        if(!opt) return this.data[0]; // no options? return first element
        const keys = Object.keys(opt.where!); // get keys of where clause
        const vals = Object.values(opt.where!);
        const out = this.data.find((entry) => { // find the first entry where
            let res = true;
            keys.forEach(key => { // each key in the entry matches each key in the where
                const i = keys.indexOf(key); // bad form, blah blah blah...
                res = res && entry[key] === vals[i];
            });
            return res;
        });
        return out === undefined ? null : out;
    }

    // currently only supports where
    public findAll(opt?: FindOptions): dbEntryType[] {
        if(!opt) return this.data;
        const keys = Object.keys(opt.where!);
        const vals = Object.values(opt.where!);
        return this.data.filter((entry) => {
            let res = true;
            keys.forEach(key => {
                const i = keys.indexOf(key); // bad form, blah blah blah...
                res = res && entry[key] === vals[i];
            });
        });
    }

    public create(data: dbEntryType, opt?: CreateOptions): { getDataValue: (key: string) => string } {
        data.id = (this.data.length).toString(); // not really an optimal solution for assigning ids but it works ok
        this.data.push(data); // too easy to end up with pkey collisions here. but should be ok for testing
        return {
            getDataValue: (key: string): string => data[key]
        };
    }
}