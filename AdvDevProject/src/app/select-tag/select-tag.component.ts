import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import  {ActivatedRoute,Router} from '@angular/router'

@Component({
  selector: 'app-select-tag',
  templateUrl: './select-tag.component.html',
  styleUrls: ['./select-tag.component.css']
})
export class SelectTagComponent implements OnInit {
  clicktag = [false,false,false,false,false];
  tag :any=[];
  countag = 0;
  constructor(private http : HttpClient,private router : Router,private route : ActivatedRoute) { 
    this.tag[0] = null;
    this.tag[1] = null;
    this.tag[2] = null;
    this.tag[3] = null;
    this.tag[4] = null;
  }

  ngOnInit(): void {
  }
  ChooseTag(tag:boolean,index:any){
    //this.clicktag[index] = tag;
    //console.log("Tag "+(index)+" = "+tag);
    if(this.clicktag[index-1] == true){
      this.tag[index-1] = null;
      this.clicktag[index-1] = false;
      this.countag -= 1;
    }
    else{
      this.tag[index-1] = index;
      this.clicktag[index-1] = true;
      this.countag += 1;
    }
    ////console.log(this.clicktag[index-1])
    //console.log(this.countag)
  }
  display = false
  async SaveTag(){
    //console.log(this.countag)
    if(this.countag>=1){
      let json = {
        UserID : this.route.snapshot.params['id'],
        Tag1 : this.tag[0],
        Tag2 : this.tag[1],
        Tag3 : this.tag[2],
        Tag4 : this.tag[3], 
        Tag5 : this.tag[4]
      };
      //console.log(json);
      let response = await this.http.post('http://203.154.83.62:1507/choosetag',JSON.stringify(json)).toPromise();
      this.router.navigateByUrl('/login');
      //console.log(response);
    }
    else{
      this.display = true;
    }
  }
  
}
