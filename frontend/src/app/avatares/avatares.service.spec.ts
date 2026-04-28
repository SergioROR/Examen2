import { TestBed } from '@angular/core/testing';

import { AvataresService } from './avatares.service';

describe('AvataresService', () => {
  let service: AvataresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvataresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
