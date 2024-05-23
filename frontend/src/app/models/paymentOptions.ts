export interface PaymentOptions{
    type: string;
    info: {
        name: string;
        swpCode?: string;
        accountName?: string;
        accountPassword?: string;
        cardNumber?: string;
        securityCode?: string;
        expirationDate?: string;
    }
}