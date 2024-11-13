import { TestBed } from '@angular/core/testing';

import { RandomCodeService } from './random-code.service';

describe('RandomCodeService', () => {
  let service: RandomCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
