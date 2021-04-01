import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import  {Router} from '@angular/router'
import { ReCaptchaV3Service } from 'ngx-captcha';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  date1 = new Date;
  checkk: any;
  captcha : any;
  siteKey: string;
  constructor(private http : HttpClient,private router : Router) {
    this.siteKey = '6Ld8DTAaAAAAAFrxvwe95t3Rb2R0mFJWkJ4oPMhl';
    
  }

  ngOnInit(): void {
  }

  userid:any;
  password:any;
  fname:any;
  lname:any;
  birthday:any;
  display: boolean = false;
  Register(){
    if(this.userid == null||this.password == null||this.fname == null||this.lname == null||this.birthday == null){
      this.display1 = true
    }
    if(this.captcha == null){
      this.display2 = true
    }
    //console.log(this.captcha);
    if (this.checkk) {
      let json = {
          UserID : this.userid,
          Password : this.password,
          Firstname : this.fname,
          Lastname : this.lname,
          Birthday : this.birthday,  
        };
        // console.log(this.Birthday);
        console.log(this.birthday);
        console.log(JSON.stringify(json));
        this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json))
        .subscribe(response =>{
          console.log(response);
          this.router.navigateByUrl('/selectTag/'+this.userid);
          localStorage.setItem('SignUpID',this.userid);
        }, error => {
          console.log(error);
          this.display3 = true
        });
    }
  }
  display1 = false;
  display2 = false;
  display3 = false;
  // async Register(){
  //   if(this.userid == null||this.password == null||this.fname == null||this.lname == null||this.birthday == null){
  //     this.display1 = true
  //   }
  //   if(this.captcha == null){
  //     this.display2 = true
  //   }
  //   if(this.checkk){
  //     let json = {
  //       UserID : this.userid,
  //       Password : this.password,
  //       Firstname : this.fname,
  //       Lastname : this.lname,
  //       Birthday : this.birthday,  
  //     };
  //     console.log(json)
  //     let response = await this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json)).toPromise();
  //     console.log(response);
  //     if(response.toString() == 'Record Inserted Successfully'){
  //       this.router.navigateByUrl('/selectTag/'+this.userid);
  //       localStorage.setItem('SignUpID',this.userid);
  //     }
  //     else{
  //       this.display3 = true
  //     }
  //   }
    
  // }
  check(){
      this.checkk = true;
      console.log(this.checkk);
      this.showDialog()
  }
  showDialog() {
    this.display = true;
  }
  
}
