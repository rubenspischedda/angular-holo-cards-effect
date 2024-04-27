import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  dialogOpen = signal(false);

  constructor() { }

  openDialog() {
    this.dialogOpen.set(true);
  }

  closeDialog() {
    this.dialogOpen.set(false);
  }
}
