import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = 'http://localhost:8080/api/userservice/notjwt/departments/getall'; // URL API của bạn
  private doctorsApiUrl = 'http://localhost:8080/api/userservice/notjwt/doctors/getbydepartment'; // URL của API bác sĩ
  private checkSlotAppointmentByDoctor = "http://localhost:8080/api/appointments/checkslot";
  private lockSlot = "http://localhost:8082/api/appointments/lock";
  private apiRegisterAPM = "http://localhost:8082/api/appointments/register";

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
  getDoctorsByDepartment(departmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.doctorsApiUrl}/${departmentId}`);
  }
  getSlotByDoctor(doctorId:number): Observable<any[]>{
    return this.http.get<any[]>(`${this.checkSlotAppointmentByDoctor}/${doctorId}`)
  }
  checkLock(appointmentData: any): Observable<any> {
    return this.http.post<any>(this.lockSlot, appointmentData);
  }
  registerAppointment(appointmentForm: any): Observable<any> {
    return this.http.post<any>(this.apiRegisterAPM, appointmentForm);
  }

}
