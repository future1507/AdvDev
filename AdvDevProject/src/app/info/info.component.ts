import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import  {Router} from '@angular/router'
import { HttpHeaders } from '@angular/common/http';
import { DatapassService } from '../datapass.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  fname = localStorage.getItem('Firstname');
  lname = localStorage.getItem('Lastname');
  bday = localStorage.getItem('Birthday');
  udesc = localStorage.getItem('UserDesc');
  country = localStorage.getItem('Country');
  skills = localStorage.getItem('Skills');
  phone = localStorage.getItem('Phone');
  mail = localStorage.getItem('Mail');
  fb = localStorage.getItem('Facebook');
  twitter = localStorage.getItem('Twitter');
  password = ""

  token : any;
  constructor(private http : HttpClient,private router : Router,
    public data: DatapassService) {
    if(this.data.token != localStorage.getItem('TOKEN')){
      this.router.navigateByUrl('/login');
    }
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
  }

  ngOnInit(): void {
    
  }
  display1 = false;
  Edit(){
    if(this.password != ""){
      let json = {
        UserID : localStorage.getItem('UserID'),
        Firstname : this.fname,
        Lastname : this.lname,
        Birthday : this.bday,  
        UserDesc : this.udesc,
        Country : this.country,
        Skills : this.skills,
        Phone : this.phone,
        Mail : this.mail,
        Facebook : this.fb,
        Twitter : this.twitter
      };
      // console.log(this.Birthday);
      console.log(JSON.stringify(json));
      this.http.post('http://203.154.83.62:1507/editprofile',JSON.stringify(json),this.token)
      .subscribe(response =>{
        console.log(response);
        localStorage.setItem('Firstname',""+this.fname);
        localStorage.setItem('Lastname',""+this.lname);
        localStorage.setItem('Birthday',""+this.bday);
        localStorage.setItem('UserDesc',""+this.udesc);
        localStorage.setItem('Country',""+this.country);
        localStorage.setItem('Skills',""+this.skills);
        localStorage.setItem('Phone',""+this.phone);
        localStorage.setItem('Mail',""+this.mail);
        localStorage.setItem('Facebook',""+this.fb);
        localStorage.setItem('Twitter',""+this.twitter);
        this.router.navigateByUrl('/profile/'+localStorage.getItem('UserID'));
      }, error => {
        console.log(error);
      });
    }
    else{
      this.display1 = true
    }
    
  }
  TokenUser(token:any){
    const headerDict = {
      'Authorization': "Bearer "+token
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict), 
    };
    return requestOptions;
  }
}
