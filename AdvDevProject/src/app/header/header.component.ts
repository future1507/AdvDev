import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router) { 
    
  }

  ngOnInit(): void {
  }
  userid = localStorage.getItem('UserID');
  token = localStorage.getItem('TOKEN');
  Logout(){
    this.router.navigateByUrl('/login');
    localStorage.clear();
  }

}
