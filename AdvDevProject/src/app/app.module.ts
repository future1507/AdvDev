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
import {FileUploadModule} from 'primeng/fileupload';
import { InfoComponent } from './info/info.component';
import {DialogModule} from 'primeng/dialog';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import {ButtonModule} from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StoryComponent } from './story/story.component';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {MenuModule} from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';

const appRoutes: Routes = [
  {path:'',component: LoginComponent},
  {path:'login',component: LoginComponent},
  {path:'register',component: RegisterComponent},
  {path:'home/:id',component: HomeComponent},
  {path:'header',component: HeaderComponent},
  {path:'selectTag/:id',component: SelectTagComponent},
  {path:'info',component:InfoComponent},
  {path:'story/:userid/:storyid',component: StoryComponent},
  {path:'profile/:id',component: ProfileComponent}

];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    HomeComponent,
    SelectTagComponent,
    ProfileComponent,
    InfoComponent,
    StoryComponent,
    
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
    FileUploadModule,
    DialogModule,
    ButtonModule,
    FontAwesomeModule,
    ToggleButtonModule,
    MenuModule,
    TagModule,
    ConfirmDialogModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
