import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, 
  FormGroup, 
  Validators,
} from '@angular/forms'; 
import { MainServiceService } from 'src/app/services/main-service.service'; 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  myForm!: FormGroup;
  fieldTextType!: boolean;
  secondFieldTextType!: boolean;
  passwordMatch: boolean = true;

  constructor(
    private fb: FormBuilder,
    private mainService: MainServiceService, 
  ) {}

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleSecondFieldTextType() {
    this.secondFieldTextType = !this.secondFieldTextType;
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  checkPassword() {
    if (this.myForm.value.password !== this.myForm.value.confirmPassword) {
      this.passwordMatch = false;
    } else {
      this.passwordMatch = true;
    }
  }

  async onSignup() {
    await this.mainService.onSignup(
      this.myForm.value.name,
      this.myForm.value.login,
      this.myForm.value.password
    );
  }

  get name() {
    return this.myForm.controls['name'];
  }
  get login() {
    return this.myForm.controls['login'];
  }
  get password() {
    return this.myForm.controls['password'];
  }
  get confirmPassword() {
    return this.myForm.controls['confirmPassword'];
  }
}
