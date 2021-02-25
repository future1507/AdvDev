import { Component, OnInit } from '@angular/core';
import {DatapassService} from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import  {ActivatedRoute, Router} from '@angular/router'
import { HttpHeaders } from '@angular/common/http';
import { faCog, faImage } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  iconimg = faImage;
  iconset = faCog;
  tags: any[];
  privacy: any[];
  manage: any[];
  items: any[] ;
  token : any;
  constructor(private http : HttpClient,private router : Router,
    public data : DatapassService,private route : ActivatedRoute,) {
      this.token = this.TokenUser(localStorage.getItem('TOKEN'));
      this.User();
      
      this.items = [];
        for (let i = 0; i < 10000; i++) {
            this.items.push({label: 'Item ' + i, value: 'Item ' + i});
        }
      this.tags = [
        {name: 'ศิลปะ', code: 'NY'},
        {name: 'ดนตรี', code: 'RM'},
        {name: 'นิยาย', code: 'LDN'},
        {name: 'ท่องเที่ยว', code: 'IST'},
        {name: 'ออกแบบ', code: 'PRS'}
      ];
      this.privacy = [
        {name: 'public', code: 'pb'},
        {name: 'private', code: 'pv'},
        {name: 'protected', code: 'pt'},
      ];
      this.manage = [
        {name: 'ลบ', code: 'del'},
        {name: 'แก้ไข', code: 'edi'},
        {name: 'แก้ไขความเป็นส่วนตัว', code: 'pri'},
      ];
     }

  ngOnInit(): void {
  }
 
  displayBasic: boolean = false;
  display: boolean = false;
  fname : any;
  lname : any;
  name : any;
  userid : any;
  profileimg = 'https://tcc-chaokoh.com/themes/default/asset/images/icon-user-default.png'
  User(){
    console.log(localStorage.getItem('TOKEN'));
    this.userid  = localStorage.getItem('UserID');
    this.http.get('http://203.154.83.62:1507/'+localStorage.getItem('UserID'),this.token).subscribe(response =>{
      console.log(response);
      var array = Object.values(response);
      var bday = new Date(array[0]['Birthday']);
      localStorage.setItem('Profileimg',this.CheckNull(array[0]['Profileimg']));
      localStorage.setItem('Firstname',array[0]['Firstname']);
      localStorage.setItem('Lastname',array[0]['Lastname']);
      localStorage.setItem('Birthday',bday.getFullYear()+'-'+bday.getMonth()+'-'+bday.getDate());
      localStorage.setItem('UserDesc',this.CheckNull(array[0]['UserDesc']));
      localStorage.setItem('Country',this.CheckNull(array[0]['Country']));
      localStorage.setItem('Skills',this.CheckNull(array[0]['Skills']));
      localStorage.setItem('Phone',this.CheckNull(array[0]['Phone']));
      localStorage.setItem('Mail',this.CheckNull(array[0]['Mail']));
      localStorage.setItem('Facebook',this.CheckNull(array[0]['Facebook']));
      localStorage.setItem('Twitter',this.CheckNull(array[0]['Twitter']));
      this.name = array[0]['Firstname']+"   "+array[0]['Lastname']
      console.log('profileid = '+array[0]['Profileimg']);
      if(array[0]['Profileimg'] !=null && array[0]['Profileimg'] !='' && array[0]['Profileimg'] !='null'){
        this.profileimg = 'http://203.154.83.62:1507/img/profile/'+array[0]['Profileimg'];
      }
      else{
        console.log('profile=null');
      }
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
  CheckNull(data:any){
    if(data == null||data == 'null'){
      return '';
    }
    else{
      return data;
    } 
  }
  showDialog() {
    this.display = true;
  }
  showBasicDialog() {
    this.displayBasic = true;
  }
  
  
}

