import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService, MascotaVacuna, Mascota, VacunaCatalog, Veterinario } from '../../services/data';

declare var gsap: any;

@Component({
  selector: 'app-vacunas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex-grow">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-xl gap-md">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">Gestión de Vacunación</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-xs">Monitoree y registre las vacunas aplicadas y refuerzos vencidos de los pacientes.</p>
        </div>
        <div class="flex gap-sm">
          <button 
            (click)="openAddModal()" 
            class="px-md py-sm bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-xs">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Registrar Vacuna
          </button>
        </div>
      </div>

      <!-- Bento Alerts Area -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        
        <!-- Critical Overdue Card -->
        <div class="bg-error-container border border-error/20 rounded-xl p-md flex items-start gap-md shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div class="p-sm bg-error/10 rounded-full text-error">
            <span class="material-symbols-outlined font-headline-md" data-weight="fill">warning</span>
          </div>
          <div>
            <h3 class="font-label-md text-label-md text-on-error-container font-bold mb-xs">Refuerzos Vencidos</h3>
            <p class="font-body-sm text-body-sm text-on-error-container/80 mb-sm">
              {{ overdueCount() }} paciente{{ overdueCount() === 1 ? '' : 's' }} requieren refuerzo inmediato.
            </p>
            <button (click)="filterByStatus('OVERDUE')" class="font-label-sm text-label-sm text-error font-bold hover:underline">Ver Lista Crítica</button>
          </div>
        </div>

        <!-- Upcoming Card -->
        <div class="bg-surface border border-outline-variant rounded-xl p-md flex items-start gap-md shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div class="p-sm bg-primary/10 rounded-full text-primary">
            <span class="material-symbols-outlined font-headline-md" data-weight="fill">event_upcoming</span>
          </div>
          <div>
            <h3 class="font-label-md text-label-md text-on-surface font-bold mb-xs">Próximos 7 Días</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mb-sm">
              {{ upcomingCount() }} vacuna{{ upcomingCount() === 1 ? '' : 's' }} programada{{ upcomingCount() === 1 ? '' : 's' }}.
            </p>
            <button (click)="filterByStatus('DUE_SOON')" class="font-label-sm text-label-sm text-primary font-bold hover:underline">Ver Próximos</button>
          </div>
        </div>

        <!-- Compliance Card -->
        <div class="bg-surface border border-outline-variant rounded-xl p-md flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div>
            <h3 class="font-label-md text-label-md text-on-surface font-bold mb-xs">Cumplimiento Clínico</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Vacunas Claves</p>
          </div>
          <div class="relative w-16 h-16 flex items-center justify-center">
            <!-- SVG Progress Ring -->
            <svg class="w-full h-full transform -rotate-90 animate-pulse" viewBox="0 0 36 36">
              <path class="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
              <path 
                class="text-primary" 
                [attr.stroke-dasharray]="complianceDasharray()" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="3"></path>
            </svg>
            <span class="absolute font-headline-sm text-headline-sm text-on-surface font-semibold text-xs">{{ complianceRate() }}%</span>
          </div>
        </div>

      </div>

      <!-- Search & Filters Toolbar -->
      <div class="bg-surface border border-outline-variant rounded-xl p-md mb-lg flex flex-col md:flex-row gap-md items-center justify-between shadow-sm">
        <!-- Search bar -->
        <div class="relative w-full md:w-96 flex items-center h-10 rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden focus-within:border-primary transition-all duration-200">
          <span class="material-symbols-outlined pl-sm text-on-surface-variant">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            placeholder="Buscar por mascota, vacuna o dueño..." 
            class="w-full h-full border-none focus:ring-0 bg-transparent font-body-sm text-body-sm px-sm text-on-surface placeholder:text-outline focus:outline-none" />
          <button 
            *ngIf="searchQuery" 
            (click)="searchQuery = ''; applyFilters()" 
            class="text-on-surface-variant hover:text-on-surface mr-xs text-sm">&times;</button>
        </div>

        <!-- Filter tabs -->
        <div class="flex items-center gap-xs bg-surface-container rounded-lg p-1 border border-outline-variant text-body-sm font-label-md text-label-md">
          <button 
            (click)="setActiveFilter('ALL')" 
            [ngClass]="activeFilter === 'ALL' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
            class="px-3 py-1.5 rounded transition-all">Todos</button>
          <button 
            (click)="setActiveFilter('OVERDUE')" 
            [ngClass]="activeFilter === 'OVERDUE' ? 'bg-error-container text-on-error-container shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
            class="px-3 py-1.5 rounded transition-all">Vencidos</button>
          <button 
            (click)="setActiveFilter('DUE_SOON')" 
            [ngClass]="activeFilter === 'DUE_SOON' ? 'bg-tertiary-fixed text-on-tertiary-fixed shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
            class="px-3 py-1.5 rounded transition-all">Próximos</button>
        </div>
      </div>

      <!-- Applied Vaccines Table -->
      <div class="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container border-b border-outline-variant font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-xs">
                <th class="py-md px-md">Paciente</th>
                <th class="py-md px-md">Dueño</th>
                <th class="py-md px-md">Vacuna</th>
                <th class="py-md px-md">Siguiente Dosis</th>
                <th class="py-md px-md">Estado</th>
                <th class="py-md px-md text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/30 text-body-sm">
              <tr 
                *ngFor="let mv of filteredMascotaVacunas()" 
                class="hover:bg-surface-container/30 transition-colors group">
                
                <!-- Pet details -->
                <td class="py-sm px-md">
                  <div class="flex items-center gap-sm">
                    <img 
                      [src]="getPetImage(mv)" 
                      [alt]="mv.nombreMascota" 
                      class="w-8 h-8 rounded-full object-cover border border-outline-variant" />
                    <div>
                      <span class="font-label-md text-label-md font-semibold text-on-surface block leading-tight">{{ mv.nombreMascota }}</span>
                      <span class="text-[10px] text-on-surface-variant">Lote: {{ mv.lote || 'N/A' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Owner name -->
                <td class="py-sm px-md text-on-surface">
                  <span class="font-medium">{{ getOwnerName(mv) }}</span>
                </td>

                <!-- Vaccine name -->
                <td class="py-sm px-md">
                  <span class="inline-flex items-center gap-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                    {{ mv.nombreVacuna }}
                  </span>
                </td>

                <!-- Next Dose date -->
                <td class="py-sm px-md">
                  <span [ngClass]="isOverdue(mv.proximaDosis) ? 'text-error font-medium' : 'text-on-surface'">
                    {{ formatNextDose(mv.proximaDosis) }}
                  </span>
                  <span class="text-on-surface-variant text-[11px] ml-1.5 block md:inline font-normal">
                    {{ getDoseRelativeText(mv.proximaDosis) }}
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-sm px-md">
                  <span 
                    [ngClass]="getStatusBadgeClass(mv.proximaDosis)"
                    class="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold shadow-xs">
                    {{ getStatusText(mv.proximaDosis) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-sm px-md text-right relative">
                  <button 
                    (click)="toggleMenu(mv.idMascotaVacuna!)" 
                    class="p-1 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                    <span class="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                  
                  <div 
                    *ngIf="openMenuId === mv.idMascotaVacuna" 
                    class="absolute right-md mt-1 w-44 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-20">
                    <button 
                      (click)="deleteApplication(mv.idMascotaVacuna!)" 
                      class="w-full text-left px-4 py-2 hover:bg-error-container/20 text-error transition-colors flex items-center gap-sm">
                      <span class="material-symbols-outlined text-[18px]">delete</span> Eliminar Registro
                    </button>
                  </div>
                </td>

              </tr>

              <!-- Empty state table -->
              <tr *ngIf="filteredMascotaVacunas().length === 0">
                <td colspan="6" class="text-center py-xl text-on-surface-variant italic">
                  <span class="material-symbols-outlined text-[40px] block mb-xs">vaccines</span>
                  No se encontraron registros de vacunas aplicadas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Log Vaccine Application Modal -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl max-w-lg w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">
              Registrar Aplicación de Vacuna
            </h3>
            <button (click)="closeModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
          </div>

          <form (ngSubmit)="saveApplication()" #appForm="ngForm" class="flex flex-col gap-md">
            
            <!-- Mascota Dropdown -->
            <div class="form-group flex flex-col gap-xs">
              <label for="mascota" class="font-label-md text-label-md text-on-surface-variant">Paciente (Mascota)</label>
              <select 
                id="mascota" 
                name="idMascota" 
                [(ngModel)]="activeApplication.idMascota" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                <option [value]="0" disabled>Seleccione una mascota...</option>
                <option *ngFor="let m of mascotas()" [value]="m.idMascota">
                  {{ m.nombre }} (Dueño: {{ m.nombreCliente }})
                </option>
              </select>
            </div>

            <!-- Vacuna Catalog Dropdown -->
            <div class="form-group flex flex-col gap-xs">
              <label for="vacuna" class="font-label-md text-label-md text-on-surface-variant">Vacuna a Aplicar</label>
              <select 
                id="vacuna" 
                name="idVacuna" 
                [(ngModel)]="activeApplicationId" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                <option [value]="0" disabled>Seleccione una vacuna...</option>
                <option *ngFor="let v of vacunaCatalog()" [value]="v.idVacuna">
                  {{ v.nombre }} ({{ v.dosisRecomendada || 'Dosis única' }})
                </option>
              </select>
            </div>

            <!-- Veterinario dropdown -->
            <div class="form-group flex flex-col gap-xs">
              <label for="veterinario" class="font-label-md text-label-md text-on-surface-variant">Veterinario Responsable</label>
              <select 
                id="veterinario" 
                name="idVeterinario" 
                [(ngModel)]="activeApplication.idVeterinario" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                <option [value]="0" disabled>Seleccione un veterinario...</option>
                <option *ngFor="let v of veterinarios()" [value]="v.idVeterinario">
                  {{ v.nombres }} {{ v.apellidoPaterno }} {{ v.apellidoMaterno }}
                </option>
              </select>
            </div>

            <!-- Fechas Grid -->
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="fechaAplicacion" class="font-label-md text-label-md text-on-surface-variant">Fecha Aplicación</label>
                <input 
                  type="date" 
                  id="fechaAplicacion" 
                  name="fechaAplicacion" 
                  [(ngModel)]="activeApplication.fechaAplicacion" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="proximaDosis" class="font-label-md text-label-md text-on-surface-variant">Próxima Dosis (Booster)</label>
                <input 
                  type="date" 
                  id="proximaDosis" 
                  name="proximaDosis" 
                  [(ngModel)]="activeApplication.proximaDosis" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
              </div>
            </div>

            <!-- Lote -->
            <div class="form-group flex flex-col gap-xs">
              <label for="lote" class="font-label-md text-label-md text-on-surface-variant">Número de Lote</label>
              <input 
                type="text" 
                id="lote" 
                name="lote" 
                [(ngModel)]="activeApplication.lote" 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Ej. VAC-2026X">
            </div>

            <!-- Observaciones -->
            <div class="form-group flex flex-col gap-xs">
              <label for="observaciones" class="font-label-md text-label-md text-on-surface-variant">Observaciones</label>
              <textarea 
                id="observaciones" 
                name="observaciones" 
                [(ngModel)]="activeApplication.observaciones" 
                rows="2"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Notas adicionales sobre la aplicación..."></textarea>
            </div>

            <div class="flex justify-end gap-sm border-t border-outline-variant pb-xs pt-md mt-sm">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="!appForm.valid || activeApplication.idMascota === 0 || activeApplication.idVeterinario === 0 || activeApplicationId === 0" 
                class="bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-primary transition-colors">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .animate-slideIn {
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class VacunasComponent implements OnInit {
  mascotaVacunas = signal<MascotaVacuna[]>([]);
  filteredMascotaVacunas = signal<MascotaVacuna[]>([]);

  // Catalogs for select inputs
  mascotas = signal<Mascota[]>([]);
  vacunaCatalog = signal<VacunaCatalog[]>([]);
  veterinarios = signal<Veterinario[]>([]);

  // Search & Filter state
  searchQuery = '';
  activeFilter = 'ALL';

  // Overdue and upcoming counts
  overdueCount = signal(0);
  upcomingCount = signal(0);
  complianceRate = signal(100);
  complianceDasharray = signal('100, 100');

  // Modal application state
  isModalOpen = signal(false);
  activeApplicationId = 0; // mapping local active dropdown selected idVacuna
  activeApplication: any = this.getEmptyApplication();

  // Menu actions mapping
  openMenuId: number | null = null;

  dogImage1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGi4C-TvQskBoEaMSqPF3TCZqF6xdUf2JyOsDXsviKob3ruTFkm9LmPPHDXO3fVww3bVTzGRBg1eZtL9B0VT8y4QWXdCq5hVcIRN_erjj6bnWklpRRm4ng7KfMBLSqTu-6cKj8E5xlxrOrM98BjbQlnkC1k6x3UW9PVirOYflSX7F7gExaByG0I1WQdPALBJmc6hr14AI-l8SVu8NOUHjUr_5s15Any8XsTSy5bAKuvOUs7Mtg16XPtmcXiGQynusXx5K8knx-8tI';
  catImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGSGrA9quus7p9RM1K_ne08eXam7tMlquWYr-4j1wYH9vhDy25zNr8nGGVKnpi-DOh0vwNv-3jJxcn9xaLDGBzhe3fGR9j2BKKAQwilh8C23kfRl9iNKR949kam7maN7u8Il8CeX0rlkmXBZnfL3vVLcBbVsBQiQ1WYb1j-dbdEcCNJuBfX3E--QcOCIvSPNT-XC1WjwVO9J5d0FX-K7CcaXtx3WL3xt3r6rYfxHClhVKHBKTdlrU87ZX0FWfcavX2DQnlxFrLxs';
  dogImage2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfDVSWG_QjD4bssvQnQSMKhO1BB-QrrrdnXo1ks9UkF_2Yh2OyH0zjA4ajBcsgWDv4AgZFjbxP0TVAwh-zEDK32vjiyNatlb5juBnoT0S2TzCpmwkH3kus0a9YLXpo1I10o5iS7k0IawlQV9TjBEf_5JXGkUIgA8hEW1jsEeQZFHXfLJkSupA9vIId-Nbm2Ux54mSYVHZdnMvagmqJDjWcSYANEuG6qFOOMRmP_RikELDnFZd5CaqA2RJotnNMYhOMkoduHqzThds';

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.loadMascotaVacunas();
    this.loadCatalogs();
  }

  animateOnLoad(): void {
    setTimeout(() => {
      const cards = document.querySelectorAll('.grid > div');
      const rows = document.querySelectorAll('tbody tr');
      if (cards.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
        );
      }
      if (rows.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(rows, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, delay: 0.15, ease: 'power2.out' }
        );
      }
    }, 150);
  }

  loadMascotaVacunas(): void {
    this.dataService.getMascotaVacunas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const content = res.data.content || [];
          this.mascotaVacunas.set(content);
          this.calculateComplianceAndCounts(content);
          this.applyFilters();
          this.animateOnLoad();
        }
      }
    });
  }

  loadCatalogs(): void {
    // Load active pets
    this.dataService.getMascotas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.mascotas.set((res.data.content || []).filter(p => p.estado));
        }
      }
    });

    // Load general vaccines list
    this.dataService.getVacunas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vacunaCatalog.set((res.data.content || []).filter(v => v.estado));
        }
      }
    });

    // Load active veterinarians
    this.dataService.getVeterinarios(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.veterinarios.set((res.data.content || []).filter(v => v.estado));
        }
      }
    });
  }

  calculateComplianceAndCounts(list: MascotaVacuna[]): void {
    let overdue = 0;
    let upcoming = 0;
    const total = list.length;

    list.forEach(v => {
      if (v.proximaDosis) {
        const diff = this.getDiffInDays(v.proximaDosis);
        if (diff < 0) {
          overdue++;
        } else if (diff >= 0 && diff <= 7) {
          upcoming++;
        }
      }
    });

    this.overdueCount.set(overdue);
    this.upcomingCount.set(upcoming);

    if (total > 0) {
      const compliant = total - overdue;
      const rate = Math.round((compliant / total) * 100);
      this.complianceRate.set(rate);
      this.complianceDasharray.set(`${rate}, 100`);
    } else {
      this.complianceRate.set(100);
      this.complianceDasharray.set('100, 100');
    }
  }

  getDiffInDays(dateStr: string): number {
    try {
      const target = new Date(dateStr);
      const today = new Date();
      // Reset hours to compare only days
      target.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  isOverdue(dateStr?: string): boolean {
    if (!dateStr) return false;
    return this.getDiffInDays(dateStr) < 0;
  }

  formatNextDose(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  }

  getDoseRelativeText(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = this.getDiffInDays(dateStr);
    if (diff < 0) {
      const days = Math.abs(diff);
      return `(hace ${days} día${days === 1 ? '' : 's'})`;
    }
    if (diff === 0) {
      return '(hoy)';
    }
    if (diff === 1) {
      return '(mañana)';
    }
    return `(en ${diff} día${diff === 1 ? '' : 's'})`;
  }

  getStatusText(dateStr?: string): string {
    if (!dateStr) return 'COMPLETADA';
    const diff = this.getDiffInDays(dateStr);
    if (diff < 0) return 'VENCIDO';
    if (diff >= 0 && diff <= 2) return `VENCE HOY/PRÓX`;
    if (diff > 2 && diff <= 7) return 'PRÓXIMO';
    return 'PROGRAMADO';
  }

  getStatusBadgeClass(dateStr?: string): string {
    if (!dateStr) return 'bg-secondary-container text-on-secondary-container';
    const diff = this.getDiffInDays(dateStr);
    if (diff < 0) return 'bg-error-container text-error border border-error/15';
    if (diff >= 0 && diff <= 2) return 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/15';
    if (diff > 2 && diff <= 7) return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
    return 'bg-secondary-container text-on-secondary-container border border-secondary/15';
  }

  getOwnerName(mv: MascotaVacuna): string {
    // If client details are not flat on the response, fetch owner from loaded pet catalog details
    const petObj = this.mascotas().find(p => p.idMascota === mv.idMascota);
    return petObj?.nombreCliente || 'Clínica Cliente';
  }

  applyFilters(): void {
    let result = this.mascotaVacunas();
    const query = this.searchQuery.toLowerCase().trim();

    // Query Filter
    if (query) {
      result = result.filter(v => 
        (v.nombreMascota || '').toLowerCase().includes(query) || 
        (v.nombreVacuna || '').toLowerCase().includes(query) || 
        (v.nombreVeterinario || '').toLowerCase().includes(query)
      );
    }

    // Status Tab Filter
    if (this.activeFilter === 'OVERDUE') {
      result = result.filter(v => v.proximaDosis && this.getDiffInDays(v.proximaDosis) < 0);
    } else if (this.activeFilter === 'DUE_SOON') {
      result = result.filter(v => v.proximaDosis && this.getDiffInDays(v.proximaDosis) >= 0 && this.getDiffInDays(v.proximaDosis) <= 7);
    }

    this.filteredMascotaVacunas.set(result);
  }

  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
    this.animateOnLoad();
  }

  filterByStatus(status: string): void {
    this.activeFilter = status;
    this.applyFilters();
    this.animateOnLoad();
  }

  getEmptyApplication(): any {
    return {
      idMascota: 0,
      idVacuna: 0,
      idVeterinario: 0,
      fechaAplicacion: new Date().toISOString().substring(0, 10),
      proximaDosis: '',
      lote: '',
      observaciones: ''
    };
  }

  openAddModal(): void {
    this.activeApplicationId = 0;
    this.activeApplication = this.getEmptyApplication();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  toggleMenu(id: number): void {
    if (this.openMenuId === id) {
      this.openMenuId = null;
    } else {
      this.openMenuId = id;
    }
  }

  saveApplication(): void {
    this.activeApplication.idVacuna = this.activeApplicationId;
    this.dataService.createMascotaVacuna(this.activeApplication).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadMascotaVacunas();
          this.closeModal();
        }
      }
    });
  }

  deleteApplication(id: number): void {
    this.openMenuId = null;
    if (confirm('¿Está seguro de que desea eliminar este registro de vacunación?')) {
      this.dataService.deleteMascotaVacuna(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadMascotaVacunas();
          }
        }
      });
    }
  }

  getPetImage(mv: MascotaVacuna): string {
    const name = (mv.nombreMascota || '').toLowerCase();
    if (name.includes('max') || mv.idMascota === 3) {
      return this.dogImage1;
    }
    if (name.includes('bella') || mv.idMascota === 1) {
      return this.dogImage2;
    }
    if (name.includes('luna') || mv.idMascota === 2) {
      return this.catImage;
    }
    return this.dogImage2;
  }
}
