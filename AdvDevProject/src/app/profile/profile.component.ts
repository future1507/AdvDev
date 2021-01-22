import { Component, OnInit } from '@angular/core';
import {DatapassService} from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import  {ActivatedRoute, Router} from '@angular/router'
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  token : any;
  constructor(private http : HttpClient,private router : Router,
    public data : DatapassService,private route : ActivatedRoute) { 
      this.token = this.TokenUser(this.data.token);
      this.User();
    }

  ngOnInit(): void {
  }
  name : any;
  birthday : any;
  User(){
    console.log(this.data.token);
    this.http.get('http://203.154.83.62:1507/'+this.data.userid,this.token).subscribe(response =>{
      console.log(response);
      var array = Object.values(response);
      console.log(array[0]['Firstname']);
      console.log(array[0]['Lastname']);
      this.name = array[0]['Firstname']+"   "+array[0]['Lastname']
      var d = new Date(array[0]['Birthday']);
      this.birthday = d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()
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
