import { Component, OnInit } from '@angular/core';
import { RandomCodeService } from './random-code.service';  // Import service

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'fpthealth';
  randomCode: string | null = null;

  // Tiêm service vào constructor
  constructor(private randomCodeService: RandomCodeService) {}

  ngOnInit(): void {
    // Kiểm tra xem mã đã có trong sessionStorage chưa
    if (!this.randomCodeService.getRandomCode()) {
      // Nếu chưa có, tạo mã ngẫu nhiên và lưu vào sessionStorage
      this.randomCode = this.randomCodeService.createRandomCode();
    } else {
      // Nếu đã có mã, lấy mã từ sessionStorage
      this.randomCode = this.randomCodeService.getRandomCode();
    }
  }
}
