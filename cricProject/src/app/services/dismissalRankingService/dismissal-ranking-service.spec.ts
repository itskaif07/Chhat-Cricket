import { TestBed } from '@angular/core/testing';

import { DismissalRankingService } from './dismissal-ranking-service';

describe('DismissalRankingService', () => {
  let service: DismissalRankingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DismissalRankingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
