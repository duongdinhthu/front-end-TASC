import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppointmentService } from '../appointment.service';
import { RandomCodeService } from '../random-code.service'; // Import RandomCodeService
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
})
export class AppointmentComponent implements OnInit {
  randomCode: string | null = null; // Biến để lưu trữ mã ngẫu nhiên

  currentStep: number = 1;
  slotOptions: any[] = [];
  allSlots: any[] = []; // Mảng lưu tất cả các slot từ API
  selectedSlot: any; // Mảng chứa danh sách khoa bệnh
  departments: any[] = []; // Mảng chứa danh sách bác sĩ
  doctors: any[] = [];
  paymentSuccessful: boolean = false; // Kiểm tra trạng thái thanh toán

  // Mảng chứa các slot đã được đặt (dạng chuỗi như '08:00 - 09:00')
  bookedSlots: string[] = [];

  // Form initialization using FormGroup and FormControl
  appointmentForm = new FormGroup({
    departmentId: new FormControl<number | null>(null, Validators.required),
    doctorId: new FormControl<number | null>(null, Validators.required),
    medicalDay: new FormControl<string | null>(null, Validators.required),
    slot: new FormControl<number | null>(null, Validators.required),
    patientName: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
    ]),
    patientEmail: new FormControl<string | null>(null, [
      Validators.required,
      Validators.email,
    ]),
    patientPhone: new FormControl<string | null>(null, [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    paymentAmount: new FormControl<number | null>(null, Validators.required),
    paymentEncryption: new FormControl<string | null>(null),
    // Các trường thanh toán mới
    orderID: new FormControl<string | null>(null, Validators.required),
    payerID: new FormControl<string | null>(null, Validators.required),
    paymentID: new FormControl<string | null>(null, Validators.required),
    paymentSource: new FormControl<string | null>(
      'paypal',
      Validators.required
    ), // Giá trị mặc định 'paypal'
    facilitatorAccessToken: new FormControl<string | null>(
      null,
      Validators.required
    ),
      randomCode: new FormControl<string | null>(null, Validators.required),
  });

  // Inject AppointmentService and RandomCodeService
  constructor(
    private appointmentService: AppointmentService,
    private randomCodeService: RandomCodeService // Tiêm RandomCodeService vào constructor
  ) {}
  onPaymentCompleted(paymentInfo: { paymentStatus: boolean; data: any }): void {
    this.paymentSuccessful = paymentInfo.paymentStatus; // Lấy trạng thái thanh toán từ paymentStatus
    console.log('Trạng thái thanh toán:', this.paymentSuccessful);
    this.appointmentForm.get('orderID')?.setValue(paymentInfo.data.orderID);
    this.appointmentForm.get('payerID')?.setValue(paymentInfo.data.payerID);
    this.appointmentForm.get('paymentID')?.setValue(paymentInfo.data.paymentID);
    this.appointmentForm.get('paymentSource')?.setValue(paymentInfo.data.paymentSource);
    this.appointmentForm.get('facilitatorAccessToken')?.setValue(paymentInfo.data.facilitatorAccessToken);
    this.appointmentForm.get('paymentAmount')?.setValue(paymentInfo.data.amount);
    if (
      this.currentStep === 3 &&
      this.appointmentForm.valid &&
      this.paymentSuccessful
    ) {
      console.log('Thanh toán thành công!');
      console.log('gọi hàm submit');
      this.onSubmit(); // Gọi hàm submit sau khi đã gán giá trị vào form
    } else {
      console.log('Thanh toán thất bại.');
      // Thực hiện các hành động khi thanh toán thất bại
    }
  }

  ngOnInit(): void {
    // Lấy mã ngẫu nhiên từ service khi component được khởi tạo
    this.randomCode = this.randomCodeService.getRandomCode();
    console.log('code random :   ' + this.randomCode);
    this.appointmentForm.get('randomCode')?.setValue(this.randomCode);
    // Call the service to fetch departments when the component is initialized
    this.appointmentService.getDepartments().subscribe(
      (data) => {
        this.departments = data; // Store the response into the departments array
      },
      (error) => {
        console.error('Error fetching departments:', error);
      }
    );
  }

