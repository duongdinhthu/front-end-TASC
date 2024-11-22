import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VnPayPaymentComponent } from './vn-pay-payment.component';

describe('VnPayPaymentComponent', () => {
  let component: VnPayPaymentComponent;
  let fixture: ComponentFixture<VnPayPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VnPayPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VnPayPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
