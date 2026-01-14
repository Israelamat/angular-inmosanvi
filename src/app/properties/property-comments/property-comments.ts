import { Component, effect, inject, input, Input, Output, Signal, signal } from '@angular/core';
import { Rating, RatingsResponse } from '../../interfaces/propoerty';
import { PropertiesService } from '../../services/properties-service';
import { StarRating } from '../../shared/star-rating/star-rating';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-property-comments',
  imports: [StarRating],
  templateUrl: './property-comments.html',
  styleUrl: './property-comments.css',
})
export class PropertyComments {
  propertyId = input.required<number>();
  private propertiesService = inject(PropertiesService);

  @Input() size: 'small' | 'large' = 'small';
  @Output() ratings = signal<Rating[]>([]);

  newComment = signal('');
  newRating = signal(0);
  rating = 0;
  stars = [1, 2, 3, 4, 5];

  constructor() {
    effect(() => {
      this.loadRatings(this.propertyId());
    });
  }


  loadRatings(id: number) {
    this.propertiesService.getPropertyRatings(id)
      .subscribe((res: RatingsResponse) => {
        this.ratings.set(res.ratings);
      });
  }

  addRating() {
    if (this.newRating() <= 0 || this.newComment().trim() === ''){
      Swal.fire('Error', 'Please enter a rating and comment', 'error');
      return;
    }
    this.propertiesService.addPropertyRating({
      property: this.propertyId(),
      rating: this.newRating(),
      comment: this.newComment(),
    }).subscribe(() => {
      this.newComment.set('');
      this.newRating.set(0);
      this.loadRatings(this.propertyId());
    });
  }

  setRating(star: number) {
    this.newRating.set(star);
  }
}
