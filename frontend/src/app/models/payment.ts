export interface PaymentOptions {
    id: number,
    type: string,
    data: {
        name: string,
        swpCode?: string
        accountName?: string,
        accountPassword?: string
        cardNumber?: string,
        securityCode?: string,
        expirationDate?: string
    }
}

export interface BachelorcardObj {
  name?: string;
  cardNumber?: string;
  securityCode?: string;
  expirationDate?: string;
}

export interface HcipalObj {
  accountName?: string,
  accountPassword?: string
}

export interface SwpsafeObj {
  swpCode?: string
}