  onDoctorChange(event: any) {
    const doctorId = +event.target.value; // Chuyển event.target.value thành số (number)

    // Lấy doctorId từ lựa chọn
    const selectedDoctor = this.doctors.find(
      (doctor) => doctor.id === doctorId
    );

    // Nếu tìm thấy bác sĩ, cập nhật giá trị price trong form
    if (selectedDoctor) {
      // Kiểm tra trường paymentAmount có tồn tại trong form không
      const paymentAmountControl = this.appointmentForm.get('paymentAmount');

      if (paymentAmountControl) {
        paymentAmountControl.setValue(Number(selectedDoctor.doctorPrice)); // Đảm bảo giá trị là số
        console.log(
          'Đã gán giá vào paymentAmount: ' + selectedDoctor.doctorPrice
        );
        console.log(
          'Giá trị paymentAmount hiện tại: ' + paymentAmountControl.value
        );
        // In ra giá trị đã gán
      } else {
        console.error('Trường paymentAmount không tồn tại trong form.');
      }
    } else {
      console.error('Bác sĩ không tồn tại với ID: ' + doctorId);
    }

    // Gọi API lấy danh sách slot của bác sĩ
    this.getSlots(doctorId);
  }

  // Gọi API để lấy danh sách slot của bác sĩ
  getSlots(doctorId: number) {
    this.appointmentService.getSlotByDoctor(doctorId).subscribe(
      (response: any[]) => {
        const filteredData = response.map((item) => {
          const medicalDate = new Date(item.medicalDay);

          // Chuyển medicalDay thành định dạng yyyy-MM-dd
          const formattedDate = `${medicalDate.getFullYear()}-${(
            medicalDate.getMonth() + 1
          )
            .toString()
            .padStart(2, '0')}-${medicalDate
            .getDate()
            .toString()
            .padStart(2, '0')}`;

          return {
            doctorId: item.doctorId,
            medicalDay: formattedDate, // Định dạng lại ngày
            slot: item.slot,
          };
        });

        console.log('Dữ liệu đã lọc và định dạng:', filteredData);

        // Lưu dữ liệu vào mảng allSlots
        this.allSlots = filteredData;

        // Hiển thị tất cả slot khả dụng ban đầu
        this.updateSlotOptions(filteredData);
      },
      (error) => {
        console.error('Có lỗi khi lấy dữ liệu của bác sĩ', error);
      }
    );
  }

  // Cập nhật danh sách slotOptions và bookedSlots
  updateSlotOptions(slots: any[]) {
    // Lọc các slot đã đặt (đảm bảo rằng chúng chỉ thuộc ngày hiện tại hoặc bác sĩ đã chọn)
    this.bookedSlots = slots.map((item) => this.convertSlotToLabel(item.slot));

    // Cập nhật danh sách các slot có thể chọn (không trùng với các slot đã đặt)
    this.slotOptions = [
      { value: 1, label: '08:00 - 09:00' },
      { value: 2, label: '09:00 - 10:00' },
      { value: 3, label: '10:00 - 11:00' },
      { value: 4, label: '11:00 - 12:00' },
      { value: 5, label: '13:00 - 14:00' },
      { value: 6, label: '14:00 - 15:00' },
      { value: 7, label: '15:00 - 16:00' },
      { value: 8, label: '16:00 - 17:00' },
    ].filter((slot) => !this.bookedSlots.includes(slot.label)); // Lọc các slot đã đặt
  }

  onMedicalDayChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value; // Lấy ngày đã chọn

    // In ra ngày đã chọn
    console.log('Ngày đã chọn:', selectedDate);

    // Lọc slot từ allSlots theo ngày đã chọn
    const filteredSlots = this.allSlots.filter(
      (slot) => slot.medicalDay === selectedDate
    );

    // In ra danh sách các slot phù hợp với ngày đã chọn
    console.log('Các slot được lọc:', filteredSlots);

    // Cập nhật slot khả dụng dựa trên ngày đã chọn
    this.updateSlotOptions(filteredSlots);

