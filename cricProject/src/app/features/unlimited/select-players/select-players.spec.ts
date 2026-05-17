import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPlayers } from './select-players';

describe('SelectPlayers', () => {
  let component: SelectPlayers;
  let fixture: ComponentFixture<SelectPlayers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPlayers],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectPlayers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
