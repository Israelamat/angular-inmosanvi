import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  imports: [],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  @Input() ratings = 0; 
  @Input() size: 'small' | 'large' = 'small';
  @Input() interactive = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  onClick(value: number) {
    if (!this.interactive) return;
    this.ratingChange.emit(value);
  }

  starClass(val: number) {
    return val <= Math.round(this.ratings) ? 'text-yellow-400' : 'text-gray-300';
  }

  setRating(value: number) {
    if (!this.interactive) return;
    this.ratingChange.emit(value);
  }
}
