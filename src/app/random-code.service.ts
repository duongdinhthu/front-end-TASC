import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Đảm bảo service này có thể được tiêm vào bất kỳ component nào
})
export class RandomCodeService {

  constructor() { }

  // Hàm lấy mã random từ sessionStorage
  getRandomCode(): string | null {
    return sessionStorage.getItem('randomCode');
  }

  // Hàm tạo mã mới và lưu vào sessionStorage
  createRandomCode(): string {
    const randomCode = Math.random().toString(36).substring(2, 12); // Mã ngẫu nhiên dài 10 ký tự
    sessionStorage.setItem('randomCode', randomCode);
    return randomCode;
  }
}
