import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class MainServiceService {
  public isAsyncOperationRunning$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public user = '';
  constructor(
    private http: HttpClient,
    private route: Router,
    private notifyService: NotificationService
  ) {}

  onLogin(login: string, password: string) {
    this.http
      .post('http://localhost:3000/auth/signin', {
        login,
        password,
      })
      .subscribe(
        (res: any) => {
          if (HttpStatusCode.Accepted === 202) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('currentUser', login);
            this.user = login;
            this.notifyService.showSuccess('You are logged in successfully');
            this.route.navigateByUrl('/board');
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error.statusCode === 401 || err.error.statusCode === 400) {
            this.notifyService.showError(err.error.message);
          }
        }
      );
  }

  onSignup(name: string, login: string, password: string) {
    this.http
      .post('http://localhost:3000/auth/signup', {
        name,
        login,
        password,
      })
      .subscribe(
        (res: any) => {
          if (HttpStatusCode.Accepted === 202) {
            this.notifyService.showSuccess('You are signed up successfully');
            this.route.navigateByUrl('/login');
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error.statusCode === 409 || err.error.statusCode === 400) {
            this.notifyService.showError(err.error.message);
          }
        }
      );
  }

  deleteUser(userId: string) {
    this.http.delete(`http://localhost:3000/users/${userId}`).subscribe(
      (res: any) => {
        if (HttpStatusCode.Accepted === 202) {
          this.notifyService.showSuccess('You are logged out successfully');
          this.route.navigateByUrl('');
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error.statusCode === 409 || err.error.statusCode === 400) {
          this.notifyService.showError(err.error.message);
        }
      }
    );
  }

  getUsers(): Observable<any> {
    return this.http.get('http://localhost:3000/users');
  }

  // Board CRUD

  startBoard(title: string, owner: string, users: any[]): Observable<any> {
    return this.http.post('http://localhost:3000/boards', {
      title,
      owner,
      users,
    });
  }

  getBoards(): Observable<any> {
    return this.http.get('http://localhost:3000/boards');
  }

  getSpecificBoard(signedUserId: any) {
    return this.http.get(`http://localhost:3000/boardsSet/${signedUserId}`);
  }

  updateBoard(title: any, owner: any, users: any, boardId: string) {
    return this.http.put(`http://localhost:3000/boards/${boardId}`, {
      title,
      owner,
      users,
    });
  }

  deleteBoard(boardId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/boards/${boardId}`);
  }

  // lists CRUD

  getBoardsLists(boardId: string) {
    return this.http.get(`http://localhost:3000/boards/${boardId}/columns`);
  }

  addBoardList(boardId: string, title: string, order: number): Observable<any> {
    return this.http.post(`http://localhost:3000/boards/${boardId}/columns`, {
      title: title,
      order: order,
    });
  }

  updateBoardList(
    title: string,
    order: number,
    boardId: string,
    columnId: string
  ): Observable<any> {
    return this.http.put(
      `http://localhost:3000/boards/${boardId}/columns/${columnId}`,
      {
        title: title,
        order: order,
      }
    );
  }

  deleteBoardlist(boardId: string, columnId: string): Observable<any> {
    return this.http.delete(
      `http://localhost:3000/boards/${boardId}/columns/${columnId}`
    );
  }

  // Task Cards CRUD

  getListCards(boardId: string, columnId: string) {
    return this.http.get(
      `http://localhost:3000/boards/${boardId}/columns/${columnId}/tasks`
    );
  }

  addListCard(
    boardId: string,
    columnId: string,
    title: string,
    order: number,
    description: string,
    userId: number,
    users: any[]
  ): Observable<any> {
    return this.http.post(
      `http://localhost:3000/boards/${boardId}/columns/${columnId}/tasks`,
      {
        title,
        order,
        description,
        userId,
        users,
      }
    );
  }

  updateCard(
    boardId: string,
    columnId: string,
    taskId: string,
    title: string,
    order: number,
    description: string,
    userId: number,
    users: any[]
  ): Observable<any> {
    return this.http.put(
      `http://localhost:3000/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      {
        title: title,
        order: order,
        description,
        userId,
        columnId,
        users,
      }
    );
  }

  deleteCard(
    boardId: string,
    columnId: string,
    taskId: string
  ): Observable<any> {
    return this.http.delete(
      `http://localhost:3000/boards/${boardId}/columns/${columnId}/tasks/${taskId}`
    );
  }

  orderTasks(_id: string, order: number, columnId: string): Observable<any> {
    return this.http.patch(`http://localhost:3000/tasksSet`, [
      {
        _id,
        order,
        columnId,
      },
    ]);
  }
}
