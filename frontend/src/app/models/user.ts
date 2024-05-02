export type GetUserRes = {
    code: number,
    user: User
};

export type User = {
    name: string,
    street: string,
    houseNumber: string,
    zipCode: string,
    city: string,
    email: string,
}