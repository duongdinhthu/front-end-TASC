import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  @Input() doctorPrice: number = 0; // Nhận giá trị từ component cha
  @Output() paymentCompleted = new EventEmitter<{ paymentStatus: boolean, data: any }>(); // Sự kiện phát ra khi thanh toán thành công
  paymentStatus: boolean = false;  // Thuộc tính trong component con lưu trạng thái thanh toán

  constructor() {}

  ngOnInit(): void {
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = 'https://www.sandbox.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD';
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
        // Chỉ lấy thông tin orderID và các thông tin cần thiết mà không thực hiện capture
        console.log('Approve thanh toán, thông tin:', data);
        console.log('Order ID:', data.orderID);

        const paymentData = {
          orderID: data.orderID,
          payerID: data.payerID,
          paymentID: data.paymentID,
          paymentSource: data.paymentSource,
          facilitatorAccessToken: data.facilitatorAccessToken,
          amount: this.doctorPrice // Giá trị thanh toán
        };

        // Cập nhật trạng thái thanh toán
        this.paymentStatus = true;

        // Phát sự kiện thanh toán thành công với đối tượng chứa paymentStatus và paymentData
        this.paymentCompleted.emit({
          paymentStatus: this.paymentStatus,
          data: paymentData
        });

        // Chỉ trả về thông tin, không gọi actions.order.capture() ở đây
        return; // Không thực hiện capture ở front-end nữa
      },

      onError: (err: any) => {
        console.error('Thanh toán thất bại', err);
        this.paymentStatus = false;  // Nếu có lỗi, cập nhật trạng thái thanh toán là false
        // Phát sự kiện thanh toán thất bại với đối tượng chứa paymentStatus
        this.paymentCompleted.emit({
          paymentStatus: this.paymentStatus,
          data: null // Không có paymentData khi thất bại
        }); // Emit đối tượng chứa paymentStatus và paymentData là null
      }
    }).render('#paypal-button-container'); // Hiển thị nút PayPal
  }
}
