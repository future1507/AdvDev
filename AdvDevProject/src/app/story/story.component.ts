import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'
import { SelectItem } from 'primeng/api/selectitem';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { faPlaneSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class StoryComponent implements OnInit {
  checkeditmode = false;
  prevstory: SelectItem[];
  nextstory: SelectItem[];

  userid: any;
  storyid: any;
  storyname: any;
  storytag: any;
  ownname: any;
  previd: any;
  nextid: any;
  lenprev: any;
  lennext: any;

  commenttext: any;
  constructor(private http: HttpClient, private router: Router,
    private route: ActivatedRoute
    , private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
    this.ownid = this.route.snapshot.params['userid']
    this.storyid = this.route.snapshot.params['storyid']

    this.userid = localStorage.getItem('UserID');
    this.ShowDetailStory();
    this.ShowContent();


    this.prevstory = [];
    this.nextstory = [];


    this.showCommentDialog(this.ownid, this.storyid);

  }
  confirm(order:any) {
    this.order = order
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this content?',
      header: 'Delete Confirmation',
      accept: () => {
        this.deleteContent()
        //console.log('Yes Delete Order '+order)
        this.messageService.add({severity:'info', summary:'Confirmed', detail:'Record deleted'});
        
      },
      reject: () => {
        //console.log('No Delete Order '+order)
        this.messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
      }
    });
  }

  confirm2() {
    //this.router.navigateByUrl('/home/'+this.userid);
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this story?',
      header: 'Delete Confirmation',
      accept: () => {
        this.router.navigateByUrl('/home/'+this.userid);
        //this.router.navigateByUrl('/login');
        // this.DeletePost(this.storyid)
        // //console.log('Yes Delete Story '+this.storyid)
        // this.messageService.add({severity:'info', summary:'Confirmed', detail:'Record deleted'});   
      },
      reject: () => {
        //console.log('No Delete Story '+this.storyid)
        this.messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
      }
    });
  }

  oldprev : any
  oldnext : any
  ShowDetailStory() {
    this.http.get('http://203.154.83.62:1507/showdetailpost/' + this.storyid, this.token).subscribe(response => {
      //console.log(response)
      var array = Object.values(response);
      this.storyname = array[0]['Storyname']
      this.storytag = array[0]['Tagname']
      this.ownname = array[0]['Firstname'] + " " + array[0]['Lastname'];
      this.previd = array[0]['PrevID']
      this.nextid = array[0]['NextID']
      this.oldprev = this.previd
      this.oldnext = this.nextid

      if (this.ownid == this.userid) {
        this.ShowPrevNextStory()
      }
    }, error => {
      //console.log(error);
      this.router.navigateByUrl('/login');
      localStorage.clear();
    });
  }
  ShowPrevNextStory() {
    /* Prev */
    let json1 = {
      UserID: this.userid,
      StoryID: this.storyid,
      ConnectID: "" + this.nextid
    }
    //console.log(json1)
    this.http.post('http://203.154.83.62:1507/showprevnextpost', JSON.stringify(json1), this.token).subscribe(response => {
      //console.log(response)
      var array = Object.values(response);
      this.lenprev = array.length;
      for (let i = 0; i < array.length; i++) {
        this.prevstory.push({ label: array[i]['Storyname'], value: array[i]['StoryID'] });
      }
    }, error => {
      // //console.log(error);
      // this.router.navigateByUrl('/login');
      // localStorage.clear();
    });
    /* Prev */

    /* Next */
    let json2 = {
      UserID: this.userid,
      StoryID: this.storyid,
      ConnectID: "" + this.previd
    }
    //console.log(json1)
    this.http.post('http://203.154.83.62:1507/showprevnextpost', JSON.stringify(json2), this.token).subscribe(response => {
      //console.log(response)
      var array = Object.values(response);
      this.lennext = array.length;
      for (let i = 0; i < array.length; i++) {
        this.nextstory.push({ label: array[i]['Storyname'], value: array[i]['StoryID'] });
      }
    }, error => {
      // //console.log(error);
      // this.router.navigateByUrl('/login');
      // localStorage.clear();
    });
    /* Next */
  }

  ngOnInit(): void {


  }
  token: any;
  TokenUser(token: any) {
    const headerDict = {
      'Authorization': "Bearer " + token
    }
    const requestOptions = {
      headers: new HttpHeaders(headerDict),
    };
    return requestOptions;
  }

  displayaddText = false;
  showaddTextDialog() {
    this.text = '';
    this.displayaddText = true
  }

  displayeditText = false;
  order: any
  showeditTextDialog(text: any, order: any) {
    this.edittext = text;
    this.order = order;
    this.displayeditText = true
    //console.log(order);
  }


  displayshowPrevStory = false
  showPrevStoryDialog() {
    if (this.checkeditmode == true) {
      if (this.ownid == this.userid) {
        this.displayshowPrevStory = true
      }
    }
    else {
      if (this.previd != null) {
        this.router.navigateByUrl('/story/' + this.ownid + '/' + this.previd);
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
      }
    }
  }

  displayshowNextStory = false
  showNextStoryDialog() {
    if (this.checkeditmode == true) {
      if (this.ownid == this.userid) {
        this.displayshowNextStory = true
      }
    }
    else {
      if (this.nextid != null) {
        this.router.navigateByUrl('/story/' + this.ownid + '/' + this.nextid);
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
          return false;
        };
      }
    }

  }

  setButTrue = true;
  multiple = true;
  myUploader(event: any) {
    let uploadedFiles: any[] = [];
    for (let files of event.files) {
      uploadedFiles.push(files);
    }
    //console.log(uploadedFiles.length)
    for (let i = 0; i < uploadedFiles.length; i++) {
      let file = uploadedFiles[i];
      let formData = new FormData();
      formData.append('file', file, file.name);
      //formData.append('userid', "" + localStorage.getItem('UserID'));
      formData.append('userid', this.userid);
      formData.append('folder', this.storyid);
      this.http.post("http://203.154.83.62:1507/upload", formData)
        .subscribe(response => {
        }, err => {
          //console.log(err)
        });
    }
    this.ShowContent();
  }
  allcontent: any
  ownid = ''
  length = 0;
  ShowContent() {
    this.http.get('http://203.154.83.62:1507/showcontent/' + this.storyid, this.token).subscribe(response => {
      //console.log(response)
      this.allcontent = response;
      this.length = Object.keys(response).length;
    }, error => {
      //console.log(error);
      this.router.navigateByUrl('/login');
      localStorage.clear();
    });
  }
  text = ""
  async addContent() {
    this.displayaddText = false
    let json = {
      PostID: this.storyid,
      ContentDesc: this.text
    }
    //console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/addcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }
  edittext = ""
  async editContent() {
    this.displayeditText = false
    let json = {
      PostID: this.storyid,
      ContentDesc: this.edittext,
      ContentOrder: this.order
    }
    //console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/editcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }

  async deleteContent() {
    let json = {
      PostID: this.storyid,
      ContentOrder: this.order
    }
    //console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/deletecontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }

  async editStoryname() {
    let json = {
      StoryID: this.storyid,
      Storyname: this.storyname
    }
    //console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/editstoryname', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }

  async DeletePost(storyid: any){
    let response = await this.http.get('http://203.154.83.62:1507/deletestory/' + storyid, this.token).toPromise();
      //console.log(response);
    this.router.navigateByUrl('/home/'+this.userid);
    // this.ShowPost();
  }

  async SwapContent(i: any, di: any) {
    let before = this.allcontent[i].ContentID
    let after = this.allcontent[di].ContentID
    let source = this.allcontent[i].ContentOrder
    let dest = this.allcontent[di].ContentOrder
    //console.log("ContentID:" + before + ">>" + after);
    //console.log("ContentOrder:" + source + ">>" + dest);
    let json = {
      SourceID: before,
      DestID: after,
      SourceOrder: source,
      DestOrder: dest
    }
    //console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/swapcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }
  async SetPrevNextStory(storyid: any, type: any) {
    this.displayshowPrevStory = false
    this.displayshowNextStory = false
    //console.log(storyid + " to " + type)
    let oldid = null;
    if(type = "prev"){
      oldid = this.oldprev
    }
    else if(type = "next"){
      oldid = this.oldnext
    }
    let json = {
      StoryID: this.storyid,
      ConnectID: storyid,
      Type: type,
      OldConnectID: oldid
    }
    let response = await this.http
      .post('http://203.154.83.62:1507/setprevnextpost', JSON.stringify(json), this.token).toPromise();
    //console.log(response)
    this.prevstory = [];
    this.nextstory = [];
    this.ShowDetailStory()
  }
  allcomment: any;
  async showCommentDialog(uid: any, storyid: any) {
    this.commenttext = '';
    this.storyid = storyid;
    let response = await this.http
      .get('http://203.154.83.62:1507/showcomment/' + storyid, this.token).toPromise();
    this.allcomment = response;

  }
  displayCantComment = false;
  async AddComment() {
    let json = {
      PostID: this.storyid,
      UserID: this.userid,
      CommentDes: this.commenttext
    }
    //console.log(json)
    if (this.userid == this.ownid) {
      let response = await this.http
        .post('http://203.154.83.62:1507/addcomment', JSON.stringify(json), this.token).toPromise();
      this.showCommentDialog(this.userid, this.storyid)
    }
    else {
      let json2 = {
        UserID: this.ownid,
        FollowerID: this.userid
      }
      let response = await this.http
        .post('http://203.154.83.62:1507/followed', JSON.stringify(json2), this.token).toPromise();
      if (response.toString() == 'yes') {
        let response = await this.http
          .post('http://203.154.83.62:1507/addcomment', JSON.stringify(json), this.token).toPromise();
        this.showCommentDialog(this.userid, this.storyid)
      }
      else {
        this.displayCantComment = true;
        //console.log('please follow this user before')
      }
    }
  }
}
