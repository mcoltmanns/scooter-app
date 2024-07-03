// table type definitions for the mock database

export interface mUsersAuths {
    id: number,
    email: string,
    password: string
};

export interface mUsersDatas {
    id: number,
    name: string,
    street: string,
    houseNumber: string,
    zipCode: number,
    city: string
};

export interface mUsersSessions {
    id: number,
    expires: Date,
    usersAuthId: number
}