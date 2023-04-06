import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogComponent } from '../components/shared/dialog/dialog.component';
import { DialogInterface } from '../interfaces/dialog.interface';
import { MainServiceService } from '../services/main-service.service';
import { NotificationService } from '../services/notification.service';
import { ConfirmationComponent } from '../components/shared/confirmation/confirmation.component';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { UpdateModalComponent } from '../components/shared/updateModal/updateModal.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  lists: any[] = [];
  boardId: string | null = null;
  editTitle: any = {};
  editCard: any = {};
  boardTitle: string = '';
  boardInfo: any = null;
  titleChanged = false;
  listCards: any[] = [];
  columnForm!: FormGroup;
  currentUser = localStorage.getItem('currentUser');
  currentUserId = '';
  constructor(
    public dialog: MatDialog,
    private mainService: MainServiceService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotificationService
  ) {}

  async ngOnInit() {
    this.boardId = await this.route.snapshot.paramMap.get('id');

    this.columnForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      users: ['', [Validators.required]],
    });

    if (this.boardId) {
      await this.mainService.getSpecificBoard(this.boardId).subscribe(
        (res: any) => {
          this.boardTitle = res.title;
        },
        (err: HttpErrorResponse) => {
          if (err.error.statusCode === 401 || err.error.statusCode === 400) {
            this.notifyService.showError(err.error.message);
          }
        }
      );

      await this.mainService
        .getBoardsLists(this.boardId)
        .subscribe((res: any) => {
          this.lists = res;
          for (let list of this.lists) {
            this.mainService.getListCards(this.boardId!, list._id).subscribe(
              (res: any) => {
                this.listCards[list._id] = res;
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
    }
  }

  async deleteList(id: string) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Are you sure you want to delete this column?',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Delete',
      callbackMethod: () => {
        this.mainService
          .deleteBoardlist(this.boardId!, id)
          .subscribe((res: any) => {
            this.lists = this.lists.filter((list) => list._id !== res._id);
          });
      },
    };
    this.dialog.open(ConfirmationComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  addList(listsLength: number) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Create a new column.',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Submit',
      callbackMethod: (title) => {
        this.mainService
          .addBoardList(this.boardId!, title, listsLength)
          .subscribe((res: any) => {
            console.log(res, 'add list res');
            this.notifyService.showSuccess('New column added successfully');
            this.lists.push(res);
          });
      },
    };
    this.dialog.open(DialogComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  logOut() {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Are you sure you want to log out?',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'log out',
      callbackMethod: () => {
        localStorage.clear();
        this.router.navigateByUrl('/login');
        this.notifyService.showWarning('The user has been logged out.');
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
            dialogHeader: 'Are you sure you want to delete?',
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

  updateList(defaultTitle: string, columnId: any) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Update the column.',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Update',
      defaultTitle,
      callbackMethod: (title) => {
        this.lists.forEach((list) => {
          if (list._id === columnId) {
            console.log(list);
            this.mainService
              .updateBoardList(title, list.order, this.boardId!, columnId)
              .subscribe((res: any) => {
                this.lists = this.lists.map((list) => {
                  if (list._id === columnId) {
                    list.title = res.title;
                    return list;
                  }
                  return list;
                });

                if (HttpStatusCode.Accepted === 202) {
                  this.notifyService.showSuccess(
                    'The column is updated successfully'
                  );
                }
              });
          }
        });
      },
    };
    this.dialog.open(UpdateModalComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  addTask(listsLength: number, id: any) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Create a new task.',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Submit',
      userShown: true,
      desc: true,
      callbackMethod: (title, description, users) => {
        this.mainService
          .addListCard(
            this.boardId!,
            id,
            title,
            listsLength,
            description!,
            listsLength,
            users!
          )
          .subscribe((res: any) => {
            this.notifyService.showSuccess('New task added successfully');
            this.listCards[id].push(res);
          });
      },
    };
    this.dialog.open(DialogComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  async deleteTask(columnId: any, cardId: any) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Are you sure you want to delete this task?',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Delete',
      callbackMethod: () => {
        this.mainService
          .deleteCard(this.boardId!, columnId, cardId)
          .subscribe((res: any) => {
            this.listCards[columnId] = this.listCards[columnId].filter(
              (card: any) => card._id !== res._id
            );
          });
      },
    };
    this.dialog.open(ConfirmationComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  updateCard(
    defaultTitle: string,
    defaultDescription: string,
    columnId: any,
    listId: any
  ) {
    const dialogInterface: DialogInterface = {
      dialogHeader: 'Update the column.',
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Update',
      defaultTitle,
      defaultDescription,
      desc: true,
      callbackMethod: (title, desc) => {
        this.listCards[columnId].forEach((list: any) => {
          if (list._id === listId) {
            this.mainService
              .updateCard(
                list.boardId,
                list.columnId,
                list._id,
                title,
                list.order,
                desc!,
                list.userId,
                list.users
              )
              .subscribe((res: any) => {
                this.listCards[columnId] = this.listCards[columnId].map(
                  (card: any) => {
                    if (card._id === listId) {
                      console.log(res.title);
                      card.title = res.title;
                      card.description = res.description;
                      return card;
                    }
                    return card;
                  }
                );

                if (HttpStatusCode.Accepted === 202) {
                  this.notifyService.showSuccess(
                    'The task is updated successfully'
                  );
                }
              });
          }
        });
      },
    };
    this.dialog.open(UpdateModalComponent, {
      width: '300px',
      data: dialogInterface,
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.mainService
      .orderTasks(
        event.item.data._id,
        event.item.data.order,
        event.container.id
      )
      .subscribe((res: any) => {
        // this.listCards[columnId] = this.listCards[columnId].filter(
        //   (card: any) => card._id !== res._id
        // );
        console.log(res);
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((item) => {
      item.unsubscribe();
    });
  }
}
