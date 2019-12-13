import { Component, OnInit } from '@angular/core';
import { AdalService } from 'adal-angular4';
import { environment } from '../environments/environment';
import { DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  env = environment;
  constructor(private _adalService: AdalService) {
    if (environment.adal.enabled){
      this._adalService.init({
        clientId: environment.adal.clientId,
        popUp: window.parent !== window,
        redirectUri: `${window.location.origin}`,
        postLogoutRedirectUri: `${window.location.origin}/login`,
        cacheLocation: 'localStorage'
       });
    }
  }

  ngOnInit() {
    initializeIcons('https://static2.sharepointonline.com/files/fabric/assets/icons/');
  }
  
}
