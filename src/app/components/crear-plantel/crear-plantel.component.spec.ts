import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPlantelComponent } from './crear-plantel.component';

describe('CrearPlantelComponent', () => {
  let component: CrearPlantelComponent;
  let fixture: ComponentFixture<CrearPlantelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPlantelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPlantelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
