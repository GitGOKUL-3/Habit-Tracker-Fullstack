import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHabitComponent } from './add-habit.component';

describe('AddHabitComponent', () => {
  let component: AddHabitComponent;
  let fixture: ComponentFixture<AddHabitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHabitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHabitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
