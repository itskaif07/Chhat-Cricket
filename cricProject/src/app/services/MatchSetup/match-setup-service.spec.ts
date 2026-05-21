import { TestBed } from '@angular/core/testing';

import { MatchSetupService } from './match-setup-service';

describe('MatchSetupService', () => {
  let service: MatchSetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchSetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
