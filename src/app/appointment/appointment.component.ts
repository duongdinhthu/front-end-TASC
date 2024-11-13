import { Component, OnInit } from '@angular/core';
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
  selectedSlot: any;
  // Mảng chứa danh sách khoa bệnh
  departments: any[] = [];
  // Mảng chứa danh sách bác sĩ
  doctors: any[] = [];

  // Mảng chứa các slot đã được đặt (dạng chuỗi như '08:00 - 09:00')
  bookedSlots: string[] = [];

  // Form initialization using FormGroup and FormControl
  appointmentForm = new FormGroup({
    departmentId: new FormControl('', Validators.required),
    doctorId: new FormControl('', Validators.required),
    appointmentDate: new FormControl('', Validators.required),
    medicalDay: new FormControl('', Validators.required),
    slot: new FormControl('', Validators.required),
    patientName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    patientEmail: new FormControl('', [Validators.required, Validators.email]),
    patientPhone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    paymentAmount: new FormControl('', Validators.required),
    paymentCurrency: new FormControl('', Validators.required),
    paymentEncryption: new FormControl(''),
    status: new FormControl('', Validators.required),
  });

  // Inject AppointmentService and RandomCodeService
  constructor(
    private appointmentService: AppointmentService,
    private randomCodeService: RandomCodeService // Tiêm RandomCodeService vào constructor
  ) {}

  ngOnInit(): void {
    // Lấy mã ngẫu nhiên từ service khi component được khởi tạo
    this.randomCode = this.randomCodeService.getRandomCode();
    console.log('code random :   ' + this.randomCode);
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
    const doctorId = event.target.value;
    // Lấy doctorId từ lựa chọn
    const selectedDoctor = this.doctors.find(
      (doctor) => doctor.id === doctorId
    );

    // Nếu tìm thấy bác sĩ, cập nhật giá trị price trong form
    if (selectedDoctor) {
      this.appointmentForm
        .get('paymentAmount')
        ?.setValue(selectedDoctor.doctorPrice);
    }
    this.getSlots(doctorId); // Gọi API lấy danh sách slot của bác sĩ
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

  lockedSlots: string[] = []; // Mảng lưu các slot đã bị khóa

  onSlotChange(slotValue: string) {
    // Cập nhật giá trị vào form control 'slot'
    this.appointmentForm.get('slot')?.setValue(slotValue);
    console.log('Selected Slot:', this.appointmentForm.get('slot')?.value); // In ra giá trị của slot

    // Kiểm tra nếu form hợp lệ trước khi gửi dữ liệu
    if (this.appointmentForm.get('slot')?.valid) {
      const formData = this.appointmentForm.value;
      const appointmentData = {
        slot: formData.slot,
        medicalDay: formData.medicalDay,
        doctorId: formData.doctorId,
        randomCode: this.randomCode,
      };

      console.log('Dữ liệu gửi đi:', appointmentData);

      // Gọi service để gửi dữ liệu đến backend
      this.appointmentService.checkLock(appointmentData).subscribe(
        (response: any) => {
          console.log('Mã lỗi từ server:', response.code);
          console.log('Thông báo từ server:', response.message);

          // Kiểm tra phản hồi từ backend và xử lý
          if (response.code === 409) {
            // Slot bị khóa, không cho chọn nữa
            this.lockedSlots.push(slotValue); // Thêm slot vào danh sách bị khóa
            alert('Slot này đã bị khóa, vui lòng chọn slot khác.');
          } else if (response.code === 400) {
            // Nếu lỗi 400: Cố gắng khóa lại slot đã khóa
            this.lockedSlots.push(slotValue); // Thêm vào danh sách bị khóa
            alert('Slot này đã được khóa trước đó, không thể khóa lại.');
          } else {
            // Nếu không có lỗi, coi như slot đã được khóa thành công
            console.log('Slot đã được khóa hoặc nhả thành công');
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Có lỗi khi gửi dữ liệu:', error);
          // Hiển thị thông báo lỗi nếu có
          if (error.status === 400) {
            alert('Lỗi: Slot này đã được khóa trước đó, không thể khóa lại.');
          } else if (error.status === 409) {
            alert('Lỗi: Slot này đã khóa, vui lòng chọn slot khác.');
          } else {
            console.error('Lỗi không xác định:', error.message);
          }
        }
      );
    }
  }
}
