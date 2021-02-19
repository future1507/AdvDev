import { Component, OnInit } from '@angular/core';
import {DatapassService} from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import  {ActivatedRoute, Router} from '@angular/router'
import { HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  token : any;
  constructor(private http : HttpClient,private router : Router,
    public data : DatapassService,private route : ActivatedRoute) {
      this.token = this.TokenUser(localStorage.getItem('TOKEN'));
      this.User();
     }

  ngOnInit(): void {
  }
  fname : any;
  lname : any;
  name : any;
  userid : any;
  profileimg : any;
  User(){
    console.log(localStorage.getItem('TOKEN'));
    this.userid  = localStorage.getItem('UserID');
    this.http.get('http://203.154.83.62:1507/'+localStorage.getItem('UserID'),this.token).subscribe(response =>{
      console.log(response);
      var array = Object.values(response);
      console.log(array[0]['Firstname']);
      console.log(array[0]['Lastname']);
      this.name = array[0]['Firstname']+"   "+array[0]['Lastname']
      this.profileimg = 'http://203.154.83.62:1507/img/profile/'+array[0]['Profileimg'];
      }, error =>{
      console.log(error);
      });
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
