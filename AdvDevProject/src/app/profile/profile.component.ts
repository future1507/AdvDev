import { Component, OnInit } from '@angular/core';
import { DatapassService } from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  token: any;
  setButTrue = true;
  selfid: any;
  uid: any;
  constructor(private http: HttpClient, private router: Router,
    public data: DatapassService, private route: ActivatedRoute) {
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
    this.selfid = localStorage.getItem('UserID');
    this.uid = this.route.snapshot.params['id'];
    console.log(this.selfid + "  " + this.uid)
    if (this.selfid != this.uid) {
      this.User();
      this.Followed();
    }
    this.AmontFollow();
    this.ShowPost();
  }
  profile = 'http://203.154.83.62:1507/img/profile/' + localStorage.getItem('Profileimg')
  fname = localStorage.getItem('Firstname');
  lname = localStorage.getItem('Lastname');
  birthday = localStorage.getItem('Birthday');
  udesc = localStorage.getItem('UserDesc');
  country = localStorage.getItem('Country');
  skills = localStorage.getItem('Skills');
  phone = localStorage.getItem('Phone');
  mail = localStorage.getItem('Mail');
  fb = localStorage.getItem('Facebook');
  twitter = localStorage.getItem('Twitter');
  ngOnInit(): void {
  }
  name = this.fname + " " + this.lname;


  User() {
    console.log(localStorage.getItem('TOKEN'));
    //console.log(localStorage.getItem('UserID'));

    this.http.get('http://203.154.83.62:1507/' + this.route.snapshot.params['id'], this.token).subscribe(response => {
      console.log(response);
      var array = Object.values(response);
      console.log(array[0]['Firstname']);
      console.log(array[0]['Lastname']);
      this.name = array[0]['Firstname'] + "   " + array[0]['Lastname']
      this.profile = 'http://203.154.83.62:1507/img/profile/' + array[0]['Profileimg']
      var d = new Date(array[0]['Birthday']);
      this.birthday = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear()
      this.udesc = array[0]['UserDesc'];
      this.country = array[0]['Country'];
      this.skills = array[0]['Skills'];
      this.phone = array[0]['Phone'];
      this.mail = array[0]['Mail'];
      this.fb = array[0]['Facebook'];
      this.twitter = array[0]['Twitter'];
    }, error => {
      console.log(error);
    });
  }
  TokenUser(token: any) {
    const headerDict = {
      'Authorization': "Bearer " + token
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    return requestOptions;
  }
  uploadedFiles: any[] = [];
  myUploader(event: any) {
    for (let files of event.files) {
      this.uploadedFiles.push(files);
    }
    const file = this.uploadedFiles[0];
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('userid', "" + localStorage.getItem('UserID'));
    formData.append('folder', 'profile');
    this.http.post("http://203.154.83.62:1507/upload", formData)
      .subscribe(response => {
        this.uploadedFiles = [];
        //this.upload_img = (response).toString();
        localStorage.setItem('Profileimg', (response).toString());
        window.location.reload();
      }, err => {
        //handle error
      });

  }
  followbtcolor = 'btn btn-outline-primary';
  followtext = 'Follow';
  isfollow = false;
  follower = 0;
  following = 0;
  SwitchFollow() {
    this.isfollow = !this.isfollow;
    if (this.isfollow == false) {
      this.follower -= 1;
      this.followbtcolor = 'btn btn-outline-primary';
      this.followtext = 'Follow';
    }
    else {
      this.follower += 1;
      this.followbtcolor = 'btn btn-primary';
      this.followtext = 'Followed';

    }
    let json = {
      UserID: this.uid,
      FollowerID: this.selfid,
      choice: this.followtext
    }
    this.http.post('http://203.154.83.62:1507/follow', JSON.stringify(json), this.token).subscribe(response => {
      console.log(response)
    }, error => {
      console.log(error);
    });
  }

  allpost: any;
  Storyname = [];
  StoryDesc = [];
  UserID = [];
  ShowPost() {
    if (this.selfid == this.uid) {
      this.http.get('http://203.154.83.62:1507/showselfpost/' + this.selfid, this.token).subscribe(response => {
        console.log(response)
        this.allpost = response;
      }, error => {
        console.log(error);
        this.router.navigateByUrl('/login');
        localStorage.clear();
      });
    }
    else{
      this.http.get('http://203.154.83.62:1507/showpost/' + this.uid, this.token).subscribe(response => {
        console.log(response)
        this.allpost = response;
      }, error => {
        console.log(error);
        this.router.navigateByUrl('/login');
        localStorage.clear();
      });
    }

  }
  Followed() {
    let json = {
      UserID: this.uid,
      FollowerID: this.selfid
    }
    this.http.post('http://203.154.83.62:1507/followed', JSON.stringify(json), this.token).subscribe(response => {
      if (response.toString() == 'yes') {
        this.followbtcolor = 'btn btn-primary';
        this.followtext = 'Followed';
        this.isfollow = true;
      }
      else {
        this.followbtcolor = 'btn btn-outline-primary';
        this.followtext = 'Follow';
        this.isfollow = false;
      }
      console.log('follow : ' + response)
    }, error => {
      console.log(error);
    });
  }
  async AmontFollow() {
    let response = await this.http
      .get('http://203.154.83.62:1507/follower/' + this.uid, this.token).toPromise();
    console.log(response);
    var array = Object.values(response);
    this.follower = +array[0]['Follower'];
    this.following = +array[0]['Following'];
  }
}
