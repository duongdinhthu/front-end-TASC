import { NgModule } from '@angular/core';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { BlogComponent } from './blog/blog.component';
import { ContactComponent } from './contact/contact.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { LoginComponent } from './login/login.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { HttpClientModule } from '@angular/common/http';
import { PaymentComponent } from './payment/payment.component';
import { PayPalService } from './paypal.service';
import { NotificationComponent } from './notification/notification.component';
import { WebsocketService } from './websocket.service';  // Đảm bảo đã import WebSocketService

@NgModule({
  declarations: [		
    AppComponent,
    HomeComponent,
    AboutComponent,
    BlogDetailsComponent,
    BlogComponent,
    ContactComponent,
    DoctorsComponent,
    LoginComponent,
    AppointmentComponent,
    PaymentComponent,
    NotificationComponent,
      HeaderComponent,
      FooterComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [PayPalService, WebsocketService], // Đảm bảo khai báo WebSocketService ở đây
  bootstrap: [AppComponent],
  exports: [AppointmentComponent],
})
export class AppModule {}
