import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePedidosComponent } from './detalle-pedidos.component';

describe('DetallePedidosComponent', () => {
  let component: DetallePedidosComponent;
  let fixture: ComponentFixture<DetallePedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
