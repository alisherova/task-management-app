import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../components/shared/dialog/dialog.component';
import { DialogInterface } from 'src/app/interfaces/dialog.interface';
import { MainServiceService } from '../services/main-service.service';
import { NotificationService } from '../services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationComponent } from '../components/shared/confirmation/confirmation.component';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { UpdateModalComponent } from '../components/shared/updateModal/updateModal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent {
  boards: any[] = [];
  currentUser: any = {};
  boardId: string | null = null;
  editTitle: any = {};
  editCard: any = {};
  boardInfo: any = null;
  titleChanged = false;
  currentDate = new Date();

  constructor(
    public dialog: MatDialog,
    private mainService: MainServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotificationService,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }
  useLanguage(language: string): void {
    this.translate.use(language);
  }

  ngOnInit(): void {
    this.mainService.getUsers().subscribe((users) => {
      users.filter((user: any) => {
        if (user.login === localStorage.getItem('currentUser')) {
          this.currentUser = user;
          this.mainService.getSpecificBoard(this.currentUser.name).subscribe(
            (res: any) => {
              this.boards = res;
            },
            (err: HttpErrorResponse) => {
              if (
                err.error.statusCode === 401 ||
                err.error.statusCode === 400
              ) {
                this.notifyService.showError(err.error.message);
              }
            }
          );
        }
      });
    });
  }

  addBoard() {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Create a new board.',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Submit',
      userShown: true,
      callbackMethod: (title, desc, users: any) => {
        this.mainService
          .startBoard(title, this.currentUser.name, users)
          .subscribe(
            (res: any) => {
              this.mainService
                .getSpecificBoard(res.owner)
                .subscribe((res: any) => {
                  this.boards = res;
                });
              if (HttpStatusCode.Accepted === 202) {
                this.notifyService.showSuccess(
                  'The board is created successfully'
                );
              }
            },
            (err: HttpErrorResponse) => {
              if (err.error.statusCode === 400) {
                this.notifyService.showError(err.error.message);
              }
            }
          );
        if (this.boards.length > 0) {
          const newBoard = this.boards.pop();
          if (newBoard) {
            this.router.navigateByUrl(`/boards/${newBoard._id}`);
          }
        }
      },
    };
    this.dialog.open(DialogComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  updateBoard(defaultTitle: any, defaultUsers: any, id: any) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Update the board.',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Update',
      defaultTitle,
      defaultUsers,
      callbackMethod: (title) => {
        this.mainService
          .updateBoard(title, this.currentUser.name, defaultUsers, id)
          .subscribe(
            (res: any) => {
              this.boards = this.boards.map((board) => {
                if (board._id === id) {
                  board = res;
                  return board;
                }
                return board;
              });

              if (HttpStatusCode.Accepted === 202) {
                this.notifyService.showSuccess(
                  'The board is updated successfully'
                );
              }
            },
            (err: HttpErrorResponse) => {
              if (err.error.statusCode === 400) {
                this.notifyService.showError(err.error.message);
              }
            }
          );
      },
    };
    this.dialog.open(UpdateModalComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  async deleteBoard(id: any) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Are you sure you want to delete this board?',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Delete',
      callbackMethod: () => {
        this.mainService.deleteBoard(id).subscribe((res) => {
          this.boards = this.boards.filter((board) => board._id !== res._id);
          this.notifyService.showWarning('The board has been deleted.');
        });
      },
    };
    this.dialog.open(ConfirmationComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  async deleteUser() {
    this.mainService.getUsers().subscribe((users) => {
      users.filter((user: any) => {
        if (user.login === localStorage.getItem('currentUser')) {
          const dialogInterface: DialogInterface = {
            dialogHeader: 'Are you sure you want to log out?',
            cancelButtonLabel: 'Cancel',
            confirmButtonLabel: 'log out',
            callbackMethod: () => {
              this.mainService.deleteUser(user._id);
              this.notifyService.showWarning('The user has been deleted.');
            },
          };
          this.dialog.open(ConfirmationComponent, {
            width: '300px',
            data: dialogInterface,
          });
        }
      });
    });
  }
}
