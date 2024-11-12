import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppointmentService } from '../appointment.service';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
})
export class AppointmentComponent implements OnInit {

  currentStep: number = 1;

  // Mảng chứa danh sách khoa bệnh
  departments: any[] = [];
  // Mảng chứa danh sách bác sĩ
  doctors: any[] = [];

  // Form initialization using FormGroup and FormControl
  appointmentForm = new FormGroup({
    department: new FormControl('', Validators.required),
    doctor: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    time: new FormControl('', Validators.required),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/), // Validates 10-digit phone numbers
    ]),
  });

  // Inject AppointmentService to fetch departments and doctors
  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    // Call the service to fetch departments when the component is initialized
    this.appointmentService.getDepartments().subscribe(
      (data) => {
        this.departments = data;  // Store the response into the departments array
      },
      (error) => {
        console.error('Error fetching departments:', error);
      }
    );
  }

  // Handle when department is changed
  onDepartmentChange(event: any): void {
    const departmentId = event.target.value;
    this.getDoctors(departmentId); // Call method to get doctors of the selected department
  }

  // Call the service to fetch doctors based on department ID
  getDoctors(departmentId: string): void {
    this.appointmentService.getDoctorsByDepartment(departmentId).subscribe(
      (data) => {
        this.doctors = data;  // Store the response into the doctors array
      },
      (error) => {
        console.error('Error fetching doctors:', error);
      }
    );
  }

  // Handle form submission
  onSubmit(): void {
    if (this.appointmentForm.valid) {
      console.log('Form Data:', this.appointmentForm.value);
      alert('Appointment Submitted Successfully!');
    } else {
      console.error('Form is invalid');
    }
  }

  // Navigate to different steps
  goToStep(step: number) {
    this.currentStep = step;
  }
}