    // In ra danh sách các slot khả dụng sau khi cập nhật
    console.log('Các slot khả dụng (slotOptions):', this.slotOptions);
  }

  // Hàm chuyển đổi từ giá trị int thành chuỗi thời gian tương ứng
  convertSlotToLabel(slotValue: number): string {
    switch (slotValue) {
      case 1:
        return '08:00 - 09:00';
      case 2:
        return '09:00 - 10:00';
      case 3:
        return '10:00 - 11:00';
      case 4:
        return '11:00 - 12:00';
      case 5:
        return '13:00 - 14:00';
      case 6:
        return '14:00 - 15:00';
      case 7:
        return '15:00 - 16:00';
      case 8:
        return '16:00 - 17:00';
      default:
        return ''; // Nếu không có giá trị hợp lệ, trả về chuỗi rỗng
    }
  }

  // Handle when department is changed
  // Hàm xử lý khi chọn khoa
  onDepartmentChange(event: any) {
    const departmentId = event.target.value; // Lấy departmentId từ lựa chọn
    this.getDoctors(departmentId); // Gọi API lấy danh sách bác sĩ theo departmentId
  }

  // Gọi API để lấy bác sĩ theo departmentId
  getDoctors(departmentId: number) {
    this.appointmentService.getDoctorsByDepartment(departmentId).subscribe(
      (doctors) => {
        this.doctors = doctors; // Cập nhật danh sách bác sĩ
        console.log('Danh sách bác sĩ trả về:', doctors); // In ra console danh sách bác sĩ
      },
      (error) => {
        console.error('Có lỗi khi lấy bác sĩ', error);
      }
    );
  }

  // Handle form submission
  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const appointmentData = this.appointmentForm.value; // Lấy dữ liệu từ form
      console.log('Form Data:', appointmentData);

      // Gọi phương thức registerAppointment từ service
      this.appointmentService.registerAppointment(appointmentData).subscribe({
        next: (response) => {
          console.log('Appointment registered successfully:', response);
        },
        error: (error) => {
          console.error('Error occurred while submitting appointment:', error);
        },
      });
    } else {
      console.error('Form is invalid');
    }
  }


  // Navigate to different steps
  goToStep(step: number) {
    this.currentStep = step;
  }

  lockedSlots: string[] = []; // Mảng lưu các slot đã bị khóa

  onSlotChange(slotValue: number) {
    // Cập nhật giá trị vào form control 'slot'
    this.appointmentForm.get('slot')?.setValue(slotValue);
    this.selectedSlot = slotValue;

    if (this.appointmentForm.get('slot')?.valid) {
      const formData = this.appointmentForm.value;
      const appointmentData = {
        slot: formData.slot,
        medicalDay: formData.medicalDay,
        doctorId: formData.doctorId,
        randomCode: this.randomCode,
      };

      // Gửi dữ liệu đến backend
      this.appointmentService.checkLock(appointmentData).subscribe(
        (response: any) => {
          console.log(response.code);
          switch (response.code) {
            case 200: // Slot được khóa hoặc nhả thành công
              console.log(response.message);
              alert(response.message);
              break;

            case 400: // Slot đã được khóa trước đó
              console.warn(response.message);
              this.selectedSlot = null;
              this.appointmentForm.get('slot')?.setValue(null);
              alert(response.message);
              break;

            case 409: // Slot đã bị khóa, không thể chọn
              if (!this.lockedSlots.includes(slotValue.toString())) {
                this.lockedSlots.push(slotValue.toString());
              }
              this.appointmentForm.get('slot')?.setValue(null);
              console.warn(response.message);
              this.selectedSlot = null;
              this.appointmentForm.get('slot')?.setValue(null);
              alert(response.message);
              break;

            case 500: // Lỗi không xác định
              this.appointmentForm.get('slot')?.setValue(null);
              this.selectedSlot = null;
              break;
            default:
              console.error(response.message);
              this.selectedSlot = null;
              this.appointmentForm.get('slot')?.setValue(null);
              alert('Lỗi hệ thống, vui lòng thử lại.');
              break;
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Lỗi khi gửi dữ liệu đến server:', error.message);
          alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
      );
    }
  }
  checkFormValidity() {
    const invalidFields: string[] = [];
    console.log(
      this.currentStep.toString() + this.paymentSuccessful.toString()
    );
    Object.keys(this.appointmentForm.controls).forEach((key) => {
      const control = this.appointmentForm.get(key);
      if (control && control.invalid) {
        invalidFields.push(key);
      }
    });

    if (invalidFields.length > 0) {
      console.log(
        'Các trường chưa hợp lệ hoặc chưa có giá trị:',
        invalidFields
      );
      invalidFields.forEach((field) => {
        console.log(
          `Trường "${field}" lỗi:`,
          this.appointmentForm.get(field)?.errors
        );
      });
    } else {
      console.log('Tất cả các trường đều hợp lệ!');
    }
  }
}
