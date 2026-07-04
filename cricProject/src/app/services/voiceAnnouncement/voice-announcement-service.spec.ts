import { TestBed } from '@angular/core/testing';

import { VoiceAnnouncementService } from './voice-announcement-service';

describe('VoiceAnnouncementService', () => {
  let service: VoiceAnnouncementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoiceAnnouncementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
