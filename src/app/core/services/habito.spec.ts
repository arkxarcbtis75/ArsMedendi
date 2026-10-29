import { TestBed } from '@angular/core/testing';
import { Habito } from './habito';

describe('Habito', () => {
  let service: Habito;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Habito);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
