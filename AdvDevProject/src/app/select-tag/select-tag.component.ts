import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-select-tag',
  templateUrl: './select-tag.component.html',
  styleUrls: ['./select-tag.component.css']
})
export class SelectTagComponent implements OnInit {
  clicktag = [false,false,false,false,false];
  tag :any=[];
  constructor() { 
    this.tag[0] = null;
    this.tag[1] = null;
    this.tag[2] = null;
    this.tag[3] = null;
    this.tag[4] = null;
  }

  ngOnInit(): void {
  }
  ChooseTag(tag:boolean,index:any){
    this.clicktag[index] = tag;
    console.log("Tag "+(index+1)+" = "+tag);
    this.tag[index+1] = index+1;
  }
}
