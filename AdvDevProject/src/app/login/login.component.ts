import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import  {ActivatedRoute, Router} from '@angular/router'
import {DatapassService} from '../datapass.service';
import { HttpHeaders } from '@angular/common/http';
import { ObjectUnsubscribedError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  userid = "abc123";
  password = "1234";
  constructor(private http : HttpClient,private router : Router,
    public data: DatapassService,private route : ActivatedRoute) { }
    
  ngOnInit(): void {
  }

  Login(){
    //console.log('hee');
    console.log(this.userid)
    console.log(this.password)
    let json = {
      UserID : this.userid,
      Password : this.password     
    };
    console.log(JSON.stringify(json))
    this.http.post('http://203.154.83.62:1507/login',JSON.stringify(json))
    .subscribe(response =>{
      
      //console.log(response);
      //console.log(JSON.stringify(response))
      if(response != 'Login Fail'){
        //this.data.userid = this.userid;
        localStorage.setItem('UserID',this.userid);
        var array = Object.values(response);
        console.log(array[3]);
        //this.data.token = array[3];
        localStorage.setItem('TOKEN',array[3]);
        this.data.token = array[3];
        //let obj = JSON.parse(response);
        
        this.router.navigateByUrl('/home/'+this.userid);
      }
    }, error => {
      console.log(error);
    });

    // let request = this.http.get('http://203.154.83.62:1507/abc123')
    // .subscribe(response =>{
    //   console.log(response);
    // }, error => {
    //   console.log(error);
    // });
  }

}
