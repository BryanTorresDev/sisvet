import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Pago, Cita } from '../../services/data';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagos-page">
      <div class="page-header">
        <div class="header-text">
          <h2>Transacciones y Pagos</h2>
          <p>Registro de comprobantes e ingresos financieros en SisVet</p>
        </div>
        <button (click)="openAddModal()" class="btn btn-primary">
          <span>+ Registrar Pago</span>
        </button>
      </div>

      <!-- Date Filter Controls -->
      <div class="card flex flex-row items-center gap-md" style="padding: 1rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0; display: flex; flex-direction: row; align-items: center; gap: 0.5rem;">
          <label for="filtroFecha" style="margin: 0; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; white-space: nowrap;">Consultar pagos por fecha:</label>
          <input 
            type="date" 
            id="filtroFecha" 
            [(ngModel)]="filterDate" 
            (ngModelChange)="applyDateFilter()"
            class="form-control" 
            style="max-width: 200px; padding: 0.5rem 1rem; height: 38px; border-radius: 8px;">
        </div>
        <button 
          *ngIf="filterDate" 
          (click)="clearDateFilter()" 
          class="btn btn-secondary" 
          style="padding: 0.5rem 1rem; height: 38px; border-radius: 8px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">
          Limpiar Filtro
        </button>
      </div>

      <!-- Table Card -->
      <div class="card table-card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Cita ID</th>
                <th>Monto</th>
                <th>Método de Pago</th>
                <th>Número de Operación</th>
                <th>Fecha de Pago</th>
                <th>Observaciones</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredPagos()">
                <td>Cita #{{ p.idCita }}</td>
                <td style="font-weight: 700; color: var(--accent-success);">S/ {{ p.monto.toFixed(2) }}</td>
                <td>
                  <span class="payment-method">{{ p.metodoPago }}</span>
                </td>
                <td>{{ p.numeroOperacion || '-' }}</td>
                <td>{{ formatDate(p.fechaPago) }}</td>
                <td>{{ p.observaciones || '-' }}</td>
                <td>
                  <span class="badge badge-success">{{ p.estado }}</span>
                </td>
                <td style="text-align: right;">
                  <button 
                    (click)="emitirComprobante(p)" 
                    class="btn btn-secondary" 
                    style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">receipt</span>
                    Comprobante
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredPagos().length === 0">
                <td colspan="8" class="text-center" style="padding: 3rem;">
                  No se encontraron registros de pagos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Add Pago -->
      <div *ngIf="isModalOpen()" class="modal-backdrop">
        <div class="modal-card card" style="max-width: 480px;">
          <div class="modal-header">
            <h3>Registrar Pago de Cita</h3>
            <button (click)="closeModal()" class="close-btn">&times;</button>
          </div>
          
          <form (ngSubmit)="savePago()" #pagoForm="ngForm" class="modal-body">
            <div class="form-group">
              <label for="cita">Cita Médica</label>
              <select 
                id="cita" 
                name="idCita" 
                [(ngModel)]="activePago.idCita" 
                required 
                class="form-control">
                <option [value]="0" disabled>Seleccione una cita...</option>
                <option *ngFor="let c of appointments()" [value]="c.idCita">
                  Cita #{{ c.idCita }} - {{ c.nombreMascota }} (Servicio: {{ c.nombreServicio }})
                </option>
              </select>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label for="monto">Monto (S/)</label>
                <input 
                  type="number" 
                  step="0.01"
                  id="monto" 
                  name="monto" 
                  [(ngModel)]="activePago.monto" 
                  required 
                  class="form-control" 
                  placeholder="0.00">
              </div>

              <div class="form-group">
                <label for="metodo">Método de Pago</label>
                <select 
                  id="metodo" 
                  name="metodoPago" 
                  [(ngModel)]="activePago.metodoPago" 
                  required 
                  class="form-control">
                  <option value="" disabled>Seleccione...</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="numOp">Número de Operación</label>
              <input 
                type="text" 
                id="numOp" 
                name="numeroOperacion" 
                [(ngModel)]="activePago.numeroOperacion" 
                required 
                class="form-control" 
                placeholder="Ej. YAPE-12345678, TRANS-998877">
            </div>

            <div class="form-group">
              <label for="obs">Observaciones</label>
              <textarea 
                id="obs" 
                name="observaciones" 
                [(ngModel)]="activePago.observaciones" 
                rows="3"
                class="form-control" 
                placeholder="Detalle adicional..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="!pagoForm.valid" class="btn btn-primary">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pagos-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-text h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .header-text p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .payment-method {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .modal-card {
      width: 100%;
      max-width: 600px;
      padding: 2rem;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.75rem;
      cursor: pointer;
      line-height: 1;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.25rem;
      margin-top: 1rem;
    }
  `]
})
export class PagosComponent implements OnInit {
  pagos = signal<Pago[]>([]);
  filteredPagos = signal<Pago[]>([]);
  appointments = signal<Cita[]>([]);

  // Filtering by date
  filterDate = '';

  // Modal state
  isModalOpen = signal(false);
  
  activePago: Pago = this.getEmptyPago();

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadPagos();
    this.loadAppointments();
  }

  loadPagos(): void {
    this.dataService.getPagos().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.pagos.set(res.data.content);
          this.applyDateFilter();
        }
      }
    });
  }

  loadAppointments(): void {
    this.dataService.getCitas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          // List appointments
          this.appointments.set(res.data.content);
        }
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr ?? '';
    }
  }

  getEmptyPago(): Pago {
    return {
      idCita: 0,
      monto: 0,
      metodoPago: '',
      numeroOperacion: '',
      observaciones: ''
    };
  }

  openAddModal(): void {
    this.activePago = this.getEmptyPago();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  savePago(): void {
    this.dataService.createPago(this.activePago).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadPagos();
          this.closeModal();
        }
      }
    });
  }

  applyDateFilter(): void {
    if (!this.filterDate) {
      this.filteredPagos.set(this.pagos());
      return;
    }
    
    const filterYMD = this.filterDate; // YYYY-MM-DD
    const list = this.pagos().filter(p => {
      if (!p.fechaPago) return false;
      // Get YYYY-MM-DD of payment date
      const dateYMD = p.fechaPago.substring(0, 10);
      return dateYMD === filterYMD;
    });
    this.filteredPagos.set(list);
  }

  clearDateFilter(): void {
    this.filterDate = '';
    this.applyDateFilter();
  }

  emitirComprobante(pago: Pago): void {
    // Find matching appointment details
    const appt = this.appointments().find(a => a.idCita === pago.idCita);
    const petName = appt ? appt.nombreMascota : 'Mascota';
    const vetName = appt ? appt.nombreVeterinario : 'Veterinario';
    const serviceName = appt ? appt.nombreServicio : 'Servicio Médico';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceNum = `VET-${String(pago.idPago || Math.floor(Math.random() * 100000)).padStart(6, '0')}`;
    const dateStr = pago.fechaPago ? this.formatDate(pago.fechaPago) : this.formatDate(new Date().toISOString());

    const content = `
      <html>
        <head>
          <title>Comprobante de Pago ${invoiceNum}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; padding: 30px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .header-table td { padding: 5px; vertical-align: top; }
            .logo { font-size: 28px; font-weight: bold; color: #6200ee; }
            .invoice-title { font-size: 20px; font-weight: bold; text-align: right; }
            .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .details-table th { background: #f5f5f5; border: 1px solid #ddd; padding: 10px; font-weight: bold; text-align: left; }
            .details-table td { border: 1px solid #ddd; padding: 10px; }
            .total-row { font-weight: bold; font-size: 18px; color: #6200ee; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table class="header-table">
              <tr>
                <td class="logo">
                  VetCare
                  <div style="font-size: 11px; font-weight: normal; color: #666; margin-top: 5px;">
                    Clínica Veterinaria VetCare S.A.C.<br>
                    Av. Universitaria 1250, Lima<br>
                    RUC: 20123456789
                  </div>
                </td>
                <td class="invoice-title">
                  COMPROBANTE DE PAGO<br>
                  <span style="font-size: 14px; color: #666; font-weight: normal;">Nro: ${invoiceNum}</span><br>
                  <span style="font-size: 14px; color: #666; font-weight: normal;">Fecha: ${dateStr}</span>
                </td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

            <table class="header-table">
              <tr>
                <td>
                  <strong>Detalles del Cliente:</strong><br>
                  Paciente Mascota: ${petName}<br>
                  Atendido por: Dr(a). ${vetName}
                </td>
                <td style="text-align: right;">
                  <strong>Información de Pago:</strong><br>
                  Método de Pago: ${pago.metodoPago}<br>
                  Nro Operación: ${pago.numeroOperacion || '-'}<br>
                  Estado: CANCELADO
                </td>
              </tr>
            </table>

            <table class="details-table">
              <thead>
                <tr>
                  <th>Concepto / Servicio</th>
                  <th style="text-align: right; width: 150px;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Atención Clínica Especializada - Cita #${pago.idCita}<br><span style="font-size: 12px; color: #666;">Servicio: ${serviceName}</span></td>
                  <td style="text-align: right;">S/ ${pago.monto.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td style="text-align: right;">Total General:</td>
                  <td style="text-align: right;">S/ ${pago.monto.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              ¡Gracias por confiar en VetCare! Su mascota en las mejores manos.<br>
              Cualquier consulta sobre este comprobante escribir a contacto@vetcare.clinic
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  }
}
