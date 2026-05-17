import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftoverPlayer } from './leftover-player';

describe('LeftoverPlayer', () => {
  let component: LeftoverPlayer;
  let fixture: ComponentFixture<LeftoverPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftoverPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(LeftoverPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
