import { Component, OnInit, ɵCompiler_compileModuleAndAllComponentsSync__POST_R3__ } from '@angular/core';
import { DatapassService } from '../datapass.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'
import { HttpHeaders } from '@angular/common/http';
//import { faCog, faComment, faImage, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faComment, faImage, faThumbsDown, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { SelectItem } from 'primeng/api/selectitem';
import { ConfirmationService, MessageService } from 'primeng/api';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class HomeComponent implements OnInit {
  iconimg = faImage;
  iconlike = faThumbsUp;
  comment = faComment;
  tags: SelectItem[];
  privacy: SelectItem[];
  manage: SelectItem[];
  token: any;
  constructor(private http: HttpClient, private router: Router,
    public data: DatapassService, private route: ActivatedRoute
    , private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
    this.User();
    //console.log(localStorage.getItem('TOKEN'));

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
    this.manage = [
      { label: 'แก้ไข', value: 'edit' },
      { label: 'ลบ', value: 'del' },
    ];
  }
  confirm(storyid: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this story?',
      header: 'Delete Confirmation',
      accept: () => {
        this.DeletePost(storyid)
        //console.log('Yes Delete Order ' + storyid)
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' });

      },
      reject: () => {
        //console.log('No Delete Order ' + storyid)
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      }
    });
    this.slmanage = '';
  }
  ngOnInit(): void {
  }

  displayBasic: boolean = false;
  displayBasic2: boolean = false;
  display: boolean = false;
  fname: any;
  lname: any;
  name: any;
  userid: any;
  profileimg = 'https://tcc-chaokoh.com/themes/default/asset/images/icon-user-default.png'
  tag1: any;
  tag2: any;
  tag3: any;
  tag4: any;
  tag5: any;
  User() {
    this.userid = localStorage.getItem('UserID');
    this.http.get('http://203.154.83.62:1507/' + localStorage.getItem('UserID'), this.token).subscribe(response => {
      //console.log(response);
      var array = Object.values(response);
      var bday = new Date(array[0]['Birthday']);
      localStorage.setItem('Profileimg', this.CheckNull(array[0]['Profileimg']));
      localStorage.setItem('Firstname', array[0]['Firstname']);
      localStorage.setItem('Lastname', array[0]['Lastname']);
      localStorage.setItem('Birthday', bday.getFullYear() + '-' + "0" + bday.getMonth() + '-' + bday.getDate());
      localStorage.setItem('UserDesc', this.CheckNull(array[0]['UserDesc']));
      localStorage.setItem('Country', this.CheckNull(array[0]['Country']));
      localStorage.setItem('Skills', this.CheckNull(array[0]['Skills']));
      localStorage.setItem('Phone', this.CheckNull(array[0]['Phone']));
      localStorage.setItem('Mail', this.CheckNull(array[0]['Mail']));
      localStorage.setItem('Facebook', this.CheckNull(array[0]['Facebook']));
      localStorage.setItem('Twitter', this.CheckNull(array[0]['Twitter']));
      localStorage.setItem('Tag1', (array[0]['Tag1']));
      localStorage.setItem('Tag2', (array[0]['Tag2']));
      localStorage.setItem('Tag3', (array[0]['Tag3']));
      localStorage.setItem('Tag4', (array[0]['Tag4']));
      localStorage.setItem('Tag5', (array[0]['Tag5']));
      this.tag1 = (array[0]['Tag1']);
      this.tag2 = (array[0]['Tag2']);
      this.tag3 = (array[0]['Tag3']);
      this.tag4 = (array[0]['Tag4']);
      this.tag5 = (array[0]['Tag5']);
      this.name = array[0]['Firstname'] + "   " + array[0]['Lastname']
      //console.log('profileid = ' + array[0]['Profileimg']);
      if (array[0]['Profileimg'] != null && array[0]['Profileimg'] != '' && array[0]['Profileimg'] != 'null') {
        this.profileimg = 'http://203.154.83.62:1507/img/profile/' + array[0]['Profileimg'];
      }
      else {
        //console.log('profile=null');
      }
      this.ShowPost();
    }, error => {
      //console.log(error);
      this.router.navigateByUrl('/login');
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
  CheckNull(data: any) {
    if (data == null || data == 'null') {
      return '';
    }
    else {
      return data;
    }
  }
  commenttext = '';
  displayCantComment = false;
  allcomment: any;
  async showCommentDialog(uid: any, storyid: any) {
    this.commenttext = '';
    this.storyid = storyid;
    if (this.userid == uid) {
      this.display = true;
      let response = await this.http
        .get('http://203.154.83.62:1507/showcomment/' + storyid, this.token).toPromise();
      this.allcomment = response;
    }
    else {
      let json = {
        UserID: uid,
        FollowerID: this.userid
      }
      let response = await this.http
        .post('http://203.154.83.62:1507/followed', JSON.stringify(json), this.token).toPromise();
      if (response.toString() == 'yes') {
        this.display = true;
        let response = await this.http
          .get('http://203.154.83.62:1507/showcomment/' + storyid, this.token).toPromise();
        this.allcomment = response;
      }
      else {
        this.displayCantComment = true;
        //console.log('please follow this user before')
      }
    }
  }
  async AddComment() {
    let json = {
      PostID: this.storyid,
      UserID: this.userid,
      CommentDes: this.commenttext
    }
    //console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/addcomment', JSON.stringify(json), this.token).toPromise();
    this.showCommentDialog(this.userid, this.storyid)
  }
  showBasicDialog() {
    this.displayBasic = true;
    this.uploadedFiles.pop;
    this.storyname = "";
    this.tag = "";
    this.target = "";
    this.storydesc = "";
    this.coverphoto = "";
    //this.storyid = storyid;
  }
  allpost: any;

  async ShowPost() {
    this.allpost = undefined;
    let json = {
      UserID: localStorage.getItem('UserID'),
      Tag1: localStorage.getItem('Tag1'),
      Tag2: localStorage.getItem('Tag2'),
      Tag3: localStorage.getItem('Tag3'),
      Tag4: localStorage.getItem('Tag4'),
      Tag5: localStorage.getItem('Tag5')
    };
    //console.log(json);
    let response = await this.http
      .post('http://203.154.83.62:1507/showpost', JSON.stringify(json), this.token).toPromise();
    //console.log(response);
    this.allpost = response;
    this.length = Object.keys(response).length;
    this.SetisLike();
    return response;
  }
  storyname = '';
  tag = '';
  target = '';
  storydesc: any
  coverphoto: any
  storyid: any
  displaynewpost = false
  async CreatePost() {
    if (this.storyname == '' || this.tag == '' || this.target == '') {
      this.displaynewpost = true
    }
    else {
      let json = {
        Storyname: this.storyname,
        UserID: this.userid,
        Tag: this.tag,
        Targetgroup: this.target,
        StoryDesc: this.storydesc,
        Coverphoto: null
      };
      //console.log(json)
      let response = await this.http.post('http://203.154.83.62:1507/newstory', JSON.stringify(json), this.token).toPromise();
      this.displayBasic = false;
      //console.log(response);
      if (this.uploadedFiles[this.uploadedFiles.length - 1] != null) {
        this.formData.append('storyid', "" + response);
        this.http.post("http://203.154.83.62:1507/upload", this.formData)
          .subscribe(response => {
            this.uploadedFiles = [];
            this.formData = new FormData();
            this.displayBasic2 = false;
            window.location.reload()
            this.ShowPost();
          }, err => {
            //handle error
          });
      }
      else {
        this.ShowPost();
      }
    }

  }
  async EditPost() {
    let json = {
      Storyname: this.storyname,
      Tag: this.tag,
      Targetgroup: this.target,
      StoryDesc: this.storydesc,
      StoryID: this.storyid
    };
    //console.log(json);
    let response = await this.http.post('http://203.154.83.62:1507/editstory', JSON.stringify(json), this.token).toPromise();
    this.displayBasic2 = false;
    this.ShowPost();
    //console.log(response);
    if (this.uploadedFiles2[this.uploadedFiles2.length - 1] != null) {
      this.formData2.append('storyid', "" + this.storyid);
      this.http.post("http://203.154.83.62:1507/upload", this.formData2)
        .subscribe(response => {
          //this.uploadedFiles = [];
          this.formData2 = new FormData();
          this.displayBasic2 = false;
          window.location.reload()
          this.ShowPost();
        }, err => {
        });
    }
  }
  slmanage = '';
  // Estoryname :any;
  // Etag :any;
  // Etarget :any;
  // Estorydesc :any;
  // Ecoverphoto :any;
  // Estoryid :any;
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
  async DeletePost(storyid: any) {
    let response = await this.http.get('http://203.154.83.62:1507/deletestory/' + storyid, this.token).toPromise();
    //console.log(response);
    this.ShowPost();
  }
  uploadedFiles: any[] = [];
  setButTrue = true;
  formData = new FormData();
  UploadCoverPhoto(event: any) {
    //console.log('upload');
    this.formData = new FormData();
    for (let files of event.files) {
      this.uploadedFiles.push(files);
    }
    //console.log(this.uploadedFiles.length)
    let file = this.uploadedFiles[this.uploadedFiles.length - 1];
    this.formData.append('file', file, file.name);
    this.formData.append('folder', 'coverphoto');
  }

  uploadedFiles2: any[] = [];
  setButTrue2 = true;
  formData2 = new FormData();
  UploadEditCoverPhoto(event: any) {
    //console.log('upload');
    this.formData2 = new FormData();
    for (let files of event.files) {
      this.uploadedFiles2.push(files);
    }
    //console.log(this.uploadedFiles2.length)
    let file = this.uploadedFiles2[this.uploadedFiles2.length - 1];
    this.formData2.append('file', file, file.name);
    this.formData2.append('folder', 'coverphoto');
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
      ////console.log(this.allpost[i].Islike)
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
      //console.log('unlike');
    }
    else {
      this.numamountlike = parseInt(amountlike);
      this.numamountlike += 1;
      this.allpost[i].AmountOfLikes = this.numamountlike;
      this.iconstyles[i] = "width: 20px;color: dodgerblue;";
      this.allpost[i].Islike = 'YES'
      //console.log('like');
    }
    let json = {
      UserID: localStorage.getItem('UserID'),
      PostID: storyid,
      choice: this.allpost[i].Islike
    }
    //console.log(json);
    this.http.post('http://203.154.83.62:1507/like', JSON.stringify(json), this.token).subscribe(response => {
      //console.log(response)
    }, error => {
      //console.log(error);
    });
    ////console.log(i + " " + this.iconstyles)
  }
  searchtext = '';
  async Search(){
    let json = {
      UserID : this.userid,
      Search : this.searchtext
    }
    //console.log(json);
    let response = await this.http
      .post('http://203.154.83.62:1507/search', JSON.stringify(json), this.token).toPromise();
    //console.log(response);
    this.allpost = response;
    this.length = Object.keys(response).length;
    this.SetisLike();
  }
}

