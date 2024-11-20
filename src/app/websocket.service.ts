import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messageSubject: Subject<string> = new Subject<string>();

  constructor() { }

  // Hàm để kết nối đến WebSocket server
  connect(randomCode: string): void {
    const socketUrl = `ws://localhost:8080/ws/notification?randomCode=${randomCode}`;
    this.socket = new WebSocket(socketUrl);

    // Khi kết nối thành công, nhận thông điệp từ backend
    this.socket.onopen = (event) => {
      console.log('WebSocket connection established: ', event); // Log khi kết nối thành công
    };

    // Nhận thông điệp từ server
    this.socket.onmessage = (event: MessageEvent) => {
      console.log('Message received from server: ', event.data); // Log khi nhận thông báo từ server
      this.messageSubject.next(event.data); // Phát thông điệp đến các component khác
    };

    // Lỗi kết nối
    this.socket.onerror = (error) => {
      console.error('WebSocket error: ', error); // Log lỗi kết nối
    };

    // Khi kết nối đóng
    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed: ', event); // Log khi kết nối đóng
    };
  }

  // Kiểm tra xem đã có kết nối WebSocket hay chưa
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  // Quan sát thông điệp từ server (để client có thể nhận thông báo)
  getMessages(): Observable<string> {
    return this.messageSubject.asObservable(); // Trả về Observable để nhận thông báo
  }

  // Đóng kết nối WebSocket khi không sử dụng (nếu cần)
  closeConnection(): void {
    if (this.socket) {
      console.log('Closing WebSocket connection'); // Log khi đóng kết nối
      this.socket.close();
    }
  }
}
