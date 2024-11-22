import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vn-pay-payment',
  templateUrl: './vn-pay-payment.component.html',
  styleUrls: ['./vn-pay-payment.component.css']
})
export class VnPayPaymentComponent {
  @Input() amount: number = 0;

  initiateVNPay(): void {
    // Thay URL bên dưới bằng API hoặc trang redirect của VNPay
    const vnpayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${this.amount}&...`;
    window.location.href = vnpayUrl; // Redirect người dùng tới VNPay
  }
}
