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
      this.token = this.TokenUser(this.data.token);
      this.User();
     }

  ngOnInit(): void {
  }
  fname : any;
  lname : any;
  name : any;
  User(){
    console.log(this.data.token);
    this.http.get('http://203.154.83.62:1507/'+this.data.userid,this.token).subscribe(response =>{
      console.log(response);
      var array = Object.values(response);
      console.log(array[0]['Firstname']);
      console.log(array[0]['Lastname']);
      this.name = array[0]['Firstname']+"   "+array[0]['Lastname']
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
