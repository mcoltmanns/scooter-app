export interface BachelorCardData {
  name: string,
  cardNumber: string,
  securityCode: string,
  expirationDate: string
}

export interface SwpSafeData {
  swpCode: string
}

export interface HciPalData {
  accountName: string,
  accountPassword: string
}

export type PaymentService = {
  initTransaction: (dataObject: BachelorCardData | SwpSafeData | HciPalData, amount: number) => Promise<{status: number, message: string}>;
  commitTransaction(token: string): Promise<{status: number, message: string}>;
  rollbackTransaction(token: string): Promise<{status: number, message: string}>;
};
