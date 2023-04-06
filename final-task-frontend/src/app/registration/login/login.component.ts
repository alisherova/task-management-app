import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MainServiceService } from 'src/app/services/main-service.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  myLogin!: FormGroup;
  fieldTextType!: boolean;
  title = 'toaster-not';

  constructor(
    private fb: FormBuilder,
    private mainService: MainServiceService,
    private route: Router,
    private notifyService: NotificationService
  ) {}

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  ngOnInit(): void {
    this.myLogin = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onLogin() {
    this.mainService.onLogin(
      this.myLogin.value.login,
      this.myLogin.value.password
    );
  }

  get login() {
    return this.myLogin.controls['login'];
  }

  get password() {
    return this.myLogin.controls['password'];
  }
}
