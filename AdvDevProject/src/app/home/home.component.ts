import { Component, OnInit } from '@angular/core';
import {DatapassService} from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import  {ActivatedRoute, Router} from '@angular/router'
import { HttpHeaders } from '@angular/common/http';
import { faCog, faImage } from '@fortawesome/free-solid-svg-icons';
import { SelectItem } from 'primeng/api/selectitem';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  iconimg = faImage;
  iconset = faCog;
  tags:  SelectItem[];
  privacy: SelectItem[];
  manage: SelectItem[];
  token : any;
  constructor(private http : HttpClient,private router : Router,
    public data : DatapassService,private route : ActivatedRoute,) {
      this.token = this.TokenUser(localStorage.getItem('TOKEN'));
      this.User();
      this.ShowPost();
      
      
      this.tags = [
        {label: 'ศิลปะ', value: '1'},
        {label: 'การออกแบบ', value: '2'},
        {label: 'นิยาย', value: '3'},
        {label: 'ดนตรี', value: '4'},
        {label: 'ท่องเที่ยว', value: '5'}
      ];
      
      this.privacy = [
        {label: 'public', value: 'public'},
        {label: 'private', value: 'private'}
      ];
      this.manage = [
        {label: 'ลบ', value: 'del'},
        {label: 'แก้ไข', value: 'edit'},
        {label: 'แก้ไขความเป็นส่วนตัว', value: 'pri'},
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
      localStorage.setItem('Tag1',(array[0]['Tag1']));
      localStorage.setItem('Tag2',(array[0]['Tag2']));
      localStorage.setItem('Tag3',(array[0]['Tag3']));
      localStorage.setItem('Tag4',(array[0]['Tag4']));
      localStorage.setItem('Tag5',(array[0]['Tag5']));
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
  allpost :any ;
  Storyname = [];
  StoryDesc = [];
  StoryID = [];
  UserID = [];

  async ShowPost(){
    this.allpost = undefined;
    let json = {
      UserID : localStorage.getItem('UserID'),
      Tag1 : localStorage.getItem('Tag1'),
      Tag2 : localStorage.getItem('Tag2'),
      Tag3 : localStorage.getItem('Tag3'),
      Tag4 : localStorage.getItem('Tag4'),
      Tag5 : localStorage.getItem('Tag5')
    };
    let response = await this.http
      .post('http://203.154.83.62:1507/showpost',JSON.stringify(json),this.token).toPromise();
    console.log(response);
    this.allpost = response;
    return response;
}
  storyname : any
  tag = '';
  target = '';
  storydesc : any
  coverphoto : any
  async CreatePost(){
    let json = {
      Storyname : this.storyname,
      UserID : this.userid,
      Tag : this.tag,
      Targetgroup : this.target,
      StoryDesc : this.storydesc,
      Coverphoto : null
    };
    console.log(json)
    let response = await this.http.post('http://203.154.83.62:1507/newstory',JSON.stringify(json),this.token).toPromise();
    this.displayBasic = false;
    console.log(response);
}
  slmanage = '';
  async ManagePost(storyid:any){
    if(this.slmanage =='del'){
      let response = await this.http.get('http://203.154.83.62:1507/deletestory/'+storyid,this.token).toPromise();
      console.log(response);
    }
  }
}

