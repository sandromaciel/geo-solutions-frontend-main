import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthTabsComponent } from '../../components/auth-tabs/auth-tabs.component';
import { SigninFormComponent } from '../../components/signin-form/signin-form.component';
import { SignupFormComponent } from '../../components/signup-form/signup-form.component';
import { IllustrationComponent } from '../../components/illustration/illustration.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  providers: [MessageService, ToastModule],
  imports: [
    ToastModule,
    CommonModule,
    AuthTabsComponent,
    ReactiveFormsModule,
    SigninFormComponent,
    SignupFormComponent,
    IllustrationComponent,
  ],
  templateUrl: './signin.component.html',
})
export class SigninComponent implements OnInit {
  public activeTab: 'signup' | 'login' = 'login';

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  public setActiveTab(tab: 'signup' | 'login') {
    this.activeTab = tab;
  }

  private listenToRouteChanges() {
    this.activatedRoute.url.subscribe((url) => {
      url[0].path === 'signup'
        ? this.setActiveTab('signup')
        : this.setActiveTab('login');
    });
  }

  public ngOnInit(): void {
    this.listenToRouteChanges();
  }
}
