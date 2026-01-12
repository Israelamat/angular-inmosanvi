import { Component, inject, Input, Output, signal } from '@angular/core';
import { Rating, RatingsResponse } from '../../interfaces/propoerty';
import { PropertiesService } from '../../services/properties-service';
import { StarRating } from '../../shared/star-rating/star-rating';

@Component({
  selector: 'app-property-comments',
  imports: [StarRating],
  templateUrl: './property-comments.html',
  styleUrl: './property-comments.css',
})
export class PropertyComments {
  @Input() propertyId!: number;

  private propertiesService = inject(PropertiesService);

  @Output() ratings = signal<Rating[]>([]);

  newComment = signal('');
  newRating = signal(0);

  constructor() {
    this.loadRatings();
  }

  loadRatings() {
    this.propertiesService.getPropertyRatings(this.propertyId)
      .subscribe((res: RatingsResponse) => {
        this.ratings.set(res.ratings);
      });
  }

  addRating() {
    if (this.newRating() <= 0 || this.newComment().trim() === '') return;

    this.propertiesService.addPropertyRating({
      property: this.propertyId,
      rating: this.newRating(),
      comment: this.newComment(),
    }).subscribe(() => {
      this.newComment.set('');
      this.newRating.set(0);
      this.loadRatings();
    });
  }

  setRating(value: number) {
    this.newRating.set(value);
  }
}
