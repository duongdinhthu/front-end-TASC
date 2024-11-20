import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../websocket.service'; // Đảm bảo đúng đường dẫn
import { RandomCodeService } from '../random-code.service'; // Đảm bảo đúng đường dẫn

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  randomCode: string | null = null;
  messages: string[] = [];  // Mảng chứa các thông báo
  isPopupVisible: boolean = false; // Biến điều khiển hiển thị popup thông báo

  constructor(
    private websocketService: WebsocketService,
    private randomCodeService: RandomCodeService // Inject RandomCodeService
  ) {}

  ngOnInit(): void {
    // Lấy randomCode từ RandomCodeService
    this.randomCode = this.randomCodeService.getRandomCode();

    // Nếu không có mã trong sessionStorage, tạo mã mới
    if (!this.randomCode) {
      this.randomCode = this.randomCodeService.createRandomCode();
      sessionStorage.setItem('randomCode', this.randomCode);  // Lưu vào sessionStorage
    }

    // Kiểm tra xem đã có kết nối WebSocket chưa
    if (this.randomCode && !this.websocketService.isConnected()) {
      // Kết nối WebSocket với randomCode nếu chưa có kết nối
      this.websocketService.connect(this.randomCode);
    }

    // Lắng nghe thông điệp từ WebSocket
    this.websocketService.getMessages().subscribe((message) => {
      this.messages.push(message);  // Thêm thông báo vào mảng
      console.log("Received message:", message);
    });
  }

  ngOnDestroy(): void {
    // Đóng kết nối WebSocket khi component bị hủy
    this.websocketService.closeConnection();
  }

  // Hàm bật/tắt popup
  togglePopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }

  // Hàm đóng popup
  closePopup(): void {
    this.isPopupVisible = false;
  }
}
