import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MainServiceService } from '../../../services/main-service.service';
import { DialogInterface } from 'src/app/interfaces/dialog.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  dialogForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: DialogInterface,
    public stateService: MainServiceService,
    private fb: FormBuilder
  ) {}
  public userShown = this.dialogData.userShown;
  public desc = this.dialogData.desc;
  ngOnInit(): void {
    this.dialogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      users: [[], [Validators.required]],
    });
  }

  get title() {
    return this.dialogForm.controls['title'];
  }
  get description() {
    return this.dialogForm?.controls['description'];
  }
  get users() {
    return this.dialogForm?.controls['users'];
  }

  handleDialogSubmit(): void {
    this.stateService.isAsyncOperationRunning$.next(true);
    setTimeout(() => {
      this.dialogData.callbackMethod(
        this.dialogForm.value.title,
        this.dialogForm.value.description,
        this.dialogForm.value.users
      );
      this.stateService.isAsyncOperationRunning$.next(false);
    }, 500);
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
