import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})
export class StoryComponent implements OnInit {

  userid : any;
  storyid : any;
  constructor(private http: HttpClient,private router: Router,
  private route: ActivatedRoute) { 
    this.token = this.TokenUser(localStorage.getItem('TOKEN'));
    this.ownid = this.route.snapshot.params['userid']
    this.storyid = this.route.snapshot.params['storyid']
    this.userid = localStorage.getItem('UserID');
    this.ShowContent();
  }
  token: any;
  ngOnInit(): void {
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

  displayaddText = false;
  showaddTextDialog() {
    this.text = '';
    this.displayaddText = true
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
  allcontent : any
  ownid = ''
  length = 0;
  storyname = ''
  ShowContent(){
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
  async addContent(){
    this.displayaddText = false
    let json = {
      PostID : this.storyid,
      ContentDesc : this.text
    }
    console.log(json)
    let response = await this.http
        .post('http://203.154.83.62:1507/addcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }
  async SwapContent(i:any,di:any){
    let before = this.allcontent[i].ContentID
    let after = this.allcontent[di].ContentID
    let source = this.allcontent[i].ContentOrder
    let dest = this.allcontent[di].ContentOrder
    console.log("ContentID:"+before+">>"+after);
    console.log("ContentOrder:"+source+">>"+dest);
    let json = {
      SourceID : before,
      DestID : after,
      SourceOrder : source,
      DestOrder : dest
    }
    console.log(json)
    let response = await this.http
        .post('http://203.154.83.62:1507/swapcontent', JSON.stringify(json), this.token).toPromise();
    this.ShowContent()
  }

}
