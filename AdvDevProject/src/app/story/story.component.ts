import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'
import { SelectItem } from 'primeng/api/selectitem';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})
export class StoryComponent implements OnInit {

  prevstory: SelectItem[];
  nextstory: SelectItem[];

  userid: any;
  storyid: any;
  storyname: any;
  previd: any;
  nextid: any;
  lenprev : any;
  lennext : any;

  constructor(private http: HttpClient, private router: Router,
    private route: ActivatedRoute) {
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
    this.ownid = this.route.snapshot.params['userid']
    this.storyid = this.route.snapshot.params['storyid']
    this.userid = localStorage.getItem('UserID');
    this.ShowDetailStory();
    this.ShowContent();

    this.prevstory = [];
    this.nextstory = [];


  }
  ShowDetailStory() {
    this.http.get('http://203.154.83.62:1507/showdetailpost/' + this.storyid, this.token).subscribe(response => {
      console.log(response)
      var array = Object.values(response);
      this.storyname = array[0]['Storyname']
      this.previd = array[0]['PrevID']
      this.nextid = array[0]['NextID']
      /* Prev */
      let json1 = {
        UserID: this.userid,
        StoryID: this.storyid,
        ConnectID: ""+this.previd
      }
      console.log(json1)
      this.http.post('http://203.154.83.62:1507/showprevnextpost', JSON.stringify(json1), this.token).subscribe(response => {
        console.log(response)
        var array = Object.values(response);
        this.lenprev = array.length;
        for (let i = 0; i < array.length; i++) {
          this.prevstory.push({ label: array[i]['Storyname'], value: array[i]['StoryID'] });
        }
      }, error => {
        // console.log(error);
        // this.router.navigateByUrl('/login');
        // localStorage.clear();
      });
      /* Prev */

      /* Next */
      let json2 = {
        UserID: this.userid,
        StoryID: this.storyid,
        ConnectID: ""+this.nextid
      }
      console.log(json1)
      this.http.post('http://203.154.83.62:1507/showprevnextpost', JSON.stringify(json2), this.token).subscribe(response => {
        console.log(response)
        var array = Object.values(response);
        this.lennext = array.length;
        for (let i = 0; i < array.length; i++) {
          this.nextstory.push({ label: array[i]['Storyname'], value: array[i]['StoryID'] });
        }
      }, error => {
        // console.log(error);
        // this.router.navigateByUrl('/login');
        // localStorage.clear();
      });
      /* Next */
    }, error => {
      console.log(error);
      this.router.navigateByUrl('/login');
      localStorage.clear();
    });
  }
  // ShowPrevNextStory(connectid: any) {
  //   let connectstory: SelectItem[];
  //   let json = {
  //     UserID: this.userid,
  //     StoryID: this.storyid,
  //     ConnectID: connectid
  //   }
  //   this.http.post('http://203.154.83.62:1507/showprevnextpost/', JSON.stringify(json), this.token).subscribe(response => {
  //     console.log(response)
  //     var array = Object.values(response);
  //     for (let i = 0; i < array.length; i++) {
  //       connectstory.push({ label: array[i]['Storyname'], value: array[i]['StoryID'] });
  //     }
  //     return connectstory
  //   }, error => {
  //     console.log(error);
  //     this.router.navigateByUrl('/login');
  //     localStorage.clear();
  //   });
  // }

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

  displayshowPrevStory = false
  showPrevStoryDialog() {
    if(this.ownid == this.userid){
      this.displayshowPrevStory = true
    }
    
  }

  displayshowNextStory = false
  showNextStoryDialog() {
    if(this.ownid == this.userid){
      this.displayshowNextStory = true
    }
  }

  setButTrue = true;
  multiple = true;
  myUploader(event: any) {
    let uploadedFiles: any[] = [];
    for (let files of event.files) {
      uploadedFiles.push(files);
    }
    console.log(uploadedFiles.length)
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
          console.log(err)
        });
    }
    this.ShowContent();
  }
  allcontent: any
  ownid = ''
  length = 0;
  ShowContent() {
    this.http.get('http://203.154.83.62:1507/showcontent/' + this.storyid, this.token).subscribe(response => {
      console.log(response)
      this.allcontent = response;
      this.length = Object.keys(response).length;
    }, error => {
      console.log(error);
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
    console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/addcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }
  async SwapContent(i: any, di: any) {
    let before = this.allcontent[i].ContentID
    let after = this.allcontent[di].ContentID
    let source = this.allcontent[i].ContentOrder
    let dest = this.allcontent[di].ContentOrder
    console.log("ContentID:" + before + ">>" + after);
    console.log("ContentOrder:" + source + ">>" + dest);
    let json = {
      SourceID: before,
      DestID: after,
      SourceOrder: source,
      DestOrder: dest
    }
    console.log(json)
    let response = await this.http
      .post('http://203.154.83.62:1507/swapcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }

}
