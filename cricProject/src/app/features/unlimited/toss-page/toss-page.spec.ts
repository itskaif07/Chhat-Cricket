import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TossPage } from './toss-page';

describe('TossPage', () => {
  let component: TossPage;
  let fixture: ComponentFixture<TossPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TossPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TossPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
