import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService, HistorialClinico, Mascota, Veterinario, MascotaVacuna, VacunaCatalog } from '../../services/data';
import { AuthService } from '../../services/auth';

declare var gsap: any;

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- MAIN WORKSPACE CONTAINER -->
    <div class="flex-grow">
      
      <!-- STATE 1: ACTIVE PATIENT SELECTED -->
      <div *ngIf="mascotaId && mascota() as m; else selectOrLoading">
        
        <!-- Page Header & Quick Switcher -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-md mb-lg">
          <a routerLink="/mascotas" class="flex items-center hover:text-primary transition-colors text-on-surface-variant group">
            <span class="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span class="font-label-md text-label-md ml-xs">Volver a Mascotas</span>
          </a>

          <!-- Quick switcher search bar -->
          <div class="relative">
            <div class="flex items-center gap-xs bg-surface border border-outline-variant rounded-lg px-3 py-1.5 focus-within:border-primary transition-colors shadow-sm">
              <span class="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text"
                [(ngModel)]="switchSearchQuery" 
                (ngModelChange)="filterSwitchMascotas()" 
                placeholder="Buscar y cambiar paciente..." 
                class="w-48 sm:w-60 bg-transparent text-on-surface border-0 p-0 focus:ring-0 text-body-sm placeholder:text-on-surface-variant/50 focus:outline-none" />
              <button 
                *ngIf="switchSearchQuery" 
                (click)="clearSwitchSearch()" 
                class="text-on-surface-variant hover:text-on-surface text-[16px]">&times;</button>
            </div>

            <!-- Quick switcher results dropdown -->
            <div *ngIf="switchFilteredMascotas().length > 0 && switchSearchQuery" class="absolute right-0 mt-2 w-72 sm:w-80 bg-surface border border-outline-variant rounded-lg shadow-xl py-1 z-30 max-h-60 overflow-y-auto">
              <button 
                *ngFor="let pet of switchFilteredMascotas()" 
                (click)="switchPatient(pet.idMascota!)"
                class="w-full text-left px-4 py-2 hover:bg-surface-container transition-colors flex items-center gap-sm border-b border-outline-variant/30 last:border-b-0 cursor-pointer">
                <img [src]="getPetImage(pet)" class="w-8 h-8 rounded-full object-cover border border-outline-variant" />
                <div class="min-w-0">
                  <p class="font-label-md text-label-md text-on-surface truncate">{{ pet.nombre }}</p>
                  <p class="font-body-sm text-[11px] text-on-surface-variant truncate">{{ pet.nombreEspecie }} • {{ pet.nombreRaza }} (Dueño: {{ pet.nombreCliente }})</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="mb-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant/50 pb-md">
          <div>
            <h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center gap-sm font-bold">
              <span class="material-symbols-outlined text-[32px] text-primary">history_edu</span>
              Historial Clínico de {{ m.nombre }}
            </h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Línea de tiempo médica completa y registros de diagnóstico de la mascota.</p>
          </div>
        </div>

        <!-- Patient Overview Bento Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-md mb-xl">
          
          <!-- Bento Block 1: Profile & Owner (Main) -->
          <div class="bg-surface border border-outline-variant rounded-xl p-md flex items-center gap-md relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
            <img 
              [src]="getPetImage(m)" 
              alt="Foto del Paciente" 
              class="w-20 h-20 rounded-full object-cover border-2 border-outline-variant shadow-sm group-hover:scale-105 transition-transform duration-350" />
            <div class="flex-grow min-w-0">
              <span class="inline-flex items-center gap-xs px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container text-on-secondary-container border border-secondary/20 mb-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Paciente Activo
              </span>
              <h3 class="font-headline-md text-headline-md text-on-surface truncate font-bold">{{ m.nombre }}</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs truncate mt-xs">
                <span class="material-symbols-outlined text-[16px] text-primary">person</span>
                Dueño: {{ m.nombreCliente || 'Sin propietario' }}
              </p>
            </div>
          </div>

          <!-- Bento Block 2: Clinical Details Grid -->
          <div class="bg-surface border border-outline-variant rounded-xl p-md grid grid-cols-4 gap-xs hover:border-primary/30 transition-colors">
            <!-- Age Block -->
            <div class="bg-surface-container/50 rounded-lg p-xs border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:bg-surface-container-high transition-colors group">
              <span class="material-symbols-outlined text-primary mb-xs text-[20px] group-hover:scale-110 transition-transform">cake</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-[9px]">Edad</span>
              <span class="font-body-sm text-body-sm text-on-surface font-semibold mt-xs">{{ calculateAge(m.fechaNacimiento) }}</span>
            </div>

            <!-- Weight Block -->
            <div class="bg-surface-container/50 rounded-lg p-xs border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:bg-surface-container-high transition-colors group">
              <span class="material-symbols-outlined text-secondary mb-xs text-[20px] group-hover:scale-110 transition-transform">scale</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-[9px]">Peso</span>
              <span class="font-body-sm text-body-sm text-on-surface font-semibold mt-xs">{{ m.peso }} kg</span>
            </div>

            <!-- Breed / Sex Block -->
            <div class="bg-surface-container/50 rounded-lg p-xs border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:bg-surface-container-high transition-colors group">
              <span class="material-symbols-outlined text-tertiary mb-xs text-[20px] group-hover:scale-110 transition-transform">{{ m.sexo === 'M' ? 'male' : 'female' }}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-[9px]">Sexo</span>
              <span class="font-body-sm text-body-sm text-on-surface font-semibold mt-xs">{{ m.sexo === 'M' ? 'Macho' : 'Hembra' }}</span>
            </div>

            <!-- Cumpleaños Block -->
            <div class="bg-surface-container/50 rounded-lg p-xs border border-outline-variant/30 flex flex-col items-center justify-center text-center hover:bg-surface-container-high transition-colors group">
              <span class="material-symbols-outlined text-amber-500 mb-xs text-[20px] group-hover:scale-110 transition-transform">celebration</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block text-[9px]">Nacimiento</span>
              <span class="font-body-sm text-body-sm text-on-surface font-semibold mt-xs">{{ formatVaccineDate(m.fechaNacimiento) }}</span>
            </div>
          </div>

          <!-- Bento Block 3: Action Panel & Quick Stats -->
          <div class="bg-surface border border-outline-variant rounded-xl p-md flex flex-col justify-between gap-sm hover:border-primary/30 transition-colors">
            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center text-body-sm">
                <span class="text-on-surface-variant flex items-center gap-xs">
                  <span class="material-symbols-outlined text-[18px] text-primary">history</span>
                  Total de consultas:
                </span>
                <span class="font-semibold text-on-surface bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">
                  {{ historial().length }}
                </span>
              </div>
              <div class="flex justify-between items-center text-body-sm mt-1">
                <span class="text-on-surface-variant flex items-center gap-xs">
                  <span class="material-symbols-outlined text-[18px] text-secondary">event_repeat</span>
                  Próxima Visita:
                </span>
                <span class="font-semibold text-on-surface text-[12px] truncate max-w-[150px]" [title]="proximaVisita()">
                  {{ proximaVisita() }}
                </span>
              </div>
            </div>
            <div class="flex gap-sm">
              <button 
                (click)="printRecords()" 
                class="flex-grow px-md py-sm border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-xs">
                <span class="material-symbols-outlined text-[18px]">print</span>
                Imprimir
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Navigation Bar -->
        <div class="flex border-b border-outline-variant/60 gap-xs mb-lg overflow-x-auto no-scrollbar">
          <button 
            (click)="activeTab.set('consultas')"
            [ngClass]="activeTab() === 'consultas' ? 'border-primary text-primary font-bold bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container/60'"
            class="px-lg py-md border-b-2 font-label-md text-label-md transition-all flex items-center gap-xs cursor-pointer rounded-t-xl shrink-0">
            <span class="material-symbols-outlined text-[18px]">history_edu</span>
            Historial de Consultas
          </button>
          
          <button 
            (click)="activeTab.set('vacunas')"
            [ngClass]="activeTab() === 'vacunas' ? 'border-primary text-primary font-bold bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container/60'"
            class="px-lg py-md border-b-2 font-label-md text-label-md transition-all flex items-center gap-xs cursor-pointer rounded-t-xl shrink-0">
            <span class="material-symbols-outlined text-[18px]">vaccines</span>
            Vacunas ({{ vacunas().length }})
          </button>
          
          <button 
            (click)="activeTab.set('tratamientos')"
            [ngClass]="activeTab() === 'tratamientos' ? 'border-primary text-primary font-bold bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container/60'"
            class="px-lg py-md border-b-2 font-label-md text-label-md transition-all flex items-center gap-xs cursor-pointer rounded-t-xl shrink-0">
            <span class="material-symbols-outlined text-[18px]">medication</span>
            Tratamientos
          </button>
          
          <button 
            (click)="activeTab.set('estetica')"
            [ngClass]="activeTab() === 'estetica' ? 'border-primary text-primary font-bold bg-primary/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container/60'"
            class="px-lg py-md border-b-2 font-label-md text-label-md transition-all flex items-center gap-xs cursor-pointer rounded-t-xl shrink-0">
            <span class="material-symbols-outlined text-[18px]">content_cut</span>
            Baños e Higiene
          </button>
        </div>

        <!-- TAB CONTENT 1: MEDICAL CONSULTATIONS -->
        <div *ngIf="activeTab() === 'consultas'" class="animate-fadeIn">
          <div class="flex justify-between items-center mb-md">
            <div>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Línea de Tiempo Médica</h4>
              <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Historial clínico general y consultas registradas por el personal veterinario.</p>
            </div>
            <button 
              *ngIf="!authService.isRecepcionista()"
              (click)="openAddModal()" 
              class="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-xs cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">add</span>
              Registrar Consulta
            </button>
          </div>

          <div class="relative border-l-2 border-outline-variant ml-8">
            <!-- Timeline Event -->
            <div 
              *ngFor="let entry of historial(); let i = index" 
              class="mb-xl ml-10 relative group timeline-card-wrapper">
              
              <!-- Node -->
              <div class="absolute -left-[49px] top-4 w-5 h-5 rounded-full bg-primary ring-4 ring-background shadow-sm z-10 transition-transform group-hover:scale-125"></div>
              
              <!-- Content Card -->
              <div class="bg-surface border border-outline-variant rounded-xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div class="flex justify-between items-start mb-md border-b border-outline-variant/30 pb-xs">
                  <div>
                    <span class="font-label-sm text-label-sm text-primary mb-1 block tracking-wider uppercase flex items-center gap-xs font-semibold">
                      <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                      {{ formatDateTime(entry.fechaAtencion) }}
                    </span>
                    <h4 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-xs font-bold">
                      <span class="material-symbols-outlined text-[20px] text-on-surface-variant">folder_open</span>
                      {{ getEntryType(entry) }}
                    </h4>
                  </div>
                  <div class="flex items-center gap-sm">
                    <span 
                      [ngClass]="getBadgeColor(entry)"
                      class="px-3 py-1 rounded-full font-label-sm text-label-sm border flex items-center gap-xs font-semibold">
                      <span class="material-symbols-outlined text-[14px]">{{ getCategoryIcon(entry) }}</span>
                      {{ getEntryType(entry) }}
                    </span>
                    
                    <!-- Actions -->
                    <button 
                      *ngIf="!authService.isRecepcionista()"
                      (click)="openEditModal(entry)" 
                      class="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors p-xs cursor-pointer" 
                      title="Editar entrada">
                      <span class="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      *ngIf="!authService.isRecepcionista()"
                      (click)="deleteEntry(entry)" 
                      class="text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-full transition-colors p-xs cursor-pointer" 
                      title="Eliminar entrada">
                      <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-lg mt-md">
                  <!-- Diagnosis & Treatment -->
                  <div class="space-y-md">
                    <div class="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-md">
                      <h5 class="font-label-md text-label-md text-primary flex items-center gap-2 mb-2 border-b border-outline-variant/20 pb-xs uppercase tracking-wider text-xs font-bold">
                        <span class="material-symbols-outlined text-[18px]">stethoscope</span> Diagnóstico Médico
                      </h5>
                      <p class="font-body-sm text-body-sm text-on-surface whitespace-pre-line leading-relaxed">{{ entry.diagnostico }}</p>
                    </div>
                    
                    <div *ngIf="entry.tratamiento" class="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-md">
                      <h5 class="font-label-md text-label-md text-secondary flex items-center gap-2 mb-2 border-b border-outline-variant/20 pb-xs uppercase tracking-wider text-xs font-bold">
                        <span class="material-symbols-outlined text-[18px]">medication</span> Tratamiento Recetado
                      </h5>
                      <p class="font-body-sm text-body-sm text-on-surface whitespace-pre-line leading-relaxed">{{ entry.tratamiento }}</p>
                    </div>
                  </div>
                  
                  <!-- Observations & Vet -->
                  <div class="space-y-md bg-surface-container/40 p-md rounded-xl border border-outline-variant/40">
                    
                    <!-- Signos Vitales Detallados -->
                    <div>
                      <h5 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm text-[10px] flex items-center gap-xs font-semibold">
                        <span class="material-symbols-outlined text-[14px]">analytics</span>
                        Signos Vitales y Métricas
                      </h5>
                      <div class="grid grid-cols-2 gap-sm text-body-sm">
                        <div class="bg-surface border border-outline-variant/40 rounded-lg p-sm">
                          <span class="text-on-surface-variant block text-xs flex items-center gap-xs">
                            <span class="material-symbols-outlined text-[14px] text-error">thermometer</span>
                            Temperatura
                          </span>
                          <div class="flex items-center justify-between mt-1">
                            <span class="text-on-surface font-semibold text-body-md">{{ entry.temperatura ? entry.temperatura + ' °C' : '-' }}</span>
                            <span 
                              *ngIf="entry.temperatura"
                              [ngClass]="getTempStatusClass(entry.temperatura)"
                              class="px-2 py-0.5 rounded text-[10px] border font-medium">
                              {{ getTempStatusText(entry.temperatura) }}
                            </span>
                          </div>
                        </div>
                        <div class="bg-surface border border-outline-variant/40 rounded-lg p-sm">
                          <span class="text-on-surface-variant block text-xs flex items-center gap-xs">
                            <span class="material-symbols-outlined text-[14px] text-secondary">scale</span>
                            Peso Clínico
                          </span>
                          <span class="text-on-surface font-semibold text-body-md block mt-1">{{ entry.peso ? entry.peso + ' kg' : '-' }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="pt-sm border-t border-outline-variant/30">
                      <h5 class="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-xs font-semibold">
                        <span class="material-symbols-outlined text-[14px]">rate_review</span>
                        Observaciones Clínicas
                      </h5>
                      <p class="font-body-sm text-body-sm text-on-surface whitespace-pre-line leading-relaxed italic">{{ entry.observaciones || 'Sin observaciones adicionales registradas.' }}</p>
                    </div>
                    
                    <div class="pt-sm border-t border-outline-variant/30">
                      <h5 class="font-label-sm text-label-sm text-on-surface-variant mb-2 flex items-center gap-xs font-semibold">
                        <span class="material-symbols-outlined text-[14px]">local_hospital</span>
                        Veterinario Responsable
                      </h5>
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-label-sm border border-outline-variant shadow-sm uppercase">
                          {{ entry.nombreVeterinario?.substring(0, 2) || 'V' }}
                        </div>
                        <div>
                          <span class="font-label-md text-label-md text-on-surface font-semibold block leading-tight">{{ entry.nombreVeterinario }}</span>
                          <span class="text-[10px] text-on-surface-variant block">Colegiado Activo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="historial().length === 0" class="text-center py-xl bg-surface border border-outline-variant rounded-xl p-lg">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm" data-weight="fill">history_edu</span>
              <p class="font-headline-sm text-headline-sm text-on-surface mb-xs">Sin registros clínicos</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-md">Esta mascota no cuenta con registros de historial clínico aún.</p>
              <button 
                *ngIf="!authService.isRecepcionista()"
                (click)="openAddModal()" 
                class="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-all cursor-pointer">
                Crear Primer Registro
              </button>
            </div>
          </div>

          <!-- Load More -->
          <div *ngIf="hasMore()" class="flex justify-center mt-xl mb-xl">
            <button 
              (click)="loadMore()" 
              class="px-md py-sm border border-outline-variant rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all flex items-center gap-xs cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
              Cargar más registros
            </button>
          </div>
        </div>

        <!-- TAB CONTENT 2: VACCINES MODULE -->
        <div *ngIf="activeTab() === 'vacunas'" class="animate-fadeIn">
          <div class="flex justify-between items-center mb-md">
            <div>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold font-bold">Registro de Inmunizaciones</h4>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Control de vacunas aplicadas y refuerzos programados.</p>
            </div>
            <button 
              (click)="openAddVaccineModal()" 
              class="px-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm hover:shadow-md transition-all flex items-center gap-xs cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">add</span>
              Registrar Vacuna
            </button>
          </div>

          <!-- Vaccines grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md animate-fadeIn" *ngIf="vacunas().length > 0; else emptyVacunas">
            <div 
              *ngFor="let v of vacunas()" 
              class="bg-surface border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md hover:border-secondary/35 transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-sm">
              <div class="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-sm">
                  <div class="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                    <span class="material-symbols-outlined">vaccines</span>
                  </div>
                  <div>
                    <h5 class="font-label-md text-label-md text-on-surface font-bold">{{ v.nombreVacuna }}</h5>
                    <p class="text-[11px] text-on-surface-variant/85">Lote: {{ v.lote || '-' }}</p>
                  </div>
                </div>
                
                <button 
                  (click)="deleteVaccine(v)" 
                  class="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-surface-container cursor-pointer"
                  title="Eliminar vacuna">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-sm text-[12px] bg-surface-container-low/50 p-2.5 rounded-lg border border-outline-variant/20 mt-1">
                <div>
                  <span class="text-on-surface-variant block text-[10px] uppercase font-semibold">Aplicación</span>
                  <span class="text-on-surface font-medium">{{ formatVaccineDate(v.fechaAplicacion) }}</span>
                </div>
                <div>
                  <span class="text-on-surface-variant block text-[10px] uppercase font-semibold">Próxima Dosis</span>
                  <span class="text-secondary font-bold flex items-center gap-xs">
                    {{ formatVaccineDate(v.proximaDosis) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-1 text-[11px] text-on-surface-variant/90 border-t border-outline-variant/30 pt-sm">
                <p *ngIf="v.nombreVeterinario" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">local_hospital</span>
                  Aplicada por: Dr(a). {{ v.nombreVeterinario }}
                </p>
                <p *ngIf="v.observaciones" class="italic flex items-start gap-1 mt-0.5">
                  <span class="material-symbols-outlined text-[14px] shrink-0">info</span>
                  Obs: {{ v.observaciones }}
                </p>
              </div>
            </div>
          </div>

          <ng-template #emptyVacunas>
            <div class="text-center py-xl bg-surface border border-outline-variant rounded-xl p-lg">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">vaccines</span>
              <p class="font-headline-sm text-headline-sm text-on-surface mb-xs">Sin vacunas registradas</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-md">Esta mascota no cuenta con registro de vacunas aplicadas.</p>
              <button 
                (click)="openAddVaccineModal()" 
                class="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-all cursor-pointer">
                Registrar Primera Vacuna
              </button>
            </div>
          </ng-template>
        </div>

        <!-- TAB CONTENT 3: MEDICAL TREATMENTS -->
        <div *ngIf="activeTab() === 'tratamientos'" class="animate-fadeIn">
          <div class="flex justify-between items-center mb-md">
            <div>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Tratamientos Recetados</h4>
              <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Listado de medicamentos y terapias vigentes registradas para el paciente.</p>
            </div>
            <button 
              *ngIf="!authService.isRecepcionista()"
              (click)="openAddTreatmentModal()" 
              class="px-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm hover:shadow-md transition-all flex items-center gap-xs cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">add</span>
              Registrar Tratamiento
            </button>
          </div>

          <!-- Treatments List -->
          <div class="flex flex-col gap-sm" *ngIf="getTratamientos().length > 0; else emptyTratamientos">
            <div 
              *ngFor="let t of getTratamientos()" 
              class="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md hover:border-primary/45 transition-all duration-300 relative overflow-hidden flex flex-col gap-sm">
              
              <div class="flex items-center justify-between border-b border-outline-variant/30 pb-xs">
                <span class="text-[11px] text-primary font-bold uppercase tracking-wider flex items-center gap-xs font-semibold">
                  <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                  Fecha: {{ formatDateTime(t.fechaAtencion) }}
                </span>
                <span class="text-[11px] text-on-surface-variant font-medium">Dr(a). {{ t.nombreVeterinario }}</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div class="bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <h5 class="text-[11px] uppercase font-bold text-primary tracking-wider mb-1 flex items-center gap-xs font-semibold">
                    <span class="material-symbols-outlined text-[14px]">stethoscope</span> Diagnóstico:
                  </h5>
                  <p class="text-body-sm text-on-surface">{{ t.diagnostico }}</p>
                </div>

                <div class="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                  <h5 class="text-[11px] uppercase font-bold text-emerald-400 tracking-wider mb-1 flex items-center gap-xs font-semibold">
                    <span class="material-symbols-outlined text-[14px]">medication</span> Receta / Tratamiento:
                  </h5>
                  <p class="text-body-sm text-on-surface whitespace-pre-line leading-relaxed font-semibold">{{ t.tratamiento }}</p>
                </div>
              </div>
            </div>
          </div>

          <ng-template #emptyTratamientos>
            <div class="text-center py-xl bg-surface border border-outline-variant rounded-xl p-lg">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">medication</span>
              <p class="font-headline-sm text-headline-sm text-on-surface mb-xs">Sin tratamientos registrados</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-md">Esta mascota no registra tratamientos médicos vigentes.</p>
              <button 
                *ngIf="!authService.isRecepcionista()"
                (click)="openAddTreatmentModal()" 
                class="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-all cursor-pointer">
                Registrar Primer Tratamiento
              </button>
            </div>
          </ng-template>
        </div>

        <!-- TAB CONTENT 4: GROOMING AND BATHS -->
        <div *ngIf="activeTab() === 'estetica'" class="animate-fadeIn">
          <div class="flex justify-between items-center mb-md">
            <div>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Servicios de Estética y Baño</h4>
              <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Control de aseo general, corte de pelo y baños especializados.</p>
            </div>
            <button 
              (click)="openAddBathModal()" 
              class="px-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm hover:shadow-md transition-all flex items-center gap-xs cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">add</span>
              Registrar Baño / Corte
            </button>
          </div>

          <!-- Estética Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md animate-fadeIn" *ngIf="getEsteticaEntries().length > 0; else emptyEstetica">
            <div 
              *ngFor="let e of getEsteticaEntries()" 
              class="bg-surface border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md hover:border-primary/35 transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-sm">
              <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div class="flex justify-between items-start border-b border-outline-variant/30 pb-xs">
                <div class="flex items-center gap-sm">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    <span class="material-symbols-outlined">content_cut</span>
                  </div>
                  <div>
                    <h5 class="font-label-md text-label-md text-on-surface font-bold">Higiene / Estética</h5>
                    <p class="text-[11px] text-on-surface-variant/80">{{ formatDateTime(e.fechaAtencion) }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-sm my-1 text-[12px]">
                <div class="bg-surface-container-low/40 p-2.5 rounded-lg border border-outline-variant/20">
                  <span class="text-on-surface-variant block text-[10px] uppercase font-semibold">Detalles del Servicio</span>
                  <span class="text-on-surface leading-relaxed font-semibold text-white/90">{{ e.diagnostico }}</span>
                </div>
                <div class="bg-surface-container-low/40 p-2.5 rounded-lg border border-outline-variant/20" *ngIf="e.tratamiento">
                  <span class="text-on-surface-variant block text-[10px] uppercase font-semibold">Procedimiento</span>
                  <span class="text-on-surface leading-relaxed text-white/80">{{ e.tratamiento }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-1 text-[11px] text-on-surface-variant/90 border-t border-outline-variant/30 pt-sm">
                <p class="flex items-center gap-1 font-medium">
                  <span class="material-symbols-outlined text-[14px]">person</span>
                  Registrado por: Dr(a). {{ e.nombreVeterinario }}
                </p>
                <p *ngIf="e.observaciones" class="italic flex items-start gap-1 mt-0.5">
                  <span class="material-symbols-outlined text-[14px] shrink-0">info</span>
                  Notas: {{ e.observaciones }}
                </p>
              </div>
            </div>
          </div>

          <ng-template #emptyEstetica>
            <div class="text-center py-xl bg-surface border border-outline-variant rounded-xl p-lg">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">content_cut</span>
              <p class="font-headline-sm text-headline-sm text-on-surface mb-xs">Sin registros de estética</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-md">Esta mascota no cuenta con registro de servicios de baño o estética.</p>
              <button 
                (click)="openAddBathModal()" 
                class="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-all cursor-pointer">
                Registrar Primer Baño
              </button>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- STATE 2: NO PATIENT SELECTED (SEARCH SCREEN) OR LOADING -->
      <ng-template #selectOrLoading>
        
        <!-- Search Screen -->
        <div *ngIf="!mascotaId" class="flex-grow">
          <!-- Page Header -->
          <div class="mb-xl">
            <h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center gap-sm font-bold animate-fadeIn">
              <span class="material-symbols-outlined text-[32px] text-primary">search</span>
              Consultar Historial Clínico
            </h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Busque un paciente para consultar su historial médico completo.</p>
          </div>

          <!-- Search Box Section -->
          <div class="bg-surface border border-outline-variant rounded-xl p-lg mb-xl shadow-sm hover:border-primary/20 transition-all duration-300">
            <div class="relative w-full max-w-2xl mx-auto">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]">search</span>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="filterMascotas()"
                placeholder="Escriba el nombre del paciente, raza o dueño..." 
                class="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md transition-colors placeholder:text-on-surface-variant/60 shadow-inner" />
            </div>
          </div>

          <!-- Patients Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter search-pet-grid">
            <div 
              *ngFor="let pet of filteredMascotas()" 
              class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative group animate-slideIn">
              
              <div class="h-40 w-full relative overflow-hidden bg-surface-container-low">
                <img 
                  [src]="getPetImage(pet)" 
                  [alt]="pet.nombre" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                
                <div class="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    (click)="switchPatient(pet.idMascota!)"
                    class="flex items-center gap-xs bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg shadow-md hover:bg-primary-container transition-all cursor-pointer">
                    <span class="material-symbols-outlined text-[20px]">history_edu</span>
                    Ver Historial
                  </button>
                </div>
                
                <div class="absolute top-sm right-sm">
                  <span 
                    class="inline-flex items-center gap-xs px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-md border backdrop-blur-md bg-secondary-container text-on-secondary-container border-secondary/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> Activo
                  </span>
                </div>
              </div>

              <div class="p-md flex flex-col flex-grow">
                <div class="min-w-0 mb-sm">
                  <h3 class="font-headline-sm text-headline-sm text-on-surface truncate font-bold">{{ pet.nombre }}</h3>
                  <span class="inline-block mt-xs px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 truncate max-w-full">
                    {{ pet.nombreEspecie }} • {{ pet.nombreRaza }}
                  </span>
                </div>
                
                <div class="pt-sm border-t border-outline-variant/50 text-body-sm space-y-xs flex-grow text-white/80">
                  <div class="flex items-center justify-between text-on-surface-variant">
                    <span>Edad:</span>
                    <span class="font-medium text-on-surface text-white/95">{{ calculateAge(pet.fechaNacimiento) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-on-surface-variant">
                    <span>Dueño:</span>
                    <span class="font-medium text-on-surface truncate max-w-[150px] text-white/95" [title]="pet.nombreCliente ?? ''">{{ pet.nombreCliente || 'Sin propietario' }}</span>
                  </div>
                </div>

                <div class="mt-md pt-sm border-t border-outline-variant/50">
                  <button 
                    (click)="switchPatient(pet.idMascota!)"
                    class="w-full py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-xs border border-primary/20 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">history_edu</span>
                    Consultar Historial
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results State -->
          <div *ngIf="filteredMascotas().length === 0" class="text-center py-xl bg-surface border border-outline-variant rounded-xl p-lg mt-md">
            <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">search_off</span>
            <p class="font-headline-sm text-headline-sm text-on-surface mb-xs">No se encontraron pacientes</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Pruebe ajustando el texto o busque otro término.</p>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="mascotaId && !mascota()" class="flex items-center justify-center min-h-[400px]">
          <div class="flex flex-col items-center gap-sm">
            <span class="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
            <p class="font-body-sm text-body-sm text-on-surface-variant font-medium">Cargando historial clínico...</p>
          </div>
        </div>
      </ng-template>

      <!-- Modal Add / Edit (Clinical History Entry) -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl max-w-lg w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">
              {{ isEditMode() ? 'Editar Registro Médico' : 'Agregar Registro Médico' }}
            </h3>
            <button (click)="closeModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
          </div>

          <form (ngSubmit)="saveEntry()" #entryForm="ngForm" class="flex flex-col gap-md">
            
            <!-- Veterinario dropdown -->
            <div class="form-group flex flex-col gap-xs">
              <label for="veterinario" class="font-label-md text-label-md text-on-surface-variant">Veterinario Responsable</label>
              <select 
                id="veterinario" 
                name="idVeterinario" 
                [(ngModel)]="activeEntry.idVeterinario" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                <option [value]="0" disabled>Seleccione un veterinario...</option>
                <option *ngFor="let v of veterinarios()" [value]="v.idVeterinario">
                  Dr(a). {{ v.nombres }} {{ v.apellidoPaterno }} {{ v.apellidoMaterno }} ({{ v.especialidad }})
                </option>
              </select>
            </div>

            <!-- Temp & Peso Grid -->
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="temperatura" class="font-label-md text-label-md text-on-surface-variant">Temperatura (°C)</label>
                <input 
                  type="number" 
                  step="0.1"
                  id="temperatura" 
                  name="temperatura" 
                  [(ngModel)]="activeEntry.temperatura" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                  placeholder="38.5">
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="peso" class="font-label-md text-label-md text-on-surface-variant">Peso (kg)</label>
                <input 
                  type="number" 
                  step="0.01"
                  id="peso" 
                  name="peso" 
                  [(ngModel)]="activeEntry.peso" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                  placeholder="25.0">
              </div>
            </div>

            <!-- Diagnostico -->
            <div class="form-group flex flex-col gap-xs">
              <label for="diagnostico" class="font-label-md text-label-md text-on-surface-variant">Detalle o Diagnóstico</label>
              <textarea 
                id="diagnostico" 
                name="diagnostico" 
                [(ngModel)]="activeEntry.diagnostico" 
                required
                rows="3"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Descripción del diagnóstico médico o detalle del servicio..."></textarea>
            </div>

            <!-- Tratamiento -->
            <div class="form-group flex flex-col gap-xs">
              <label for="tratamiento" class="font-label-md text-label-md text-on-surface-variant">Tratamiento / Procedimiento (Opcional)</label>
              <textarea 
                id="tratamiento" 
                name="tratamiento" 
                [(ngModel)]="activeEntry.tratamiento" 
                rows="2"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Medicamentos recetados, dosis o instrucciones específicas..."></textarea>
            </div>

            <!-- Observaciones -->
            <div class="form-group flex flex-col gap-xs">
              <label for="observaciones" class="font-label-md text-label-md text-on-surface-variant">Observaciones Adicionales</label>
              <textarea 
                id="observaciones" 
                name="observaciones" 
                [(ngModel)]="activeEntry.observaciones" 
                rows="2"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Comentarios o notas de seguimiento..."></textarea>
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
                [disabled]="!entryForm.valid || activeEntry.idVeterinario === 0" 
                class="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-tint transition-colors">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Add Vaccine -->
      <div *ngIf="isVaccineModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl max-w-lg w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <div class="flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary text-[28px]">vaccines</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold font-bold">Registrar Vacuna</h3>
            </div>
            <button (click)="closeVaccineModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
          </div>

          <form (ngSubmit)="saveVaccine()" #vaccineForm="ngForm" class="flex flex-col gap-md">
            
            <!-- Vaccine select / free text -->
            <div class="form-group flex flex-col gap-xs">
              <label for="vacunaCatalog" class="font-label-md text-label-md text-on-surface-variant">Vacuna / Inmunización</label>
              <select 
                id="vacunaCatalog" 
                name="vacunaCatalogSelect" 
                [(ngModel)]="activeVaccine.nombreVacuna" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                <option value="" disabled>Seleccione una vacuna del catálogo...</option>
                <option *ngFor="let vac of vacunasCatalogo()" [value]="vac.nombre">
                  {{ vac.nombre }} ({{ vac.dosisRecomendada || 'Dosis normal' }})
                </option>
                <option value="OTRA">Otra vacuna (Escribir abajo)...</option>
              </select>
              <input 
                *ngIf="activeVaccine.nombreVacuna === 'OTRA' || !isCatalogVaccine(activeVaccine.nombreVacuna)"
                type="text" 
                name="customVacuna" 
                [(ngModel)]="customVaccineName" 
                required 
                placeholder="Escribe el nombre de la vacuna..." 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface mt-xs">
            </div>

            <!-- Veterinario dropdown -->
            <div class="form-group flex flex-col gap-xs">
              <label for="vacVeterinario" class="font-label-md text-label-md text-on-surface-variant">Veterinario Aplicador</label>
              <select 
                id="vacVeterinario" 
                name="vacVeterinario" 
                [(ngModel)]="activeVaccine.nombreVeterinario" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                <option value="" disabled>Seleccione...</option>
                <option *ngFor="let v of veterinarios()" [value]="v.nombreCompleto">
                  Dr(a). {{ v.nombreCompleto }} ({{ v.especialidad }})
                </option>
              </select>
            </div>

            <!-- Dates Grid -->
            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="fechaAplicacion" class="font-label-md text-label-md text-on-surface-variant">Fecha Aplicación</label>
                <input 
                  type="date" 
                  id="fechaAplicacion" 
                  name="fechaAplicacion" 
                  [(ngModel)]="activeVaccine.fechaAplicacion" 
                  required
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="proximaDosis" class="font-label-md text-label-md text-on-surface-variant">Próxima Dosis / Refuerzo</label>
                <input 
                  type="date" 
                  id="proximaDosis" 
                  name="proximaDosis" 
                  [(ngModel)]="activeVaccine.proximaDosis" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
              </div>
            </div>

            <!-- Lot -->
            <div class="form-group flex flex-col gap-xs">
              <label for="vacLote" class="font-label-md text-label-md text-on-surface-variant">Lote de Vacuna</label>
              <input 
                type="text" 
                id="vacLote" 
                name="vacLote" 
                [(ngModel)]="activeVaccine.lote" 
                placeholder="Ej. LOT-2026-X8"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
            </div>

            <!-- Observations -->
            <div class="form-group flex flex-col gap-xs">
              <label for="vacObs" class="font-label-md text-label-md text-on-surface-variant">Observaciones</label>
              <textarea 
                id="vacObs" 
                name="vacObs" 
                [(ngModel)]="activeVaccine.observaciones" 
                rows="2"
                placeholder="Escribe comentarios, síntomas o reacciones si los hay..."
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface"></textarea>
            </div>

            <div class="flex justify-end gap-sm border-t border-outline-variant pt-md mt-sm">
              <button 
                type="button" 
                (click)="closeVaccineModal()" 
                class="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="!vaccineForm.valid" 
                class="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-tint transition-colors">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .animate-slideIn {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class HistorialClinicoComponent implements OnInit {
  mascotaId = 0;
  mascota = signal<Mascota | null>(null);
  historial = signal<HistorialClinico[]>([]);
  veterinarios = signal<Veterinario[]>([]);

  // Tab state
  activeTab = signal<'consultas' | 'vacunas' | 'tratamientos' | 'estetica'>('consultas');
  vacunas = signal<MascotaVacuna[]>([]);
  vacunasCatalogo = signal<VacunaCatalog[]>([]);
  proximaVisita = signal<string>('Ninguna programada');

  // Search Screen State (General Search)
  allMascotas = signal<Mascota[]>([]);
  searchQuery = '';
  filteredMascotas = signal<Mascota[]>([]);

  // Quick Switcher State (Timeline switcher)
  switchSearchQuery = '';
  switchFilteredMascotas = signal<Mascota[]>([]);

  // Pagination
  currentPage = 0;
  pageSize = 10;
  hasMore = signal(false);

  // Modal State
  isModalOpen = signal(false);
  isEditMode = signal(false);
  activeEntry: HistorialClinico = this.getEmptyEntry();

  // Vaccine Modal
  isVaccineModalOpen = signal(false);
  activeVaccine: MascotaVacuna = this.getEmptyVaccine();
  customVaccineName = '';

  // Images for display
  dogImage1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGi4C-TvQskBoEaMSqPF3TCZqF6xdUf2JyOsDXsviKob3ruTFkm9LmPPHDXO3fVww3bVTzGRBg1eZtL9B0VT8y4QWXdCq5hVcIRN_erjj6bnWklpRRm4ng7KfMBLSqTu-6cKj8E5xlxrOrM98BjbQlnkC1k6x3UW9PVirOYflSX7F7gExaByG0I1WQdPALBJmc6hr14AI-l8SVu8NOUHjUr_5s15Any8XsTSy5bAKuvOUs7Mtg16XPtmcXiGQynusXx5K8knx-8tI';
  catImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGSGrA9quus7p9RM1K_ne08eXam7tMlquWYr-4j1wYH9vhDy25zNr8nGGVKnpi-DOh0vwNv-3jJxcn9xaLDGBzhe3fGR9j2BKKAQwilh8C23kfRl9iNKR949kam7maN7u8Il8CeX0rlkmXBZnfL3vVLcBbVsBQiQ1WYb1j-dbdEcCNJuBfX3E--QcOCIvSPNT-XC1WjwVO9J5d0FX-K7CcaXtx3WL3xt3r6rYfxHClhVKHBKTdlrU87ZX0FWfcavX2DQnlxFrLxs';
  dogImage2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfDVSWG_QjD4bssvQnQSMKhO1BB-QrrrdnXo1ks9UkF_2Yh2OyH0zjA4ajBcsgWDv4AgZFjbxP0TVAwh-zEDK32vjiyNatlb5juBnoT0S2TzCpmwkH3kus0a9YLXpo1I10o5iS7k0IawlQV9TjBEf_5JXGkUIgA8hEW1jsEeQZFHXfLJkSupA9vIId-Nbm2Ux54mSYVHZdnMvagmqJDjWcSYANEuG6qFOOMRmP_RikELDnFZd5CaqA2RJotnNMYhOMkoduHqzThds';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllMascotas();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.mascotaId = +id;
        this.loadMascotaDetails();
        this.loadHistorial(true);
        this.loadVeterinarios();
        this.loadMascotaVacunas();
        this.loadVacunasCatalogo();
        this.loadProximaVisita();
      } else {
        this.mascotaId = 0;
        this.mascota.set(null);
        this.historial.set([]);
        this.vacunas.set([]);
      }
    });
  }

  animateBento(): void {
    setTimeout(() => {
      const blocks = document.querySelectorAll('.grid-cols-1.lg\\:grid-cols-3 > div');
      if (blocks.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(blocks, 
          { y: 35, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
        );
      }
    }, 100);
  }

  animateTimeline(): void {
    setTimeout(() => {
      const cards = document.querySelectorAll('.timeline-card-wrapper');
      if (cards.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
          { y: 40, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, 150);
  }

  animateSearchGrid(): void {
    setTimeout(() => {
      const gridCards = document.querySelectorAll('.search-pet-grid > div');
      if (gridCards.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(gridCards, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
        );
      }
    }, 150);
  }

  loadAllMascotas(): void {
    this.dataService.getMascotas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.allMascotas.set(res.data.content.filter(p => p.estado));
          this.filterMascotas();
        }
      }
    });
  }

  filterMascotas(): void {
    const q = (this.searchQuery || '').toLowerCase().trim();
    if (!q) {
      this.filteredMascotas.set(this.allMascotas());
      this.animateSearchGrid();
      return;
    }
    const filtered = this.allMascotas().filter(m => 
      m.nombre.toLowerCase().includes(q) || 
      (m.nombreCliente || '').toLowerCase().includes(q) || 
      (m.nombreRaza || '').toLowerCase().includes(q) || 
      (m.nombreEspecie || '').toLowerCase().includes(q)
    );
    this.filteredMascotas.set(filtered);
    this.animateSearchGrid();
  }

  filterSwitchMascotas(): void {
    const q = (this.switchSearchQuery || '').toLowerCase().trim();
    if (!q) {
      this.switchFilteredMascotas.set([]);
      return;
    }
    const filtered = this.allMascotas().filter(m => 
      m.nombre.toLowerCase().includes(q) || 
      (m.nombreCliente || '').toLowerCase().includes(q)
    );
    this.switchFilteredMascotas.set(filtered);
  }

  switchPatient(id: number): void {
    this.switchSearchQuery = '';
    this.switchFilteredMascotas.set([]);
    this.router.navigate(['/historial-clinico', id]);
  }

  clearSwitchSearch(): void {
    this.switchSearchQuery = '';
    this.switchFilteredMascotas.set([]);
  }

  loadMascotaDetails(): void {
    this.dataService.getMascota(this.mascotaId).subscribe({
      next: (res) => {
        if (res.success) {
          this.mascota.set(res.data);
          this.animateBento();
        }
      },
      error: () => this.router.navigate(['/historial-clinico'])
    });
  }

  loadHistorial(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 0;
    }
    this.dataService.getHistorialClinicoByMascota(this.mascotaId, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const list = res.data.content || [];
          if (reset) {
            this.historial.set(list);
          } else {
            this.historial.set([...this.historial(), ...list]);
          }
          this.hasMore.set(!res.data.last);
          this.animateTimeline();
        }
      }
    });
  }

  loadMascotaVacunas(): void {
    this.dataService.getVacunasByMascota(this.mascotaId, 0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.vacunas.set(res.data.content);
        }
      }
    });
  }

  loadVacunasCatalogo(): void {
    this.dataService.getVacunas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.vacunasCatalogo.set(res.data.content);
        }
      }
    });
  }

  loadProximaVisita(): void {
    this.dataService.getCitas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          const petCitas = res.data.content.filter(c => c.idMascota === this.mascotaId && c.estadoCita !== 'CANCELADA' && c.estadoCita !== 'ATENDIDA');
          const today = new Date();
          today.setHours(0,0,0,0);
          const futureCitas = petCitas
            .map(c => ({ ...c, date: new Date(c.fechaHora) }))
            .filter(c => c.date > today)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
          
          if (futureCitas.length > 0) {
            this.proximaVisita.set(this.formatVaccineDate(futureCitas[0].fechaHora));
          } else {
            this.proximaVisita.set('Ninguna programada');
          }
        }
      }
    });
  }

  loadVeterinarios(): void {
    this.dataService.getVeterinarios(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.veterinarios.set((res.data.content || []).filter(v => v.estado));
        }
      }
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.loadHistorial(false);
  }

  getEmptyEntry(): HistorialClinico {
    return {
      idMascota: this.mascotaId,
      idVeterinario: 0,
      diagnostico: '',
      tratamiento: '',
      observaciones: '',
      temperatura: undefined,
      peso: undefined
    };
  }

  getEmptyVaccine(): MascotaVacuna {
    return {
      idMascota: this.mascotaId,
      nombreVacuna: '',
      nombreVeterinario: '',
      fechaAplicacion: new Date().toISOString().substring(0, 10),
      proximaDosis: '',
      lote: '',
      observaciones: ''
    };
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.activeEntry = this.getEmptyEntry();
    this.isModalOpen.set(true);
  }

  openEditModal(entry: HistorialClinico): void {
    this.isEditMode.set(true);
    this.activeEntry = { ...entry };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveEntry(): void {
    this.activeEntry.idMascota = this.mascotaId;

    if (this.isEditMode()) {
      const id = this.activeEntry.idHistorial!;
      this.dataService.updateHistorialClinico(id, this.activeEntry).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadHistorial(true);
            this.closeModal();
          }
        }
      });
    } else {
      this.dataService.createHistorialClinico(this.activeEntry).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadHistorial(true);
            this.closeModal();
          }
        }
      });
    }
  }

  deleteEntry(entry: HistorialClinico): void {
    if (confirm('¿Está seguro de que desea eliminar este registro clínico del historial?')) {
      this.dataService.deleteHistorialClinico(entry.idHistorial!).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadHistorial(true);
          }
        }
      });
    }
  }

  // Vaccine Modal methods
  openAddVaccineModal(): void {
    this.activeVaccine = this.getEmptyVaccine();
    this.customVaccineName = '';
    this.isVaccineModalOpen.set(true);
  }

  closeVaccineModal(): void {
    this.isVaccineModalOpen.set(false);
  }

  isCatalogVaccine(name: string): boolean {
    if (!name) return true;
    if (name === 'OTRA') return false;
    return this.vacunasCatalogo().some(v => v.nombre === name);
  }

  saveVaccine(): void {
    if (this.activeVaccine.nombreVacuna === 'OTRA' || !this.isCatalogVaccine(this.activeVaccine.nombreVacuna)) {
      this.activeVaccine.nombreVacuna = this.customVaccineName;
    }
    this.activeVaccine.idMascota = this.mascotaId;

    this.dataService.createMascotaVacuna(this.activeVaccine).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadMascotaVacunas();
          this.closeVaccineModal();
          this.loadProximaVisita();
        }
      }
    });
  }

  deleteVaccine(v: MascotaVacuna): void {
    if (confirm(`¿Está seguro de que desea eliminar el registro de la vacuna ${v.nombreVacuna}?`)) {
      this.dataService.deleteMascotaVacuna(v.idMascotaVacuna!).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadMascotaVacunas();
            this.loadProximaVisita();
          }
        }
      });
    }
  }

  // Treatments and Grooming shortcuts
  getTratamientos(): HistorialClinico[] {
    return this.historial().filter(entry => entry.tratamiento && entry.tratamiento.trim() !== '');
  }

  getEsteticaEntries(): HistorialClinico[] {
    return this.historial().filter(entry => {
      const diag = (entry.diagnostico || '').toLowerCase();
      const obs = (entry.observaciones || '').toLowerCase();
      return diag.includes('baño') || diag.includes('higiene') || diag.includes('estetic') || diag.includes('grooming') || obs.includes('baño');
    });
  }

  openAddTreatmentModal(): void {
    this.isEditMode.set(false);
    this.activeEntry = this.getEmptyEntry();
    this.activeEntry.diagnostico = 'Tratamiento Médico';
    this.activeEntry.tratamiento = 'Prescripción médica detallada...';
    this.isModalOpen.set(true);
  }

  openAddBathModal(): void {
    this.isEditMode.set(false);
    this.activeEntry = this.getEmptyEntry();
    this.activeEntry.diagnostico = 'Servicio de Baño e Higiene';
    this.activeEntry.tratamiento = 'Baño de limpieza, corte de uñas, limpieza de conducto auditivo.';
    this.activeEntry.observaciones = 'Sin novedades clínicas durante el aseo.';
    this.isModalOpen.set(true);
  }

  printRecords(): void {
    window.print();
  }

  calculateAge(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const birth = new Date(dateStr);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return `${years} año${years > 1 ? 's' : ''} ${months} mes${months > 1 ? 'es' : ''}`;
      }
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } catch (e) {
      return '-';
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  }

  formatVaccineDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  getEntryType(entry: HistorialClinico): string {
    const diag = (entry.diagnostico || '').toLowerCase();
    const trat = (entry.tratamiento || '').toLowerCase();
    if (diag.includes('vacun') || trat.includes('vacun') || trat.includes('booster') || trat.includes('dhpp') || trat.includes('rabia')) return 'Vacunación';
    if (diag.includes('alerg') || diag.includes('dermat')) return 'Alergia';
    if (diag.includes('control') || diag.includes('anual') || diag.includes('rutina') || diag.includes('chequeo')) return 'Control';
    if (diag.includes('urgencia') || diag.includes('fractura') || diag.includes('grave')) return 'Urgencia';
    if (diag.includes('baño') || diag.includes('grooming') || diag.includes('estetic') || diag.includes('higiene')) return 'Estética';
    return 'Consulta';
  }

  getCategoryIcon(entry: HistorialClinico): string {
    const type = this.getEntryType(entry);
    switch (type) {
      case 'Vacunación':
        return 'vaccines';
      case 'Alergia':
        return 'healing';
      case 'Control':
        return 'check_circle';
      case 'Urgencia':
        return 'warning';
      case 'Estética':
        return 'content_cut';
      default:
        return 'stethoscope';
    }
  }

  getBadgeColor(entry: HistorialClinico): string {
    const type = this.getEntryType(entry);
    switch (type) {
      case 'Vacunación':
        return 'bg-secondary-container text-on-secondary-container border-secondary/20';
      case 'Alergia':
        return 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20';
      case 'Control':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Urgencia':
        return 'bg-error-container text-on-error-container border-error/20';
      case 'Estética':
        return 'bg-gradient-to-br from-indigo-500/10 to-purple-500/5 text-indigo-300 border-indigo-500/20';
      default:
        return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
    }
  }

  getTempStatusText(temp: number): string {
    if (temp > 39.2) return 'Alta';
    if (temp < 37.5) return 'Baja';
    return 'Normal';
  }

  getTempStatusClass(temp: number): string {
    if (temp > 39.2) return 'bg-error-container text-error border-error/20';
    if (temp < 37.5) return 'bg-tertiary-fixed text-tertiary border-tertiary/20';
    return 'bg-secondary-container text-on-secondary-container border-secondary/20';
  }

  getPetImage(pet: Mascota): string {
    if (!pet) return this.dogImage2;
    if (pet.nombre.toLowerCase().includes('max') || (pet.nombreEspecie?.toLowerCase().includes('perro') && pet.nombreRaza?.toLowerCase().includes('retriever'))) {
      return this.dogImage1;
    }
    if (pet.nombre.toLowerCase().includes('bella') || pet.idMascota === 1) {
      return this.dogImage2;
    }
    if (pet.nombre.toLowerCase().includes('luna') || pet.idMascota === 2 || pet.nombreEspecie?.toLowerCase().includes('gato')) {
      return this.catImage;
    }
    return this.dogImage2;
  }
}
