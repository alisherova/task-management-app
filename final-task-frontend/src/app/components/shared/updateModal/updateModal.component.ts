import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MainServiceService } from '../../../services/main-service.service';
import { DialogInterface } from 'src/app/interfaces/dialog.interface';

@Component({
  selector: 'app-updateModal',
  templateUrl: './updateModal.component.html',
  styleUrls: ['./updateModal.component.css'],
})
export class UpdateModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UpdateModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: DialogInterface,
    public stateService: MainServiceService
  ) {}
  public title?: string = '';
  public users?: any;
  public description?: string = ''; 
  public userShown = this.dialogData.userShown;
  public desc = this.dialogData.desc;
  ngOnInit(): void {}

  handleDialogSubmit(): void {
    this.stateService.isAsyncOperationRunning$.next(true);
    setTimeout(() => {
      this.dialogData.callbackMethod(this.title, this.description, this.users);
      this.stateService.isAsyncOperationRunning$.next(false);
    }, 500);
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
