import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import  {Router} from '@angular/router'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  date1 = new Date;

  siteKey: string;
  dates : SelectItem[];
  months : SelectItem[];
  years : SelectItem[];
  Day ='';
  Month ='';
  Year ='';
  constructor(private http : HttpClient,private router : Router) {
    this.siteKey = '6LfREzAaAAAAAOzackpc2DNAVyXBLPmVEKZ16RGM';
    this.dates = [];
      for (let i = 1; i <= 31; i++) {
          this.dates.push({label:''+  i, value: i});
      }
      this.months = [
            {label: 'มกราคม',value: 1},
            {label: 'กุมภาพันธ์ ',value: 2},
            {label: 'มีนาคม ',value: 3},
            {label: 'เมษายน ',value: 4},
            {label: 'พฤษภาคม ',value: 5},
            {label: 'มิถุนายน ',value: 6},
            {label: 'กรกฎาคม ',value: 7},
            {label: 'สิงหาคม ',value: 8},
            {label: 'กันยายน ',value: 9},
            {label: 'ตุลาคม ',value: 10},
            {label: 'พฤศจิกายน ',value: 11},
            {label: 'ธันวาคม ',value: 12}
      ];
      this.years=[];
        for (let i = 2530; i <= 2563; i++) {
          this.years.push({label:''+ i, value: i});
      
     
        } 
        
  }

  ngOnInit(): void {
  }

  userid:any;
  password:any;
  fname:any;
  lname:any;
  birthday:any;
  Register(){
    let json = {
      UserID : this.userid,
      Password : this.password,
      Firstname : this.fname,
      Lastname : this.lname,
      Birthday : '2000-10-10',  
    };
    console.log(this.birthday);
    console.log(JSON.stringify(json));
    this.http.post('http://203.154.83.62:1507/signup',JSON.stringify(json))
    .subscribe(response =>{
      console.log(response);
      this.router.navigateByUrl('/selectTag');
    }, error => {
      console.log(error);
    });
  }
}
