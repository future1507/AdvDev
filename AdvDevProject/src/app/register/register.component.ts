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
  
  // Register(){
  //   console.log(this.captcha);
  //   if (this.checkk) {
  //     let json = {
  //         UserID : this.userid,
  //         Password : this.password,
  //         Firstname : this.fname,
  //         Lastname : this.lname,
  //         Birthday : this.birthday,  
  //       };
  //       // console.log(this.Birthday);
  //       console.log(this.birthday);
  //       console.log(JSON.stringify(json));
  //       this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json))
  //       .subscribe(response =>{
  //         console.log(response);
  //         this.router.navigateByUrl('/selectTag/'+this.userid);
  //       }, error => {
  //         console.log(error);
          
  //       });
  //   }
  // }
  async Register(){
    if(this.checkk){
      let json = {
        UserID : this.userid,
        Password : this.password,
        Firstname : this.fname,
        Lastname : this.lname,
        Birthday : this.birthday,  
      };
      let response = await this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json)).toPromise();
      this.router.navigateByUrl('/selectTag/'+this.userid);
      console.log(response);
    }
  }
  check(){
      this.checkk = true;
      console.log(this.checkk);
  }
  
}
