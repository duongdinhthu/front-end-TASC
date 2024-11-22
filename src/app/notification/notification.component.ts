import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../websocket.service'; // Đảm bảo đúng đường dẫn
import { RandomCodeService } from '../random-code.service'; // Đảm bảo đúng đường dẫn

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  randomCode: string | null = null; // Mã xác định phiên WebSocket
  messages: string[] = []; // Mảng chứa các thông báo từ server
  isPopupVisible: boolean = false; // Biến kiểm soát hiển thị popup thông báo

  constructor(
    private websocketService: WebsocketService, // Service quản lý WebSocket
    private randomCodeService: RandomCodeService // Service tạo randomCode
  ) {}

  ngOnInit(): void {
    // Lấy mã randomCode từ RandomCodeService
    this.randomCode = this.randomCodeService.getRandomCode();

    // Nếu chưa có mã, tạo mới và lưu vào sessionStorage
    if (!this.randomCode) {
      this.randomCode = this.randomCodeService.createRandomCode();
      sessionStorage.setItem('randomCode', this.randomCode);
    }

    // Kết nối WebSocket nếu chưa kết nối
    if (this.randomCode && !this.websocketService.isConnected()) {
      this.websocketService.connect(this.randomCode);
    }

    // Lắng nghe thông báo từ server qua WebSocket
    this.websocketService.getMessages().subscribe((message) => {
      this.messages.push(message); // Lưu tin nhắn vào mảng
      console.log("Received message:", message); // In tin nhắn ra console
    });
  }

  ngOnDestroy(): void {
    // Đóng kết nối WebSocket khi component bị hủy
    this.websocketService.closeConnection();
  }

  // Hàm bật/tắt hiển thị popup
  togglePopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }

  // Hàm đóng popup
  closePopup(): void {
    this.isPopupVisible = false;
  }
}
