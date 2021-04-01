import { Component, OnInit } from '@angular/core';
import { DatapassService } from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'
import { HttpHeaders } from '@angular/common/http';
import { faComment, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { SelectItem } from 'primeng/api/selectitem';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class ProfileComponent implements OnInit {
  iconlike = faThumbsUp;
  comment = faComment;
  token: any;
  setButTrue = true;
  selfid: any;
  uid: any;
  tags: SelectItem[];
  privacy: SelectItem[];
  manage: SelectItem[];
  constructor(private http: HttpClient, private router: Router,
    public data: DatapassService, private route: ActivatedRoute
    , private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.manage = [
      { label: 'แก้ไข', value: 'edit' },
      { label: 'ลบ', value: 'del' },
    ];
    this.tags = [
      { label: 'ศิลปะ', value: '1' },
      { label: 'การออกแบบ', value: '2' },
      { label: 'นิยาย', value: '3' },
      { label: 'ดนตรี', value: '4' },
      { label: 'ท่องเที่ยว', value: '5' }
    ];

    this.privacy = [
      { label: 'public', value: 'public' },
      { label: 'follower', value: 'follower' },
      { label: 'private', value: 'private' }
    ];
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
    this.selfid = localStorage.getItem('UserID');
    this.uid = this.route.snapshot.params['id'];
    console.log(this.selfid + "  " + this.uid)
    if (this.selfid != this.uid) {
      this.User();
      this.Followed();
      this.AmontFollow();
    }
    else {
      this.ShowPost();
      this.AmontFollow();
    }
  }
  confirm(storyid: any) {
    // this.order = order
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this story?',
      header: 'Delete Confirmation',
      accept: () => {
        this.DeletePost(storyid)
        console.log('Yes Delete Order '+storyid)
        this.messageService.add({severity:'info', summary:'Confirmed', detail:'Record deleted'});
        
      },
      reject: () => {
        console.log('No Delete Order '+storyid)
        this.messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
      }
    });
    this.slmanage = '';
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
      if(array[0]['Profileimg'] != null){
        this.profile = 'http://203.154.83.62:1507/img/profile/' + array[0]['Profileimg']
      }
      else{
        this.profile = "https://tcc-chaokoh.com/themes/default/asset/images/icon-user-default.png"
      }
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
    formData.append('folder', 'profile');
    formData.append('userid', "" + localStorage.getItem('UserID'));
    this.http.post("http://203.154.83.62:1507/upload", formData)
      .subscribe(response => {
        this.uploadedFiles = [];
        console.log(response)
        localStorage.setItem('Profileimg', (response).toString());
        this.profile = 'http://203.154.83.62:1507/img/profile/' + localStorage.getItem('Profileimg')
        window.location.reload();
      }, err => {
        console.log(err)
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
  GotoUser(userid : any){
    console.log('Go to '+userid)
    this.displayFollowing = false;
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    //this.router.navigateByUrl('/profile/'+userid);
    //window.location.reload();
  }
  allpost: any;                                  
  // Storyname = [];
  // StoryDesc = [];
  // UserID = [];
  ShowPost() {
    if (this.selfid == this.uid) {
      this.http.get('http://203.154.83.62:1507/showselfpost/' + this.selfid, this.token).subscribe(response => {
        console.log(response)
        this.allpost = response;
        this.length = Object.keys(response).length;
        this.SetisLike();
      }, error => {
        console.log(error);
        this.router.navigateByUrl('/login');
        localStorage.clear();
      });
    }
    else {
      let json = {
        SelfID: this.selfid,
        UserID: this.uid,
        IsFollow: this.followtext
      }
      console.log(this.followtext)
      this.http.post('http://203.154.83.62:1507/showsomeonepost', JSON.stringify(json), this.token).subscribe(response => {
        console.log(response)
        this.allpost = response;
        this.length = Object.keys(response).length;
        this.SetisLike();
      }, error => {
        console.log(error);
        this.router.navigateByUrl('/login');
        localStorage.clear();
      });
    }
  }
  async Followed() {
    let json = {
      UserID: this.uid,
      FollowerID: this.selfid
    }
    let response = await this.http
      .post('http://203.154.83.62:1507/followed', JSON.stringify(json), this.token).toPromise();
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
    this.ShowPost();
  }
  async AmontFollow() {
    let response = await this.http
      .get('http://203.154.83.62:1507/follow/' + this.uid, this.token).toPromise();
    console.log(response);
    var array = Object.values(response);
    this.follower = +array[0];
    this.following = +array[1];
  }
  displayFollowing = false;
  displayFollower = false;
  allfollower: any;
  allfollowing: any;
  showFollowerDialog() {
    this.displayFollower = true;
    this.http.get('http://203.154.83.62:1507/follower/' + this.uid, this.token).subscribe(response => {
      console.log(response)
      this.allfollower = response;

    }, error => {
      console.log(error);
      this.router.navigateByUrl('/login');
      localStorage.clear();
    });
  }
  showFollowingDialog() {
    this.displayFollowing = true;
    this.http.get('http://203.154.83.62:1507/following/' + this.uid, this.token).subscribe(response => {
      console.log(response)
      this.allfollowing = response;

    }, error => {
      console.log(error);
      this.router.navigateByUrl('/login');
      localStorage.clear();
    });
  }
  amountlike = 1
  numamountlike = 0;
  length = 0
  islike: any
  iconstyles: any
  SetisLike() {
    this.iconstyles = new Array(this.length).fill("width: 20px;")
    this.islike = new Array(this.length).fill(false)
    for (let i = 0; i < this.length; i++) {
      //console.log(this.allpost[i].Islike)
      if (this.allpost[i].Islike == 1) {
        this.iconstyles[i] = "width: 20px;color: dodgerblue;";
        this.islike[i] = true;
        this.allpost[i].Islike == 'YES'
      }
      else {
        this.allpost[i].Islike == 'NO'
      }
    }
  }
  Like(i: any, storyid: any, amountlike: any) {
    this.islike[i] = !this.islike[i];
    this.numamountlike = 0;
    if (this.islike[i] == false) {
      //amountlike -= 1;
      this.numamountlike = parseInt(amountlike);
      this.numamountlike -= 1;
      this.allpost[i].AmountOfLikes = this.numamountlike;
      this.iconstyles[i] = "width: 20px;";
      this.allpost[i].Islike = 'NO'
      console.log('unlike');
    }
    else {
      this.numamountlike = parseInt(amountlike);
      this.numamountlike += 1;
      this.allpost[i].AmountOfLikes = this.numamountlike;
      this.iconstyles[i] = "width: 20px;color: dodgerblue;";
      this.allpost[i].Islike = 'YES'
      console.log('like');
    }
    let json = {
      UserID: localStorage.getItem('UserID'),
      PostID: storyid,
      choice: this.allpost[i].Islike
    }
    console.log(json);
    this.http.post('http://203.154.83.62:1507/like', JSON.stringify(json), this.token).subscribe(response => {
      console.log(response)
    }, error => {
      console.log(error);
    });
    //console.log(i + " " + this.iconstyles)
  }
  commenttext = '';
  displayCantComment = false;
  display = false;
  allcomment : any;
  async showCommentDialog(uid: any,storyid : any) {
    this.commenttext = '';
    this.storyid = storyid;
    if (this.selfid == uid) {
      this.display = true;
      let response = await this.http
        .get('http://203.154.83.62:1507/showcomment/'+storyid, this.token).toPromise();
      this.allcomment = response;
    }
    else {
      let json = {
        UserID: uid,
        FollowerID: this.selfid
      }
      let response = await this.http
        .post('http://203.154.83.62:1507/followed', JSON.stringify(json), this.token).toPromise();
      if (response.toString() == 'yes') {
        this.display = true;
        let response = await this.http
        .get('http://203.154.83.62:1507/showcomment/'+storyid, this.token).toPromise();
        this.allcomment = response;
      }
      else {
        this.displayCantComment = true;
        console.log('please follow this user before')
      }
    }
  }
  async AddComment(){
    let json = {
      PostID : this.storyid,
      UserID : this.selfid,
      CommentDes : this.commenttext
    }
    console.log(json)
    let response = await this.http
        .post('http://203.154.83.62:1507/addcomment', JSON.stringify(json), this.token).toPromise();
    this.showCommentDialog(this.selfid,this.storyid)
  }
  storyname: any
  tag = '';
  target = '';
  storydesc: any
  coverphoto: any
  storyid: any
  slmanage = '';
  displayBasic2: boolean = false;
  async ManagePost(storyid: any, storyname: any, tag: any, target: any, storydesc: any, coverphoto: any) {
    if (this.slmanage == 'del') {
      this.confirm(storyid);
    }
    else if (this.slmanage == 'edit') {
      this.displayBasic2 = true;
      this.storyname = storyname;
      this.tag = tag;
      this.target = target;
      this.storydesc = storydesc;
      this.coverphoto = coverphoto;
      this.storyid = storyid;
      this.slmanage = '';
    }
  }
  uploadedCoverFiles: any[] = [];
  setButCoverTrue = true;
  formData = new FormData();
  UploadCoverPhoto(event: any) {
    console.log('upload');
    for (let files of event.files) {
      this.uploadedCoverFiles.push(files);
    }
    const file = this.uploadedCoverFiles[0];
    this.formData.append('file', file, file.name);
    this.formData.append('folder', 'coverphoto');
  }
  async DeletePost(storyid: any){
    let response = await this.http.get('http://203.154.83.62:1507/deletestory/' + storyid, this.token).toPromise();
      console.log(response);
    this.ShowPost();
  }
  async EditPost() {
    let json = {
      Storyname: this.storyname,
      Tag: this.tag,
      Targetgroup: this.target,
      StoryDesc: this.storydesc,
      StoryID: this.storyid
    };
    console.log(json);
    let response = await this.http.post('http://203.154.83.62:1507/editstory', JSON.stringify(json), this.token).toPromise();
    this.displayBasic2 = false;
    this.ShowPost();
    console.log(response);
    if (this.uploadedCoverFiles[0] != null) {
      this.formData.append('storyid', "" + this.storyid);
      this.http.post("http://203.154.83.62:1507/upload", this.formData)
        .subscribe(response => {
          this.uploadedCoverFiles = [];
          this.displayBasic2 = false;
          this.ShowPost();
          //window.location.reload();
        }, err => {
      });
    }
  }
}
