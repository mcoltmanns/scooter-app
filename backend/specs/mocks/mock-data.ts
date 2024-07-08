import { KeyStringMap } from './mock-model';

export const mockUsersAuthData: KeyStringMap[] = [
    {
        id: '0',
        email: 'guy@email.com',
        password: 'HASHED1'
    },
    {
        id: '1',
        email: 'jane@email.com',
        password: 'HASHED2'
    }
];

export const mockUsersDatasData: KeyStringMap[] = [
    {
        id: '0',
        name: 'Guy',
        street: 'Street st.',
        houseNumber: '1b',
        zipCode: '12345',
        city: 'Chicago',
        usersAuthId: '0'
    },
    {
        id: '1',
        name: 'Jane',
        street: 'Avenue blvd.',
        houseNumber: '12a',
        zipCode: '54321',
        city: 'Baltimore',
        usersAuthId: '1'
    }
];

export const mockUserPreferencesData: KeyStringMap[] = [
    {
        id: '0',
        speed: 'km/h',
        distance: 'km',
        currency: '€'
    },
    {
        id: '1',
        speed: 'km/h',
        distance: 'km',
        currency: '€'
    }
];