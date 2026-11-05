import { TestBed } from '@angular/core/testing';
import { Traductor } from './traductor';

describe('Traductor', () => {
  let service: Traductor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Traductor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
