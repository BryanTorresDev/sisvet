import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Cliente, TipoDocumento } from '../../services/data';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clientes-page">
      <div class="page-header">
        <div class="header-text">
          <h2>Clientes</h2>
          <p>Catálogo de clientes registrados en SisVet</p>
        </div>
        <button (click)="openAddModal()" class="btn btn-primary">
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="card search-card">
        <div class="search-bar">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchQueryChange()" 
            class="form-control" 
            placeholder="Buscar por nombre o número de documento...">
          <button (click)="loadClientes()" class="btn btn-secondary">Buscar</button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card table-card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clientes()">
                <td>{{ getDocumentName(c.idTipoDocumento) }} - {{ c.numeroDocumento }}</td>
                <td>{{ c.nombres }} {{ c.apellidoPaterno }} {{ c.apellidoMaterno }}</td>
                <td>{{ c.telefono || '-' }}</td>
                <td>{{ c.correo || '-' }}</td>
                <td>{{ c.direccion || '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="c.estado ? 'badge-success' : 'badge-error'">
                    {{ c.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button (click)="openEditModal(c)" class="btn-icon" title="Editar">✏️</button>
                  <button 
                    *ngIf="!authService.isRecepcionista()" 
                    (click)="deleteCliente(c)" 
                    class="btn-icon text-red" 
                    title="Desactivar">
                    🗑️
                  </button>
                </td>
              </tr>
              <tr *ngIf="clientes().length === 0">
                <td colspan="7" class="text-center" style="padding: 3rem;">
                  No se encontraron clientes registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Add / Edit -->
      <div *ngIf="isModalOpen()" class="modal-backdrop">
        <div class="modal-card card">
          <div class="modal-header">
            <h3>{{ isEditMode() ? 'Editar Cliente' : 'Registrar Cliente' }}</h3>
            <button (click)="closeModal()" class="close-btn">&times;</button>
          </div>
          
          <form (ngSubmit)="saveCliente()" #clienteForm="ngForm" class="modal-body">
            <div class="grid-2">
              <div class="form-group">
                <label for="tipoDoc">Tipo de Documento</label>
                <select 
                  id="tipoDoc" 
                  name="idTipoDocumento" 
                  [(ngModel)]="activeCliente.idTipoDocumento" 
                  required 
                  class="form-control">
                  <option [value]="0" disabled>Seleccione...</option>
                  <option *ngFor="let t of docTypes()" [value]="t.idTipoDocumento">
                    {{ t.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-group flex-1">
                <label for="docNum">Número de Documento</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    id="docNum" 
                    name="numeroDocumento" 
                    [(ngModel)]="activeCliente.numeroDocumento" 
                    required 
                    class="form-control" 
                    placeholder="Número de documento">
                  <button 
                    type="button" 
                    (click)="buscarPorDni()" 
                    [disabled]="!activeCliente.numeroDocumento || activeCliente.numeroDocumento.length < 8"
                    class="btn btn-secondary py-1 px-3 text-xs shrink-0 flex items-center justify-center" 
                    title="Consultar en Reniec">
                    🔍
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="nombres">Nombres</label>
              <input 
                type="text" 
                id="nombres" 
                name="nombres" 
                [(ngModel)]="activeCliente.nombres" 
                required 
                class="form-control" 
                placeholder="Nombres">
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label for="apPat">Apellido Paterno</label>
                <input 
                  type="text" 
                  id="apPat" 
                  name="apellidoPaterno" 
                  [(ngModel)]="activeCliente.apellidoPaterno" 
                  required 
                  class="form-control" 
                  placeholder="Apellido paterno">
              </div>

              <div class="form-group">
                <label for="apMat">Apellido Materno</label>
                <input 
                  type="text" 
                  id="apMat" 
                  name="apellidoMaterno" 
                  [(ngModel)]="activeCliente.apellidoMaterno" 
                  required 
                  class="form-control" 
                  placeholder="Apellido materno">
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label for="tel">Teléfono</label>
                <input 
                  type="text" 
                  id="tel" 
                  name="telefono" 
                  [(ngModel)]="activeCliente.telefono" 
                  class="form-control" 
                  placeholder="Teléfono">
              </div>

              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="correo" 
                  [(ngModel)]="activeCliente.correo" 
                  class="form-control" 
                  placeholder="Correo electrónico">
              </div>
            </div>

            <div class="form-group">
              <label for="dir">Dirección</label>
              <input 
                type="text" 
                id="dir" 
                name="direccion" 
                [(ngModel)]="activeCliente.direccion" 
                class="form-control" 
                placeholder="Dirección domicilaria">
            </div>

            <div class="modal-actions">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="!clienteForm.valid" class="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Premium Glassmorphic Toast Notification -->
      <div 
        *ngIf="toastMessage()" 
        class="fixed top-6 right-6 z-[99999] flex items-center gap-md px-lg py-md rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform scale-100 translate-y-0 toast-notification"
        [ngClass]="{
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400': toastType() === 'success',
          'bg-rose-500/10 border-rose-500/30 text-rose-400': toastType() === 'error',
          'bg-amber-500/10 border-amber-500/30 text-amber-400': toastType() === 'warning'
        }">
        <span class="material-symbols-outlined text-[24px]">
          {{ toastType() === 'success' ? 'check_circle' : toastType() === 'error' ? 'error' : 'warning' }}
        </span>
        <div class="flex flex-col gap-0.5 text-left">
          <p class="font-headline-sm text-[10px] font-bold uppercase tracking-wider leading-none">
            {{ toastType() === 'success' ? 'Éxito' : toastType() === 'error' ? 'Error' : 'Advertencia' }}
          </p>
          <p class="font-body-sm text-sm text-white/90 leading-tight mt-0.5">{{ toastMessage() }}</p>
        </div>
        <button (click)="toastMessage.set(null)" class="text-white/40 hover:text-white/80 transition-colors ml-lg text-lg leading-none">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-notification {
      animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes toastSlideIn {
      from { transform: translateX(120%) scale(0.9); opacity: 0; }
      to { transform: translateX(0) scale(1); opacity: 1; }
    }
    .clientes-page {
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
    .search-card {
      padding: 1rem;
    }
    .search-bar {
      display: flex;
      gap: 1rem;
    }
    .search-bar input {
      flex: 1;
    }
    
    .text-red {
      color: var(--accent-error);
    }
    .text-red:hover {
      background-color: rgba(239, 68, 68, 0.15) !important;
      color: var(--accent-error) !important;
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
export class ClientesComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  docTypes = signal<TipoDocumento[]>([]);
  searchQuery = '';

  // Toast state
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'warning'>('success');
  private toastTimeout: any;

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }
  
  // Modal state
  isModalOpen = signal(false);
  isEditMode = signal(false);
  
  activeCliente: Cliente = this.getEmptyCliente();

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
    this.loadDocTypes();
  }

  loadClientes(): void {
    if (this.searchQuery.trim() !== '') {
      this.dataService.buscarClientes(this.searchQuery).subscribe({
        next: (res) => {
          if (res.success && res.data && res.data.content) {
            this.clientes.set(res.data.content);
          }
        }
      });
    } else {
      this.dataService.getClientes().subscribe({
        next: (res) => {
          if (res.success && res.data && res.data.content) {
            this.clientes.set(res.data.content);
          }
        }
      });
    }
  }

  onSearchQueryChange(): void {
    // Basic debounce / instant search
    this.loadClientes();
  }

  loadDocTypes(): void {
    this.dataService.getTiposDocumento().subscribe({
      next: (res) => {
        if (res.success) {
          this.docTypes.set(res.data);
        }
      }
    });
  }

  getDocumentName(id: number): string {
    const type = this.docTypes().find(t => t.idTipoDocumento === id);
    return type ? type.nombre : 'DOC';
  }

  getEmptyCliente(): Cliente {
    return {
      idTipoDocumento: 0,
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefono: '',
      correo: '',
      direccion: ''
    };
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.activeCliente = this.getEmptyCliente();
    this.isModalOpen.set(true);
  }

  openEditModal(cliente: Cliente): void {
    this.isEditMode.set(true);
    this.activeCliente = { ...cliente };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveCliente(): void {
    if (this.isEditMode()) {
      const id = this.activeCliente.idCliente!;
      this.dataService.updateCliente(id, this.activeCliente).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Cliente actualizado con éxito.');
            this.loadClientes();
            this.closeModal();
          } else {
            this.showToast('Error al actualizar cliente: ' + res.message, 'error');
          }
        },
        error: (err) => {
          this.showToast('Error al actualizar cliente: ' + (err.error?.message || err.message || 'Error de conexión'), 'error');
        }
      });
    } else {
      this.dataService.createCliente(this.activeCliente).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Cliente registrado con éxito.');
            this.loadClientes();
            this.closeModal();
          } else {
            this.showToast('Error al registrar cliente: ' + res.message, 'error');
          }
        },
        error: (err) => {
          this.showToast('Error al registrar cliente: ' + (err.error?.message || err.message || 'Error de conexión'), 'error');
        }
      });
    }
  }

  deleteCliente(cliente: Cliente): void {
    if (confirm(`¿Está seguro de que desea desactivar al cliente ${cliente.nombres} ${cliente.apellidoPaterno}?`)) {
      this.dataService.deleteCliente(cliente.idCliente!).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Cliente desactivado con éxito.');
            this.loadClientes();
          } else {
            this.showToast('Error al desactivar cliente: ' + res.message, 'error');
          }
        },
        error: (err) => {
          this.showToast('Error al desactivar cliente', 'error');
        }
      });
    }
  }

  buscarPorDni(): void {
    let dni = this.activeCliente.numeroDocumento;
    if (dni) {
      dni = dni.trim();
      this.activeCliente.numeroDocumento = dni;
    }
    if (!dni || dni.length < 8) return;
    this.dataService.consultarDni(dni).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeCliente.nombres = res.data.nombres || '';
          this.activeCliente.apellidoPaterno = res.data.apellidoPaterno || '';
          this.activeCliente.apellidoMaterno = res.data.apellidoMaterno || '';
          this.activeCliente.direccion = res.data.direccion || 'Av. Larco 123, Miraflores';
          this.showToast('Datos autocompletados desde RENIEC.');
        } else {
          this.showToast('No se encontraron datos para el DNI ingresado.', 'warning');
        }
      },
      error: (err) => {
        this.showToast('No se pudo encontrar información para ese DNI.', 'error');
      }
    });
  }
}
