import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, LogAuditoria } from '../../services/data';

declare var gsap: any;

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-grow">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-xl">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface font-bold flex items-center gap-sm">
            <span class="material-symbols-outlined text-[32px] text-primary">analytics</span>
            Auditoría de Logs (RabbitMQ)
          </h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-1">
            Visualización en tiempo real de los eventos y acciones del sistema procesados a través del broker de mensajería RabbitMQ.
          </p>
        </div>
        <div class="flex gap-sm">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            RabbitMQ Consumer: ACTIVE
          </span>
        </div>
      </div>

      <!-- Filters & Refresh -->
      <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-lg">
        <div class="flex flex-wrap items-center gap-sm w-full lg:w-auto">
          <!-- User search -->
          <div class="relative w-full lg:w-60 group">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              [(ngModel)]="filterUser" 
              (ngModelChange)="applyLocalFilters()" 
              class="w-full h-10 pl-10 pr-4 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
              placeholder="Buscar por usuario..."/>
          </div>

          <!-- Module search -->
          <div class="relative w-full lg:w-60 group">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">filter_alt</span>
            <input 
              type="text" 
              [(ngModel)]="filterModule" 
              (ngModelChange)="applyLocalFilters()" 
              class="w-full h-10 pl-10 pr-4 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
              placeholder="Filtrar por módulo..."/>
          </div>
        </div>

        <button 
          (click)="loadLogs()" 
          class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg text-label-md font-label-md text-on-surface transition-all shadow-sm cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">sync</span>
          Refrescar Eventos
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-surface-container border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-xs">
                <th class="px-6 py-4 font-semibold">Fecha/Hora</th>
                <th class="px-6 py-4 font-semibold">Usuario</th>
                <th class="px-6 py-4 font-semibold">Módulo</th>
                <th class="px-6 py-4 font-semibold">Acción</th>
                <th class="px-6 py-4 font-semibold">Descripción</th>
                <th class="px-6 py-4 font-semibold">Dirección IP</th>
                <th class="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody class="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant/30">
              <tr 
                *ngFor="let log of filteredLogs()" 
                class="hover:bg-surface-container-low/30 transition-colors duration-200 group h-14">
                
                <td class="px-6 py-4 text-on-surface-variant font-mono text-[12px]">
                  {{ formatDateTime(log.fechaEvento) }}
                </td>

                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-outline-variant">
                      {{ log.usuario.substring(0, 2) }}
                    </div>
                    <span class="font-medium">{{ log.usuario }}</span>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface-container border border-outline-variant">
                    {{ log.modulo }}
                  </span>
                </td>

                <td class="px-6 py-4 font-semibold text-primary">
                  {{ log.accion }}
                </td>

                <td class="px-6 py-4 text-on-surface-variant max-w-xs truncate" [title]="log.descripcion">
                  {{ log.descripcion }}
                </td>

                <td class="px-6 py-4 text-on-surface-variant font-mono text-[12px]">
                  {{ log.ipCliente || '127.0.0.1' }}
                </td>

                <td class="px-6 py-4">
                  <span 
                    [ngClass]="log.estado === 'EXITOSO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' : 'bg-red-500/10 text-red-500 border-red-500/15'"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border">
                    {{ log.estado }}
                  </span>
                </td>

              </tr>

              <tr *ngIf="filteredLogs().length === 0">
                <td colspan="7" class="text-center py-xl text-on-surface-variant italic">
                  <span class="material-symbols-outlined text-[40px] block mb-xs">pageview</span>
                  No se encontraron logs de auditoría.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="bg-surface-container border-t border-outline-variant px-6 py-4 flex items-center justify-between">
          <span class="text-label-sm font-label-sm text-on-surface-variant">
            Mostrando {{ filteredLogs().length }} de {{ logs().length }} logs
          </span>
          <div class="flex items-center gap-2">
            <button 
              [disabled]="currentPage === 0"
              (click)="prevPage()"
              class="px-3 py-1.5 border border-outline-variant rounded text-label-sm text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
            <button 
              [disabled]="isLastPage"
              (click)="nextPage()"
              class="px-3 py-1.5 border border-outline-variant rounded text-label-sm text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AuditoriaComponent implements OnInit {
  private dataService = inject(DataService);

  logs = signal<LogAuditoria[]>([]);
  filteredLogs = signal<LogAuditoria[]>([]);

  // Search filters
  filterUser = '';
  filterModule = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  isLastPage = false;

  ngOnInit(): void {
    this.loadLogs();
  }

  animateRows(): void {
    setTimeout(() => {
      const rows = document.querySelectorAll('tbody tr');
      if (rows.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(rows, 
          { y: 15, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }, 100);
  }

  loadLogs(): void {
    this.dataService.getLogsAuditoria(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.logs.set(res.data.content || []);
          this.isLastPage = res.data.last;
          this.applyLocalFilters();
          this.animateRows();
        }
      }
    });
  }

  applyLocalFilters(): void {
    let list = this.logs();
    const userQ = this.filterUser.toLowerCase().trim();
    const modQ = this.filterModule.toLowerCase().trim();

    if (userQ) {
      list = list.filter(l => l.usuario.toLowerCase().includes(userQ));
    }
    if (modQ) {
      list = list.filter(l => l.modulo.toLowerCase().includes(modQ));
    }
    
    this.filteredLogs.set(list);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-PE', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr ?? '';
    }
  }
}
