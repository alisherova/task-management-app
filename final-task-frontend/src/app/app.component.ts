import { Component } from '@angular/core';
import { FaConfig } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'final_task_angular';
  constructor(private faConfig: FaConfig, private translate: TranslateService) {
    this.faConfig.defaultPrefix = 'far';
    translate.setDefaultLang('en');
    translate.use('en');
  }
}
