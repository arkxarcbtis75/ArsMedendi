import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscadorComponent } from './buscador';

describe('BuscadorComponent', () => {
  let component: BuscadorComponent;
  let fixture: ComponentFixture<BuscadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscadorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});