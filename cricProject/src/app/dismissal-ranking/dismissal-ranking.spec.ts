import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DismissalRanking } from './dismissal-ranking';

describe('DismissalRanking', () => {
  let component: DismissalRanking;
  let fixture: ComponentFixture<DismissalRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DismissalRanking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DismissalRanking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
