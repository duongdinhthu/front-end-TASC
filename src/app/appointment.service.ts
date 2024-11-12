import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = 'http://localhost:8080/api/userservice/departments/getall'; // URL API của bạn
  private doctorsApiUrl = 'http://localhost:8080/api/userservice/doctors'; // URL của API bác sĩ

  constructor(private http: HttpClient) {}

  // Phương thức để lấy danh sách khoa bệnh
  getDepartments(): Observable<any[]> {
    console.log('Calling API to fetch departments...');
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((data) => {
        console.log('Data received:', data); // Hiển thị dữ liệu nhận được từ API
      })
    );
  }
  getDoctorsByDepartment(departmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.doctorsApiUrl}?departmentId=${departmentId}`);
  }
}
