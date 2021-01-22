import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { Routes,RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { TabMenuModule} from 'primeng/tabmenu';
import { MenuItem} from 'primeng/api';
import { SelectTagComponent } from './select-tag/select-tag.component';
import { CalendarModule} from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ProfileComponent } from './profile/profile.component';
import { HttpClientModule} from '@angular/common/http';
// import {EditorModule} from 'primeng/editor';
import {DropdownModule} from 'primeng/dropdown';
import { NgxCaptchaModule } from 'ngx-captcha';
const appRoutes: Routes = [
  {path:'',component: LoginComponent},
  {path:'login',component: LoginComponent},
  {path:'register',component: RegisterComponent},
  {path:'home/:id',component: HomeComponent},
  {path:'header',component: HeaderComponent},
  {path:'selectTag',component: SelectTagComponent},
  {path:'profile/:userid',component: ProfileComponent}

];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    HomeComponent,
    SelectTagComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    TabMenuModule,
    AppRoutingModule,
    FormsModule,
    NgxCaptchaModule,
    //MenuItem,
    // EditorModule,
    DropdownModule,
    HttpClientModule,
    CalendarModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
