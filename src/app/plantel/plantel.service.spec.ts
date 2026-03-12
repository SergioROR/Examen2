import { TestBed } from '@angular/core/testing';

import { PlantelService } from './plantel.service';

describe('PlantelService', () => {
  let service: PlantelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
