import { PaymentOptions } from './payment';

export type ResponseMessage = {
    code: number,
    message: string
}

export interface ResObjAllPaymentOptions {
  code: number,
  body: PaymentOptions[]
}