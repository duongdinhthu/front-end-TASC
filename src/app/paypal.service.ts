import { Injectable } from '@angular/core';

declare global {
  interface Window { paypal: any; }
}

@Injectable({
  providedIn: 'root',
})
export class PayPalService {
  constructor() {}

  // Hàm tạo đơn hàng PayPal
  createOrder(doctorPrice: number) {
    return {
      purchase_units: [
        {
          amount: {
            value: doctorPrice.toString(),
          },
        },
      ],
    };
  }

  // Hàm capture payment (lấy kết quả thanh toán)
  capturePayment(orderId: string) {
    console.log('Payment captured for Order ID:', orderId);
  }
}
