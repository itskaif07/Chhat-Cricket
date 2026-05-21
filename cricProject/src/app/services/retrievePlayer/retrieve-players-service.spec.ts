import { TestBed } from '@angular/core/testing';

import { RetrievePlayersService } from './retrieve-players-service';

describe('RetrievePlayersService', () => {
  let service: RetrievePlayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrievePlayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
