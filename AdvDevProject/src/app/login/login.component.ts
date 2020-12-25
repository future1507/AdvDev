import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import  {Router} from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  userid:any;
  password:any;
  constructor(private http : HttpClient,private router : Router) { }

  ngOnInit(): void {
  }

  Login(){
    console.log(this.userid)
    console.log(this.password)
    let json = {
      UserID : this.userid,
      Password : this.password     
    };
    console.log(JSON.stringify(json))
    this.http.post('http://203.154.83.62:1507/login',JSON.stringify(json))
    .subscribe(response =>{
      console.log(response);
      if(response != 'Login Fail'){
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
