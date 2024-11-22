import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  @Input() doctorPrice: number = 0; // Nhận giá trị từ component cha
  @Output() createOrder = new EventEmitter<{paymentAmount:number}>();
  @Input() approvalLink: string = ''; // Nhận approvalLink từ component cha
  constructor() {}

  ngOnInit(): void {
    if (this.approvalLink) {
      this.setupPayPalButton(); // Nếu approvalLink đã có, gọi ngay setupPayPalButton
    } else {
      // Chưa có approvalLink, sẽ tải PayPal script
      if (!window.paypal) {
        const script = document.createElement('script');
        script.src = 'https://www.sandbox.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD';
        script.onload = () => {
          this.setupPayPalButton(); // Gọi phương thức sau khi script đã tải xong
        };
        document.body.appendChild(script);
      } else {
        this.setupPayPalButton();
      }
    }
  }


  setupPayPalButton(): void {
    console.log("gọi nút thanh toán");

    // Chỉ cần trả về approvalLink và thực hiện chuyển hướng đến PayPal
    if (this.approvalLink) {
      window.open(this.approvalLink, '_blank'); // '_blank' mở trong tab mới
    } else {
      console.error('Approval link is not available.');
    }
  }


}
