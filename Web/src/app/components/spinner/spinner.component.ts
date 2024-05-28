import { Component, inject } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  template: `<div class="spinner" *ngIf="spinnerServices.isloading$ | async"><i class="pi pi-spin pi-spinner text-white font-bold" style="font-size: 2.5rem"></i></div>`,
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
  spinnerServices = inject(SpinnerService)
}
