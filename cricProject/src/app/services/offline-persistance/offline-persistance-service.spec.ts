import { TestBed } from '@angular/core/testing';

import { OfflinePersistanceService } from './offline-persistance-service';

describe('OfflinePersistanceService', () => {
  let service: OfflinePersistanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflinePersistanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
