import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhasDenunciasComponent } from './minhas-denuncias.component';

describe('MinhasDenunciasComponent', () => {
  let component: MinhasDenunciasComponent;
  let fixture: ComponentFixture<MinhasDenunciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MinhasDenunciasComponent]
    });
    fixture = TestBed.createComponent(MinhasDenunciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
