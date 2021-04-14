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
  
  checkk: any;
  captcha : any;
  siteKey: string;
  constructor(private http : HttpClient,private router : Router) {
    this.siteKey = '6Ld8DTAaAAAAAFrxvwe95t3Rb2R0mFJWkJ4oPMhl';
    this.setDate()
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
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    
    let bdsplit = this.birthday.split("-",3)
    let day = +bdsplit[2];
    let month = +bdsplit[1];
    let year = +bdsplit[0];
    // //console.log(this.nowday+"/"+this.nowmonth+"/"+this.nowyear)
    // //console.log(day+"/"+month+"/"+year)
    // //console.log((this.nowday-day)+"/"+(this.nowmonth-month)+"/"+(this.nowyear-year))
    
    if(this.userid == null||this.password == null||this.fname == null||this.lname == null||this.birthday == null){
      this.display1 = true
    }
    else if(this.captcha == null){
      this.display2 = true
    }
    else if(format.test(this.userid)==true||format.test(this.password)==true||format.test(this.fname)==true||format.test(this.lname)==true){
      this.display5 = true
    }
    else if(this.nowyear-year<0){
      this.display4 = true
    }
    else if(this.nowyear-year==0&&this.nowmonth-month<0){
      this.display4 = true
    }
    else if(this.nowyear-year==0&&this.nowmonth-month==0&&this.nowday-day<0){
      this.display4 = true
    }
    ////console.log(this.captcha);
    else if (this.checkk) {
      let json = {
          UserID : this.userid,
          Password : this.password,
          Firstname : this.fname,
          Lastname : this.lname,
          Birthday : this.birthday,  
        };
        // //console.log(this.Birthday);
        //console.log(this.birthday);
        //console.log(JSON.stringify(json));
        this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json))
        .subscribe(response =>{
          //console.log(response);
          this.router.navigateByUrl('/selectTag/'+this.userid);
          localStorage.setItem('SignUpID',this.userid);
        }, error => {
          //console.log(error);
          this.display3 = true
        });
    }
  }
  display1 = false;
  display2 = false;
  display3 = false;
  display4 = false;
  display5 = false;

  date = new Date;
  nowday : number = 0;
  nowmonth : number = 0;
  nowyear: number = 0;
  setDate(){
    //console.log(this.date)
    this.nowday = +this.date.getDate()
    this.nowmonth = +this.date.getMonth()+1
    this.nowyear = +this.date.getFullYear()
  }
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
  //     //console.log(json)
  //     let response = await this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json)).toPromise();
  //     //console.log(response);
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
      //console.log(this.checkk);
      this.showDialog()
  }
  showDialog() {
    this.display = true;
  }
  
}
