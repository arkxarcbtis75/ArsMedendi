import { TestBed } from '@angular/core/testing';
import { MedicamentoApi } from './medicamento-api';

describe('MedicamentoApi', () => {
  let service: MedicamentoApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicamentoApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
