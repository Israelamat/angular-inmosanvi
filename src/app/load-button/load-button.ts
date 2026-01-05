import { Component, input } from '@angular/core';

@Component({
  selector: 'app-load-button',
  imports: [],
  templateUrl: './load-button.html',
  styleUrl: './load-button.css',
})
export class LoadButton {
  colorClass = input('btn-primary');
  loading = input(false);
   type = input<'button' | 'submit'>('button');
}
