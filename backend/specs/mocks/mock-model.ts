import { CreateOptions, DestroyOptions, FindOptions, Model, ModelCtor, SaveOptions } from 'sequelize';
import { Mock } from 'jest-mock';
import { jest } from '@jest/globals';

export type KeyStringMap = {[key: string]: string}; // indexable key: string map type

// mockup for a database table
// provides findOne, findAll, and create
export class MockModel {
    public data: Model[]; // holds the mock data for this model's table
    public initialData: Model[]; // remembers state of the data on initialization

    // various mocks for this model
    public findOneMock: Mock<(findOpts?: FindOptions<any> | undefined) => Model | null>;
    public findAllMock: Mock<(findOpts?: FindOptions<any> | undefined) => Model[]>;
    public createMock: Mock<(data: unknown, createOpts?: CreateOptions<any> | undefined) => { getDataValue: (key: string) => string; }>;
    public destroyMock: Mock<(destroyOpts?: DestroyOptions<any> | undefined) => number>;
    public saveMock: Mock<(saveOpts?: SaveOptions<any> | undefined) => void>;

    // reference to a mock for the most recent save call on this model
    public mostRecentSaveCall: Mock | undefined;

    // the real model this table is mocking
    private realModel: ModelCtor<Model>;

    constructor(realModel: ModelCtor<Model>, mockData?: KeyStringMap[]) {
        this.realModel = realModel;
        this.data = mockData === undefined ? [] : mockData.map(v => realModel.build(v));

        this.initialData = []; // copy into initial data
        this.data.forEach(e => this.initialData.push(Object.assign({}, e)));

        // initialize the mocks
        this.findOneMock = (realModel as any).findOne = jest.fn(((findOpts?: FindOptions) => this.findOne(findOpts)));
        this.findAllMock = (realModel as any).findAll = jest.fn(((findOpts?: FindOptions) => this.findAll(findOpts)));
        this.createMock = (realModel as any).create = jest.fn(((data, createOpts?: CreateOptions) => this.create(data as KeyStringMap, createOpts)));
        this.destroyMock = (realModel as any).destroy = jest.fn(((destroyOpts?: DestroyOptions) => this.destroy(destroyOpts)));
    }

    // check if 2 objects are shallow equal (have same fields and those fields have same properties)
    // found https://stackoverflow.com/questions/22266826/how-can-i-do-a-shallow-comparison-of-the-properties-of-two-objects-with-javascri
    /*private shallowCompare(obj1: { [x: string]: any; }, obj2: { [x: string]: any; hasOwnProperty?: any; }): boolean {
        return Object.keys(obj1).length === Object.keys(obj2).length &&
            Object.keys(obj1).every(key => 
                obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
            );
    }*/

    // currently only supports where
    public findOne(opt?: FindOptions): Model | null {
        if(!opt) return this.data[0]; // no options? return first element
        const keys = Object.keys(opt.where!); // get keys of where clause
        const vals = Object.values(opt.where!);
        const out = this.data.find((entry) => { // find the first entry where
            let res = true;
            keys.forEach((key, i) => { // each key in the entry matches each key in the where
                res = res && entry.getDataValue(key) === vals[i];
            });
            return res;
        });
        return out === undefined ? null : out;
    }

    // currently only supports where
    public findAll(opt?: FindOptions): Model[] {
        if(!opt) return this.data;
        const keys = Object.keys(opt.where!);
        const vals = Object.values(opt.where!);
        return this.data.filter((entry) => {
            let res = true;
            keys.forEach((key, i) => {
                res = res && entry.getDataValue(key) === vals[i];
            });
            return res;
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public create(data: KeyStringMap, opt?: CreateOptions): Model {
        //console.log(data);
        const toAdd: KeyStringMap = structuredClone(data); // remember to copy your objects! not copying here causes some really funky and hard to find bugs
        if(!toAdd.id) toAdd.id = (this.data.length).toString(); // not really an optimal solution for assigning ids but it works ok
        const out = this.realModel.build(toAdd);
        this.data.push(out); // too easy to end up with pkey collisions here. but should be ok for testing
        this.mostRecentSaveCall = (out.save as any) = jest.fn(); // mock save call to this specific instance
        return out;
    }

    public destroy(opt?: DestroyOptions): number {
        if(!opt) return 0;
        const keys = Object.keys(opt.where!);
        const vals = Object.values(opt.where!);
        let count = 0;
        this.data = this.data.filter((entry) => {
            let res = true;
            keys.forEach((key, i) => {
                res = res && entry.getDataValue(key) === vals[i];
            });
            if(!res) count++;
            return !res; // filter entries that do not match opt (aka delete those that match opt)
        });
        return count;
    }
}