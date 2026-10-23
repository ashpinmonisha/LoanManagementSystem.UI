import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanModelTs } from './loan.model.ts';

describe('LoanModelTs', () => {
  let component: LoanModelTs;
  let fixture: ComponentFixture<LoanModelTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanModelTs],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanModelTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
