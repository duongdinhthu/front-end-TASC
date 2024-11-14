import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  @Input() doctorPrice: number = 0; // Nhận giá trị từ component cha
  @Output() paymentCompleted = new EventEmitter<boolean>(); // Sự kiện phát ra khi thanh toán thành công
  paymentStatus: boolean = false;  // Thuộc tính trong component con lưu trạng thái thanh toán

  constructor() {}

  ngOnInit(): void {
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD';
      script.onload = () => {
        this.setupPayPalButton();
      };
      document.body.appendChild(script);
    } else {
      this.setupPayPalButton();
    }
  }

  setupPayPalButton(): void {
    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.doctorPrice.toString() // Dùng doctorPrice từ input
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Transaction ID:', data.orderID);
          this.paymentStatus = true;  // Cập nhật trạng thái thanh toán
          // Phát sự kiện thanh toán thành công
          this.paymentCompleted.emit(this.paymentStatus); // Emit giá trị của paymentStatus
        });
      },
      onError: (err: any) => {
        console.error('Thanh toán thất bại', err);
        this.paymentStatus = false;  // Nếu có lỗi, cập nhật trạng thái thanh toán là false
        // Phát sự kiện thanh toán thất bại
        this.paymentCompleted.emit(this.paymentStatus); // Emit giá trị của paymentStatus
      }
    }).render('#paypal-button-container'); // Hiển thị nút PayPal
  }
}
