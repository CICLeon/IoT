import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  isloading$ = new Subject<boolean>();
  show(): void {
    this.isloading$.next(true);
  }
  hide(): void {
    this.isloading$.next(false);
  }
}
