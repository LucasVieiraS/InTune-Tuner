import { TestBed } from '@angular/core/testing';

import { MetronomeService } from './metronome.service';

describe('MetronomeService', () => {
  let service: MetronomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetronomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
