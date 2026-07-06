import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Cita, Mascota, Veterinario, Servicio, Cliente } from '../../services/data';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col xl:flex-row gap-gutter xl:h-[calc(100vh-140px)] xl:overflow-hidden box-border">
      
      <!-- Left Column: Interactive Calendar View -->
      <div class="flex-1 bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col h-[600px] xl:h-full overflow-hidden">
        
        <!-- Calendar Toolbar -->
        <div class="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container">
          <div class="flex items-center gap-md">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ getCalendarTitle() }}</h2>
            <div class="flex items-center bg-surface-container-high rounded-lg border border-outline-variant p-1">
              <button (click)="previousWeek()" class="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <button (click)="goToday()" class="px-3 py-1 font-label-md text-label-md text-on-surface hover:bg-surface-container rounded transition-colors">Hoy</button>
              <button (click)="nextWeek()" class="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          <div class="flex items-center gap-md">
            <!-- Status Legend -->
            <div class="hidden xl:flex items-center gap-sm mr-4">
              <div class="flex items-center gap-xs">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Pendiente</span>
              </div>
              <div class="flex items-center gap-xs">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.4)]"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Confirmada</span>
              </div>
              <div class="flex items-center gap-xs">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Atendida</span>
              </div>
              <div class="flex items-center gap-xs">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Cancelada</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar Filters Sub-Toolbar -->
        <div class="px-lg py-xs border-b border-outline-variant flex flex-wrap gap-md items-center bg-surface-container-low/30 justify-between">
          <div class="flex flex-wrap items-center gap-md py-1 flex-1">
            <!-- Search input -->
            <div class="relative w-full max-w-xs">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                placeholder="Buscar por mascota, dueño, vet, servicio..." 
                class="w-full bg-surface-container border border-outline-variant rounded-lg py-1.5 pl-9 pr-4 focus:outline-none focus:border-primary text-[12px] text-on-surface placeholder:text-on-surface-variant/60">
            </div>

            <!-- Vet Filter -->
            <div class="flex items-center gap-xs">
              <span class="text-[11px] text-on-surface-variant font-medium">Vet:</span>
              <select 
                [(ngModel)]="filterVetId"
                class="bg-surface-container-low border border-outline-variant rounded-lg py-1 px-3 text-[11px] focus:outline-none focus:border-primary text-on-surface">
                <option [value]="0">Todos los Veterinarios</option>
                <option *ngFor="let v of veterinarios()" [value]="v.idVeterinario">Dr. {{ v.nombreCompleto }}</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div class="flex items-center gap-xs">
              <span class="text-[11px] text-on-surface-variant font-medium">Estado:</span>
              <select 
                [(ngModel)]="filterEstado"
                class="bg-surface-container-low border border-outline-variant rounded-lg py-1 px-3 text-[11px] focus:outline-none focus:border-primary text-on-surface">
                <option value="TODOS">Todos los Estados</option>
                <option value="PROGRAMADA">PROGRAMADA</option>
                <option value="REPROGRAMADA">REPROGRAMADA</option>
                <option value="ATENDIDA">ATENDIDA</option>
                <option value="CANCELADA">CANCELADA</option>
              </select>
            </div>
          </div>

          <!-- Quick statistics badge -->
          <div class="flex items-center gap-sm shrink-0">
            <span class="text-[11px] text-on-surface-variant font-medium">
              Viendo: <strong class="text-on-surface font-semibold">{{ getFilteredCitas().length }}</strong> de {{ citas().length }} citas
            </span>
            <button 
              *ngIf="searchTerm || filterVetId !== 0 || filterEstado !== 'TODOS'"
              (click)="clearFilters()" 
              class="text-[11px] text-primary hover:text-surface-tint font-bold underline transition-colors">
              Limpiar filtros
            </button>
          </div>
        </div>

        <!-- Scrollable Wrapper for Calendar Header and Body -->
        <div class="flex-grow flex flex-col overflow-x-auto">
          <div class="min-w-[750px] flex-grow flex flex-col">
            <!-- Calendar Header (Days) -->
            <div class="grid grid-cols-[65px_repeat(7,_1fr)] border-b border-outline-variant bg-surface sticky top-0 z-10">
              <div class="border-r border-outline-variant p-2 flex items-end justify-center">
                <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hora</span>
              </div>
              <!-- Day Headers -->
              <div 
                *ngFor="let day of weekDays; let i = index" 
                class="p-3 text-center border-r border-outline-variant"
                [ngClass]="{'bg-primary-container/10': isToday(day)}">
                <div class="font-label-sm text-label-sm uppercase" [ngClass]="isToday(day) ? 'text-primary font-bold' : 'text-on-surface-variant'">
                  {{ getDayName(day) }}
                </div>
                <div class="font-headline-sm text-headline-sm mt-1" [ngClass]="isToday(day) ? 'text-primary font-bold' : 'text-on-surface'">
                  {{ day.getDate() }}
                </div>
              </div>
            </div>

            <!-- Calendar Body (Scrollable Grid) -->
            <div class="flex-grow overflow-y-auto relative bg-surface">
              <div class="grid grid-cols-[65px_repeat(7,_1fr)] min-h-[600px] relative">
                
                <!-- Time Column -->
                <div class="border-r border-outline-variant calendar-grid-bg flex flex-col pt-[30px] z-10 bg-surface sticky left-0">
                  <!-- Hour markers (every 60px height) -->
                  <div *ngFor="let h of hourMarkers" class="h-[60px] text-right pr-2">
                    <span class="font-label-sm text-label-sm text-on-surface-variant relative -top-3">{{ h }}:00</span>
                  </div>
                </div>

                <!-- Day Columns -->
                <div 
                  *ngFor="let day of weekDays"
                  class="border-r border-outline-variant calendar-grid-bg relative"
                  [ngClass]="{'bg-primary-container/5': isToday(day), 'bg-surface-container-low/20': isWeekend(day)}">
                  
                  <!-- Cita blocks in column -->
                  <div 
                    *ngFor="let cita of getCitasForDay(day)"
                    [ngStyle]="getEventStyle(cita, day)"
                    (click)="openStateModal(cita)"
                    class="absolute rounded-xl border-l-4 shadow-lg p-2 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-[1px] transition-all duration-300 cursor-pointer group animate-slideIn"
                    [ngClass]="getEventClass(cita.estadoCita)"
                    [title]="cita.nombreMascota + ' - ' + cita.nombreServicio + ' (Dr. ' + cita.nombreVeterinario + ')\nMotivo: ' + cita.motivo">
                    
                    <!-- Row 1: Pet Avatar + Name + Hour -->
                    <div class="flex items-center gap-1.5 leading-none min-w-0">
                      <img 
                        [src]="getPetImage(cita.nombreMascota)" 
                        alt="Mascota" 
                        class="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" />
                      <div class="min-w-0 flex-1">
                        <span class="font-label-sm text-[10px] xl:text-[11px] font-bold truncate block leading-tight">{{ cita.nombreMascota }}</span>
                        <span class="text-[9px] opacity-80 block">{{ getHourOnly(cita.fechaHora) }}</span>
                      </div>
                    </div>
                    
                    <!-- Row 2: Service Icon + Service Name + Price -->
                    <div class="flex justify-between items-center leading-none gap-1 mt-0.5 min-w-0">
                      <div class="flex items-center gap-1 min-w-0">
                        <span class="material-symbols-outlined text-[11px] opacity-80 shrink-0">{{ getServiceIcon(cita.nombreServicio) }}</span>
                        <span class="text-[8px] xl:text-[9px] opacity-85 truncate">{{ cita.nombreServicio }}</span>
                      </div>
                      <span class="text-[8px] xl:text-[9px] font-bold opacity-90 shrink-0">{{ getServicioPrecio(cita.idServicio) }}</span>
                    </div>
                  </div>

                  <!-- Time Line indicator inside today's column -->
                  <div 
                    *ngIf="isToday(day) && showTimeIndicator"
                    [style.top.px]="timeIndicatorTop"
                    class="absolute left-0 right-0 h-[2px] bg-error z-20">
                    <div class="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-error animate-ping"></div>
                    <div class="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-error"></div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Daily Agenda Sidebar -->
      <aside class="w-full xl:w-[360px] h-[500px] xl:h-full bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden shrink-0">
        <!-- Agenda Header -->
        <div class="p-lg border-b border-outline-variant bg-surface-container flex flex-col gap-sm">
          <div class="flex justify-between items-center">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Agenda Diaria</h3>
          </div>
          <div class="flex items-center justify-between">
            <p class="font-body-sm text-body-sm text-on-surface-variant font-medium capitalize">{{ formatDateHeader(selectedDate) }}</p>
            <span class="px-2.5 py-1 bg-surface-container-high border border-outline-variant rounded-md font-label-sm text-label-sm text-on-surface">
              {{ getCitasForDay(selectedDate).length }} Citas
            </span>
          </div>
        </div>

        <!-- Mini Date Picker -->
        <div class="px-md py-sm border-b border-outline-variant bg-surface-container/30 flex justify-between items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div 
            *ngFor="let day of weekDays"
            (click)="selectDate(day)"
            class="flex flex-col items-center py-2 px-1.5 rounded-xl cursor-pointer min-w-[42px] transition-all duration-300 border"
            [ngClass]="isSelectedDate(day) ? 'bg-primary border-primary text-on-primary shadow-lg scale-105 font-bold' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-outline-variant/80'">
            <span class="font-label-xs text-[8px] uppercase tracking-wider opacity-85">{{ getDayNameShort(day) }}</span>
            <span class="font-label-md text-label-md mt-0.5">{{ day.getDate() }}</span>
          </div>
        </div>

        <!-- Agenda List (Scrollable) -->
        <div class="flex-grow overflow-y-auto p-md flex flex-col gap-sm bg-surface">
          <div 
            *ngFor="let cita of getCitasForDay(selectedDate)" 
            class="p-md rounded-xl border flex flex-col gap-sm relative transition-all duration-300 hover:shadow-md select-none"
            [ngClass]="getAgendaCardClass(cita)">
            
            <!-- Row 1: Header/Time & State & Actions -->
            <div class="flex items-center justify-between gap-sm">
              <div class="flex items-center gap-sm">
                <div class="flex items-center justify-center w-12 h-8 rounded-lg bg-surface-container border border-outline-variant font-label-md text-label-md font-bold text-on-surface">
                  {{ getHourOnly(cita.fechaHora) }}
                </div>
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[9px] uppercase tracking-wider border"
                  [ngClass]="getBadgeClass(cita.estadoCita)">
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" [ngClass]="getBadgeDotClass(cita.estadoCita)"></span>
                  {{ cita.estadoCita }}
                </span>
              </div>
              
              <div class="flex items-center gap-1">
                <button 
                  (click)="toggleAgendaExpand(cita.idCita!)"
                  class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container"
                  title="Ver detalles">
                  <span class="material-symbols-outlined text-[18px]">
                    {{ expandedAgendaCitaId() === cita.idCita ? 'expand_less' : 'expand_more' }}
                  </span>
                </button>
                <button (click)="openStateModal(cita)" class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container" title="Actualizar estado">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
            
            <!-- Row 2: Pet & Service Details -->
            <div class="flex gap-md items-start">
              <div class="p-2 rounded-xl bg-surface-container-high border border-outline-variant text-primary shrink-0">
                <span class="material-symbols-outlined text-[24px]">{{ getServiceIcon(cita.nombreServicio) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-1">
                  <h4 class="font-label-md text-[14px] font-semibold text-on-surface font-bold" [ngClass]="{'line-through opacity-60': cita.estadoCita === 'CANCELADA'}">
                    {{ cita.nombreMascota }}
                  </h4>
                  <span class="font-label-md text-[12px] font-bold text-primary shrink-0">{{ getServicioPrecio(cita.idServicio) }}</span>
                </div>
                <p class="text-[12px] text-on-surface-variant mt-0.5 truncate">{{ cita.nombreServicio }} • <span class="opacity-80">Dr. {{ cita.nombreVeterinario }}</span></p>
                
                <!-- Owner and breed -->
                <p class="text-[11px] text-on-surface-variant/70 mt-0.5 truncate">
                  Dueño: <span class="text-on-surface-variant/90 font-medium">{{ getOwnerName(cita.idMascota) }}</span> • {{ getPetBreed(cita.idMascota) }}
                </p>
              </div>
            </div>

            <!-- Row 3: Expanded Detail Panel -->
            <div 
              *ngIf="expandedAgendaCitaId() === cita.idCita"
              class="border-t border-outline-variant/40 pt-sm mt-xs flex flex-col gap-xs text-[12px] animate-slideIn">
              <div>
                <span class="font-semibold text-on-surface-variant">Motivo:</span>
                <p class="text-on-surface/90 bg-surface-container-low/40 p-2 rounded-md mt-1 italic border border-outline-variant/20">{{ cita.motivo }}</p>
              </div>
              <div *ngIf="cita.observaciones">
                <span class="font-semibold text-on-surface-variant">Observaciones:</span>
                <p class="text-on-surface/80 bg-surface-container-low/20 p-2 rounded-md mt-1 border border-outline-variant/10 text-xs">{{ cita.observaciones }}</p>
              </div>
              <div class="grid grid-cols-2 gap-sm mt-1 bg-surface-container-high/30 p-2 rounded-md border border-outline-variant/30">
                <div>
                  <span class="text-[10px] text-on-surface-variant uppercase block">Especialidad Vet.</span>
                  <span class="font-medium text-on-surface">{{ getVeterinarioEspecialidad(cita.idVeterinario) }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-on-surface-variant uppercase block">ID Cita</span>
                  <span class="font-medium text-on-surface-variant font-mono">#{{ cita.idCita }}</span>
                </div>
              </div>
            </div>

            <!-- Row 4: Quick Actions -->
            <div class="flex gap-2 mt-1 border-t border-outline-variant/30 pt-sm" *ngIf="cita.estadoCita === 'PROGRAMADA' || cita.estadoCita === 'REPROGRAMADA'">
              <button (click)="cancelCitaDirect(cita)" class="flex-grow py-1.5 px-3 rounded-lg border border-outline-variant font-label-md text-label-md text-error hover:bg-error/10 hover:border-error/30 transition-all duration-300">
                Cancelar
              </button>
              <button 
                *ngIf="!authService.isRecepcionista()"
                (click)="attendCitaDirect(cita)" 
                class="flex-grow py-1.5 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint hover:scale-[1.02] shadow-sm transition-all duration-300">
                Atendido
              </button>
            </div>

          </div>

          <div *ngIf="getCitasForDay(selectedDate).length === 0" class="text-center py-xl text-on-surface-variant flex flex-col items-center justify-center gap-sm">
            <span class="material-symbols-outlined text-[48px] opacity-40">calendar_today</span>
            <span>No hay citas programadas para este día.</span>
          </div>
        </div>

        <!-- Quick Action Footer in Agenda -->
        <div class="p-md border-t border-outline-variant bg-surface-container">
          <button (click)="openAddModal()" class="w-full py-2.5 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-all duration-300 ease-in-out flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Programar Nueva Cita
          </button>
        </div>
      </aside>

      <!-- Modal Add Cita -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-2xl max-w-lg w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <div class="flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary text-[28px]">calendar_month</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Programar Cita Médica</h3>
            </div>
            <button (click)="closeModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
          </div>
          
          <form (ngSubmit)="saveCita()" #citaForm="ngForm" class="flex flex-col gap-md">
            
            <!-- Search Autocomplete for Mascota -->
            <div class="form-group flex flex-col gap-xs relative">
              <label for="mascotaSearch" class="font-label-md text-label-md text-on-surface-variant">Paciente (Mascota)</label>
              <div class="relative">
                <input 
                  type="text"
                  id="mascotaSearch"
                  class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-primary text-body-sm text-on-surface"
                  placeholder="Escribe el nombre de la mascota o dueño para buscar..."
                  [(ngModel)]="petSearchQuery"
                  (focus)="isPetDropdownOpen.set(true)"
                  (blur)="onPetSearchBlur()"
                  name="mascotaSearchQuery"
                  autocomplete="off"
                  required>
                <button 
                  type="button" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                  (click)="clearMascotaSelection()">
                  {{ activeCita.idMascota ? '✕' : '▼' }}
                </button>
              </div>
              
              <!-- Suggestions Dropdown -->
              <div 
                *ngIf="isPetDropdownOpen() && filteredMascotas().length > 0"
                class="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-surface-container border border-outline-variant rounded-lg shadow-2xl z-[9999] py-1">
                <button
                  type="button"
                  *ngFor="let m of filteredMascotas()"
                  (mousedown)="selectMascota(m)"
                  class="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-high transition-colors text-on-surface flex flex-col gap-0.5 border-b border-outline-variant/30 last:border-b-0 cursor-pointer">
                  <span class="font-semibold text-white">{{ m.nombre }}</span>
                  <span class="text-[11px] text-on-surface-variant">Dueño: {{ m.nombreCliente || 'Sin dueño' }} • {{ m.nombreEspecie || '' }} - {{ m.nombreRaza || '' }}</span>
                </button>
              </div>
              <div 
                *ngIf="isPetDropdownOpen() && petSearchQuery.trim() !== '' && filteredMascotas().length === 0"
                class="absolute left-0 right-0 top-full mt-1 bg-surface-container border border-outline-variant rounded-lg shadow-2xl z-[9999] p-3 text-center text-xs text-on-surface-variant">
                No se encontraron mascotas.
              </div>
            </div>

            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="veterinario" class="font-label-md text-label-md text-on-surface-variant">Veterinario</label>
                <select 
                  id="veterinario" 
                  name="idVeterinario" 
                  [(ngModel)]="activeCita.idVeterinario" 
                  required 
                  class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option [value]="0" disabled>Seleccione...</option>
                  <option *ngFor="let v of veterinarios()" [value]="v.idVeterinario">
                    Dr. {{ v.nombreCompleto }} ({{ v.especialidad }})
                  </option>
                </select>
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="servicio" class="font-label-md text-label-md text-on-surface-variant">Servicio</label>
                <select 
                  id="servicio" 
                  name="idServicio" 
                  [(ngModel)]="activeCita.idServicio" 
                  required 
                  class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option [value]="0" disabled>Seleccione...</option>
                  <option *ngFor="let s of servicios()" [value]="s.idServicio">
                    {{ s.nombre }} (S/ {{ s.precio.toFixed(2) }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group flex flex-col gap-xs">
              <label for="fechaHora" class="font-label-md text-label-md text-on-surface-variant">Fecha y Hora</label>
              <input 
                type="datetime-local" 
                id="fechaHora" 
                name="fechaHora" 
                [(ngModel)]="activeCita.fechaHora" 
                required 
                class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
            </div>

            <div class="form-group flex flex-col gap-xs">
              <label for="motivo" class="font-label-md text-label-md text-on-surface-variant">Motivo</label>
              <input 
                type="text" 
                id="motivo" 
                name="motivo" 
                [(ngModel)]="activeCita.motivo" 
                required 
                class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Motivo de la consulta">
            </div>

            <div class="form-group flex flex-col gap-xs">
              <label for="obs" class="font-label-md text-label-md text-on-surface-variant">Observaciones</label>
              <textarea 
                id="obs" 
                name="observaciones" 
                [(ngModel)]="activeCita.observaciones" 
                rows="2"
                class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Notas iniciales..."></textarea>
            </div>

            <div class="flex justify-end gap-sm border-t border-outline-variant/50 pt-md mt-sm">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="!citaForm.valid" 
                class="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-tint transition-colors">
                Programar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Change State / Detailed View & Edit -->
      <div *ngIf="isStateModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-md overflow-y-auto">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] animate-slideIn">
          <!-- Modal Header -->
          <div class="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container shrink-0">
            <div class="flex items-center gap-sm">
              <span class="material-symbols-outlined text-primary text-[28px]">
                {{ isEditingCita() ? 'edit_calendar' : 'info' }}
              </span>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                  {{ isEditingCita() ? 'Modificar Cita Médica' : 'Detalles de la Cita' }}
                </h3>
                <span class="text-[11px] text-on-surface-variant font-mono">ID Cita: #{{ selectedCitaToChangeState?.idCita }}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-sm">
              <button 
                *ngIf="!isEditingCita()"
                (click)="isEditingCita.set(true)"
                class="px-3 py-1.5 bg-primary-container text-on-primary hover:bg-primary rounded-lg font-label-sm text-[12px] flex items-center gap-1 transition-all">
                <span class="material-symbols-outlined text-[16px]">edit</span>
                Editar Info
              </button>
              <button 
                *ngIf="isEditingCita()"
                (click)="isEditingCita.set(false)"
                class="px-3 py-1.5 bg-surface border border-outline-variant text-on-surface hover:bg-surface-container rounded-lg font-label-sm text-[12px] flex items-center gap-1 transition-all">
                <span class="material-symbols-outlined text-[16px]">visibility</span>
                Ver Detalles
              </button>
              <button (click)="closeStateModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
            </div>
          </div>

          <!-- Tabs (Only shown in View Mode) -->
          <div *ngIf="!isEditingCita()" class="px-lg border-b border-outline-variant bg-surface-container-low flex gap-md shrink-0">
            <button 
              (click)="activeModalTab.set('appointment')"
              [class.border-primary]="activeModalTab() === 'appointment'"
              [class.text-primary]="activeModalTab() === 'appointment'"
              [class.border-transparent]="activeModalTab() !== 'appointment'"
              [class.text-on-surface-variant]="activeModalTab() !== 'appointment'"
              class="py-3 px-1 border-b-2 font-label-md text-label-md transition-all font-semibold focus:outline-none">
              Detalles & Estado
            </button>
            <button 
              (click)="activeModalTab.set('patient')"
              [class.border-primary]="activeModalTab() === 'patient'"
              [class.text-primary]="activeModalTab() === 'patient'"
              [class.border-transparent]="activeModalTab() !== 'patient'"
              [class.text-on-surface-variant]="activeModalTab() !== 'patient'"
              class="py-3 px-1 border-b-2 font-label-md text-label-md transition-all font-semibold focus:outline-none">
              Paciente & Contacto
            </button>
            <button 
              (click)="activeModalTab.set('history')"
              [class.border-primary]="activeModalTab() === 'history'"
              [class.text-primary]="activeModalTab() === 'history'"
              [class.border-transparent]="activeModalTab() !== 'history'"
              [class.text-on-surface-variant]="activeModalTab() !== 'history'"
              class="py-3 px-1 border-b-2 font-label-md text-label-md transition-all font-semibold focus:outline-none">
              Historial Clínico
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-lg overflow-y-auto flex-grow text-body-sm text-on-surface">
            
            <!-- VIEW MODE -->
            <div *ngIf="!isEditingCita()">
              
              <!-- Tab 1: Appointment & Status -->
              <div *ngIf="activeModalTab() === 'appointment'" class="flex flex-col gap-lg animate-fadeIn">
                <!-- Info cards grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div class="p-md bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <span class="text-[10px] text-on-surface-variant uppercase font-semibold block mb-xs">Servicio / Procedimiento</span>
                    <h4 class="font-bold text-sm text-primary">{{ selectedCitaToChangeState?.nombreServicio }}</h4>
                    <p class="text-[12px] font-semibold text-secondary mt-1">Costo: {{ getServicioPrecio(selectedCitaToChangeState?.idServicio) }}</p>
                    <div *ngIf="getSelectedServicio() as svc" class="mt-2 text-[11px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-1.5 flex flex-col gap-0.5 animate-fadeIn">
                      <span *ngIf="svc.descripcion" class="italic">"{{ svc.descripcion }}"</span>
                      <span class="font-medium mt-0.5">Duración estimada: {{ svc.duracionMinutos }} minutos</span>
                    </div>
                  </div>
                  <div class="p-md bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <span class="text-[10px] text-on-surface-variant uppercase font-semibold block mb-xs">Fecha y Hora</span>
                    <h4 class="font-bold text-sm text-on-surface">{{ formatDate(selectedCitaToChangeState?.fechaHora || '') }}</h4>
                    <p class="text-[12px] text-on-surface-variant mt-1">Médico: Dr. {{ selectedCitaToChangeState?.nombreVeterinario }}</p>
                  </div>
                </div>

                <div class="p-md bg-surface-container-low border border-outline-variant/60 rounded-xl">
                  <span class="text-[10px] text-on-surface-variant uppercase font-semibold block mb-xs">Motivo de Consulta</span>
                  <p class="font-medium italic">"{{ selectedCitaToChangeState?.motivo || 'Sin especificar' }}"</p>
                  <div *ngIf="selectedCitaToChangeState?.observaciones" class="mt-2 pt-2 border-t border-outline-variant/30 text-[12px]">
                    <strong>Notas iniciales:</strong> {{ selectedCitaToChangeState?.observaciones }}
                  </div>
                </div>

                <!-- Status Change Form section -->
                <div class="border-t border-outline-variant/50 pt-lg mt-sm">
                  <h4 class="font-bold text-sm text-on-surface mb-md flex items-center gap-xs">
                    <span class="material-symbols-outlined text-[18px] text-secondary">published_with_changes</span>
                    Actualizar Estado de la Cita
                  </h4>
                  <form (ngSubmit)="saveStateChange()" class="flex flex-col gap-md bg-surface-container rounded-xl p-md border border-outline-variant/80">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      <div class="form-group flex flex-col gap-xs">
                        <label for="newState" class="font-label-md text-label-md text-on-surface-variant">Nuevo Estado</label>
                        <select 
                          id="newState" 
                          name="newState" 
                          [(ngModel)]="selectedStateId" 
                          required 
                          class="w-full bg-surface border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                          <option [value]="0" disabled>Seleccione...</option>
                          <option *ngIf="!authService.isRecepcionista()" [value]="2">ATENDIDA</option>
                          <option [value]="4">REPROGRAMADA</option>
                          <option [value]="3">CANCELADA</option>
                        </select>
                      </div>
                      <div class="flex items-center gap-sm mt-md sm:mt-0">
                        <span class="text-[11px] text-on-surface-variant leading-tight">
                          El estado actual es: <strong class="uppercase text-primary">{{ selectedCitaToChangeState?.estadoCita }}</strong>
                        </span>
                      </div>
                    </div>

                    <div class="form-group flex flex-col gap-xs">
                      <label for="stateObs" class="font-label-md text-label-md text-on-surface-variant">Observación / Nota Médica</label>
                      <textarea 
                        id="stateObs" 
                        name="stateObs" 
                        [(ngModel)]="stateObservation" 
                        required
                        rows="2"
                        class="w-full bg-surface border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                        placeholder="Escriba la nota médica o motivo del cambio de estado..."></textarea>
                    </div>

                    <div class="flex justify-end gap-sm mt-xs">
                      <button 
                        type="submit" 
                        [disabled]="selectedStateId === 0 || stateObservation.trim() === ''" 
                        class="bg-secondary text-on-secondary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-secondary-container transition-colors shadow-sm cursor-pointer">
                        Confirmar Estado
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Tab 2: Patient & Contact Details -->
              <div *ngIf="activeModalTab() === 'patient'" class="flex flex-col gap-lg animate-fadeIn">
                <!-- Patient Card -->
                <div class="p-md bg-surface-container rounded-xl border border-outline-variant flex flex-col gap-md">
                  <div class="flex items-center gap-md">
                    <img 
                      [src]="getPetImage(selectedCitaToChangeState?.nombreMascota)" 
                      alt="Paciente" 
                      class="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-md" />
                    <div>
                      <h4 class="font-bold text-headline-sm text-on-surface leading-tight">{{ selectedMascotaDetails()?.nombre || selectedCitaToChangeState?.nombreMascota }}</h4>
                      <p class="text-[12px] text-on-surface-variant mt-0.5">
                        Especie: <span class="font-semibold text-primary">{{ selectedMascotaDetails()?.nombreEspecie || 'N/A' }}</span> • 
                        Raza: <span class="font-semibold">{{ selectedMascotaDetails()?.nombreRaza || 'N/A' }}</span> • 
                        Edad: <span class="font-semibold text-secondary">{{ getPetAge(selectedMascotaDetails()?.fechaNacimiento) }}</span>
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-sm border-t border-outline-variant/30 pt-sm text-center">
                    <div>
                      <span class="text-[10px] text-on-surface-variant uppercase block font-semibold">Sexo</span>
                      <span class="font-bold text-on-surface">{{ selectedMascotaDetails()?.sexo === 'M' ? 'Macho' : 'Hembra' }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-on-surface-variant uppercase block font-semibold">Color</span>
                      <span class="font-bold text-on-surface">{{ selectedMascotaDetails()?.color || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-on-surface-variant uppercase block font-semibold">Peso</span>
                      <span class="font-bold text-on-surface">{{ selectedMascotaDetails()?.peso ? (selectedMascotaDetails()?.peso + ' kg') : 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-on-surface-variant uppercase block font-semibold">Nacimiento</span>
                      <span class="font-bold text-on-surface">{{ selectedMascotaDetails()?.fechaNacimiento || 'N/A' }}</span>
                    </div>
                  </div>

                  <div *ngIf="selectedMascotaDetails()?.observaciones" class="bg-surface p-sm rounded-lg border border-outline-variant/40 text-[12px]">
                    <strong>Observaciones clínicas:</strong> {{ selectedMascotaDetails()?.observaciones }}
                  </div>
                </div>

                <!-- Owner Contact Card -->
                <div class="p-md bg-surface-container rounded-xl border border-outline-variant">
                  <h4 class="font-bold text-sm text-on-surface mb-sm flex items-center gap-xs">
                    <span class="material-symbols-outlined text-[18px] text-primary">contact_phone</span>
                    Información de Contacto del Propietario
                  </h4>
                  <div class="flex flex-col gap-xs pl-6">
                    <p class="font-medium text-on-surface">
                      <strong>Dueño:</strong> {{ selectedClienteDetails()?.nombres }} {{ selectedClienteDetails()?.apellidoPaterno }} {{ selectedClienteDetails()?.apellidoMaterno }}
                    </p>
                    <p><strong>Documento:</strong> {{ selectedClienteDetails()?.numeroDocumento || 'N/A' }}</p>
                    <p><strong>Teléfono:</strong> {{ selectedClienteDetails()?.telefono || 'N/A' }}</p>
                    <p><strong>Email:</strong> {{ selectedClienteDetails()?.correo || 'N/A' }}</p>
                    <p><strong>Dirección:</strong> {{ selectedClienteDetails()?.direccion || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Tab 3: Medical History -->
              <div *ngIf="activeModalTab() === 'history'" class="flex flex-col gap-md animate-fadeIn">
                <h4 class="font-bold text-sm text-on-surface flex items-center gap-xs">
                  <span class="material-symbols-outlined text-[18px] text-primary">history_edu</span>
                  Últimos Diagnósticos de la Mascota
                </h4>

                <div class="flex flex-col gap-sm max-h-[350px] overflow-y-auto pr-xs">
                  <div 
                    *ngFor="let h of selectedHistorialDetails()" 
                    class="p-md bg-surface-container-low border border-outline-variant/60 rounded-xl relative hover:border-primary/30 transition-all">
                    
                    <div class="flex justify-between items-center mb-xs">
                      <span class="text-[11px] font-bold text-primary">{{ formatDate(h.fechaAtencion) }}</span>
                      <span class="text-[10px] text-on-surface-variant">Dr. {{ h.nombreVeterinario }}</span>
                    </div>
                    <div class="text-[12px] leading-relaxed">
                      <p><strong>Diagnóstico:</strong> {{ h.diagnostico }}</p>
                      <p *ngIf="h.tratamiento" class="mt-1"><strong>Tratamiento:</strong> {{ h.tratamiento }}</p>
                      <p *ngIf="h.observaciones" class="mt-1 text-on-surface-variant font-medium"><strong>Obs:</strong> {{ h.observaciones }}</p>
                    </div>
                  </div>

                  <div *ngIf="selectedHistorialDetails().length === 0" class="text-center py-lg text-on-surface-variant italic">
                    No hay registros anteriores de historia clínica para esta mascota.
                  </div>
                </div>
              </div>

            </div>

            <!-- EDIT MODE -->
            <div *ngIf="isEditingCita()" class="animate-fadeIn pb-md">
              <form (ngSubmit)="saveCitaEdit()" #citaEditForm="ngForm" class="flex flex-col gap-lg">
                
                <!-- Section 1: Appointment Info -->
                <div class="border-b border-outline-variant/60 pb-md">
                  <h4 class="font-bold text-xs uppercase text-primary mb-md flex items-center gap-xs">
                    <span class="material-symbols-outlined text-[18px]">calendar_month</span>
                    Información de la Cita
                  </h4>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <!-- Fecha y Hora -->
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editFecha" class="font-label-md text-label-md text-on-surface-variant">Fecha y Hora</label>
                      <input 
                        type="datetime-local" 
                        id="editFecha" 
                        name="editFecha" 
                        [(ngModel)]="editFechaHora"
                        required
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                    </div>

                    <!-- Veterinario -->
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editVet" class="font-label-md text-label-md text-on-surface-variant">Veterinario Responsable</label>
                      <select 
                        id="editVet" 
                        name="idVeterinario" 
                        [(ngModel)]="editableCita().idVeterinario" 
                        required 
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                        <option *ngFor="let v of veterinarios()" [value]="v.idVeterinario">Dr. {{ v.nombreCompleto }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-md mt-md">
                    <!-- Servicio -->
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editServicio" class="font-label-md text-label-md text-on-surface-variant">Servicio / Procedimiento</label>
                      <select 
                        id="editServicio" 
                        name="idServicio" 
                        [(ngModel)]="editableCita().idServicio" 
                        required 
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                        <option *ngFor="let s of servicios()" [value]="s.idServicio">{{ s.nombre }} (S/ {{ s.precio }})</option>
                      </select>
                    </div>
                    
                    <!-- Status -->
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editEstado" class="font-label-md text-label-md text-on-surface-variant">Estado de Cita</label>
                      <select 
                        id="editEstado" 
                        name="idEstadoCita" 
                        [(ngModel)]="editableCita().idEstadoCita" 
                        required 
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                        <option [value]="1">PROGRAMADA</option>
                        <option *ngIf="!authService.isRecepcionista()" [value]="2">ATENDIDA</option>
                        <option [value]="3">CANCELADA</option>
                        <option [value]="4">REPROGRAMADA</option>
                      </select>
                    </div>
                  </div>

                  <!-- Motivo -->
                  <div class="form-group flex flex-col gap-xs mt-md">
                    <label for="editMotivo" class="font-label-md text-label-md text-on-surface-variant">Motivo de Consulta</label>
                    <input 
                      type="text" 
                      id="editMotivo" 
                      name="motivo" 
                      [(ngModel)]="editableCita().motivo"
                      required
                      placeholder="Ej. Chequeo general"
                      class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  </div>

                  <!-- Observaciones -->
                  <div class="form-group flex flex-col gap-xs mt-md">
                    <label for="editObs" class="font-label-md text-label-md text-on-surface-variant">Observaciones / Notas Médicas</label>
                    <textarea 
                      id="editObs" 
                      name="observaciones" 
                      [(ngModel)]="editableCita().observaciones"
                      rows="2"
                      placeholder="Escriba comentarios adicionales sobre el caso..."
                      class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface"></textarea>
                  </div>
                </div>

                <!-- Section 2: Patient Info -->
                <div *ngIf="editableMascota()" class="border-b border-outline-variant/60 pb-md">
                  <h4 class="font-bold text-xs uppercase text-primary mb-md flex items-center gap-xs">
                    <span class="material-symbols-outlined text-[18px]">pets</span>
                    Datos del Paciente: {{ selectedCitaToChangeState?.nombreMascota }}
                  </h4>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editPeso" class="font-label-md text-label-md text-on-surface-variant">Peso (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        id="editPeso" 
                        name="editPeso" 
                        [(ngModel)]="editableMascota()!.peso"
                        required
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                    </div>
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editPetObs" class="font-label-md text-label-md text-on-surface-variant">Observaciones Clínicas / Alergias</label>
                      <input 
                        type="text" 
                        id="editPetObs" 
                        name="editPetObs" 
                        [(ngModel)]="editableMascota()!.observaciones"
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                    </div>
                  </div>
                </div>

                <!-- Section 3: Contact Info (Owner) -->
                <div *ngIf="editableCliente()" class="pb-xs">
                  <h4 class="font-bold text-xs uppercase text-primary mb-md flex items-center gap-xs">
                    <span class="material-symbols-outlined text-[18px]">contact_phone</span>
                    Contacto del Propietario: {{ selectedClienteDetails()?.nombres }} {{ selectedClienteDetails()?.apellidoPaterno }}
                  </h4>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editTel" class="font-label-md text-label-md text-on-surface-variant">Teléfono</label>
                      <input 
                        type="text" 
                        id="editTel" 
                        name="editTel" 
                        [(ngModel)]="editableCliente()!.telefono"
                        required
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                    </div>
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editCorreo" class="font-label-md text-label-md text-on-surface-variant">Email</label>
                      <input 
                        type="email" 
                        id="editCorreo" 
                        name="editCorreo" 
                        [(ngModel)]="editableCliente()!.correo"
                        required
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                    </div>
                    <div class="form-group flex flex-col gap-xs">
                      <label for="editDir" class="font-label-md text-label-md text-on-surface-variant">Dirección</label>
                      <input 
                        type="text" 
                        id="editDir" 
                        name="editDir" 
                        [(ngModel)]="editableCliente()!.direccion"
                        required
                        class="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                    </div>
                  </div>
                </div>

                <!-- Form actions -->
                <div class="flex justify-end gap-sm border-t border-outline-variant/50 pt-md mt-sm">
                  <button 
                    type="button" 
                    (click)="isEditingCita.set(false)" 
                    class="bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors">
                    Cancelar Edición
                  </button>
                  <button 
                    type="submit" 
                    [disabled]="!citaEditForm.valid" 
                    class="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-tint transition-colors shadow-sm cursor-pointer">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      <!-- Premium Glassmorphic Confirmation Modal -->
      <div *ngIf="isConfirmOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-md animate-fadeIn">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-2xl max-w-sm w-full p-lg animate-slideIn">
          <div class="flex items-center gap-md border-b border-outline-variant pb-md mb-md">
            <span class="material-symbols-outlined text-error text-[32px]">warning</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">{{ confirmTitle }}</h3>
          </div>
          <p class="font-body-md text-on-surface-variant text-[14px] leading-relaxed mb-lg">{{ confirmMessage }}</p>
          <div class="flex justify-end gap-sm border-t border-outline-variant/50 pt-md">
            <button 
              type="button" 
              (click)="closeConfirm()" 
              class="bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors">
              Cancelar
            </button>
            <button 
              type="button"
              (click)="executeConfirm()" 
              class="bg-error text-on-error font-label-md text-label-md py-sm px-md rounded-lg hover:bg-error-container transition-colors">
              Confirmar
            </button>
          </div>
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
        <span class="material-symbols-outlined text-2xl">
          {{ toastType() === 'success' ? 'check_circle' : toastType() === 'error' ? 'error' : 'warning' }}
        </span>
        <div class="flex flex-col">
          <span class="font-headline-sm text-sm font-semibold text-white">
            {{ toastType() === 'success' ? 'Éxito' : toastType() === 'error' ? 'Error' : 'Advertencia' }}
          </span>
          <p class="font-body-sm text-sm text-white/90 leading-tight mt-0.5">{{ toastMessage() }}</p>
        </div>
        <button (click)="toastMessage.set(null)" class="text-white/40 hover:text-white/80 transition-colors ml-lg text-lg leading-none">&times;</button>
      </div>

    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    /* Calendar Grid Lines using our dark border color #282e3d */
    .calendar-grid-bg {
      background-size: 100% 60px;
      background-image: linear-gradient(to bottom, #282e3d 1px, transparent 1px);
      background-position: 0 30px;
    }
    
    .animate-slideIn {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
    .toast-notification {
      animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes toastSlideIn {
      from { transform: translateY(-20px) scale(0.9); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class CitasComponent implements OnInit, OnDestroy {
  citas = signal<Cita[]>([]);
  mascotas = signal<Mascota[]>([]);
  veterinarios = signal<Veterinario[]>([]);
  servicios = signal<Servicio[]>([]);

  // Selected date in picker
  selectedDate: Date = new Date();
  currentDate: Date = new Date();
  weekDays: Date[] = [];
  
  // Hours grid parameters
  hourMarkers = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  
  // Modals state
  isModalOpen = signal(false);
  isStateModalOpen = signal(false);

  // Selected details for modal
  selectedMascotaDetails = signal<Mascota | null>(null);
  selectedClienteDetails = signal<any | null>(null);
  selectedHistorialDetails = signal<any[]>([]);
  isEditingCita = signal(false);
  editableCita = signal<Cita>(this.getEmptyCita());
  editableMascota = signal<Mascota | null>(null);
  editableCliente = signal<Cliente | null>(null);
  activeModalTab = signal<'appointment' | 'patient' | 'history'>('appointment');
  editFechaHora = '';

  activeCita: Cita = this.getEmptyCita();
  
  // State change attributes
  selectedCitaToChangeState: Cita | null = null;
  selectedStateId = 0;
  stateObservation = '';

  // Time indicator state variables
  showTimeIndicator = false;
  timeIndicatorTop = 0;
  private timeIntervalId: any;

  // Autocomplete variables for Mascota
  petSearchQuery = '';
  isPetDropdownOpen = signal(false);

  // Search and Filter variables
  searchTerm = '';
  filterVetId = 0;
  filterEstado = 'TODOS';

  // Expanded Agenda Card
  expandedAgendaCitaId = signal<number | null>(null);

  // Toast state
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'warning'>('success');
  private toastTimeout: any;

  // Confirm Modal state
  isConfirmOpen = signal(false);
  confirmTitle = '';
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {
    this.currentDate.setHours(0,0,0,0);
    this.selectedDate = new Date(this.currentDate);
  }

  ngOnInit(): void {
    this.generateWeekDays();
    this.loadCitas();
    this.loadMascotas();
    this.loadVeterinarios();
    this.loadServicios();
    
    this.updateTimeIndicator();
    this.timeIntervalId = setInterval(() => {
      this.updateTimeIndicator();
    }, 60000); // Update every minute
  }

  ngOnDestroy(): void {
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
  }

  generateWeekDays(): void {
    const startOfWeek = this.getMonday(this.currentDate);
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      this.weekDays.push(d);
    }
  }

  getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
    this.selectedDate = new Date(this.currentDate);
  }

  nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
    this.selectedDate = new Date(this.currentDate);
  }

  goToday(): void {
    this.currentDate = new Date();
    this.currentDate.setHours(0,0,0,0);
    this.generateWeekDays();
    this.selectedDate = new Date(this.currentDate);
  }

  selectDate(day: Date): void {
    this.selectedDate = new Date(day);
  }

  isSelectedDate(day: Date): boolean {
    return day.getDate() === this.selectedDate.getDate() && 
           day.getMonth() === this.selectedDate.getMonth() &&
           day.getFullYear() === this.selectedDate.getFullYear();
  }

  getCalendarTitle(): string {
    if (this.weekDays.length === 0) return '';
    const first = this.weekDays[0];
    const last = this.weekDays[6];
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (first.getMonth() === last.getMonth()) {
      return first.toLocaleDateString('es-PE', options);
    }
    return `${first.toLocaleDateString('es-PE', { month: 'short' })} - ${last.toLocaleDateString('es-PE', options)}`;
  }

  getDayName(day: Date): string {
    const names = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return names[day.getDay()];
  }

  getDayNameShort(day: Date): string {
    const names = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return names[day.getDay()];
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate() && 
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  }

  isWeekend(day: Date): boolean {
    const d = day.getDay();
    return d === 0 || d === 6; // Sunday or Saturday
  }

  loadCitas(): void {
    this.dataService.getCitas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.citas.set(res.data.content);
        }
      }
    });
  }

  loadMascotas(): void {
    this.dataService.getMascotas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.mascotas.set(res.data.content.filter(m => m.estado));
        }
      }
    });
  }

  loadVeterinarios(): void {
    this.dataService.getVeterinarios(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.veterinarios.set(res.data.content.filter(v => v.estado));
        }
      }
    });
  }

  loadServicios(): void {
    this.dataService.getServicios().subscribe({
      next: (res) => {
        if (res.success) {
          this.servicios.set(res.data);
        }
      }
    });
  }

  // Filters logic
  getFilteredCitas(): Cita[] {
    let list = this.citas();
    
    // Filter by search term
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(c => {
        const pet = c.nombreMascota?.toLowerCase() || '';
        const vet = c.nombreVeterinario?.toLowerCase() || '';
        const svc = c.nombreServicio?.toLowerCase() || '';
        const mot = c.motivo?.toLowerCase() || '';
        const petObj = this.mascotas().find(m => m.idMascota === c.idMascota);
        const owner = petObj?.nombreCliente?.toLowerCase() || '';
        return pet.includes(term) || vet.includes(term) || svc.includes(term) || mot.includes(term) || owner.includes(term);
      });
    }
    
    // Filter by veterinarian
    if (this.filterVetId > 0) {
      list = list.filter(c => c.idVeterinario === this.filterVetId);
    }
    
    // Filter by state
    if (this.filterEstado !== 'TODOS') {
      list = list.filter(c => c.estadoCita === this.filterEstado);
    }
    
    return list;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterVetId = 0;
    this.filterEstado = 'TODOS';
  }

  getCitasForDay(day: Date): Cita[] {
    return this.getFilteredCitas().filter(cita => {
      if (!cita.fechaHora) return false;
      const cDate = new Date(cita.fechaHora);
      return cDate.getDate() === day.getDate() && 
             cDate.getMonth() === day.getMonth() &&
             cDate.getFullYear() === day.getFullYear();
    });
  }

  dogImage1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGi4C-TvQskBoEaMSqPF3TCZqF6xdUf2JyOsDXsviKob3ruTFkm9LmPPHDXO3fVww3bVTzGRBg1eZtL9B0VT8y4QWXdCq5hVcIRN_erjj6bnWklpRRm4ng7KfMBLSqTu-6cKj8E5xlxrOrM98BjbQlnkC1k6x3UW9PVirOYflSX7F7gExaByG0I1WQdPALBJmc6hr14AI-l8SVu8NOUHjUr_5s15Any8XsTSy5bAKuvOUs7Mtg16XPtmcXiGQynusXx5K8knx-8tI';
  catImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGSGrA9quus7p9RM1K_ne08eXam7tMlquWYr-4j1wYH9vhDy25zNr8nGGVKnpi-DOh0vwNv-3jJxcn9xaLDGBzhe3fGR9j2BKKAQwilh8C23kfRl9iNKR949kam7maN7u8Il8CeX0rlkmXBZnfL3vVLcBbVsBQiQ1WYb1j-dbdEcCNJuBfX3E--QcOCIvSPNT-XC1WjwVO9J5d0FX-K7CcaXtx3WL3xt3r6rYfxHClhVKHBKTdlrU87ZX0FWfcavX2DQnlxFrLxs';
  dogImage2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfDVSWG_QjD4bssvQnQSMKhO1BB-QrrrdnXo1ks9UkF_2Yh2OyH0zjA4ajBcsgWDv4AgZFjbxP0TVAwh-zEDK32vjiyNatlb5juBnoT0S2TzCpmwkH3kus0a9YLXpo1I10o5iS7k0IawlQV9TjBEf_5JXGkUIgA8hEW1jsEeQZFHXfLJkSupA9vIId-Nbm2Ux54mSYVHZdnMvagmqJDjWcSYANEuG6qFOOMRmP_RikELDnFZd5CaqA2RJotnNMYhOMkoduHqzThds';

  getPetImage(nombre?: string): string {
    const name = (nombre || '').toLowerCase();
    if (name.includes('max') || name.includes('rocky') || name.includes('toby')) {
      return this.dogImage1;
    }
    if (name.includes('luna') || name.includes('cleo') || name.includes('mia') || name.includes('simba') || name.includes('lola') || name.includes('kira') || name.includes('bruno')) {
      return this.catImage;
    }
    return this.dogImage2;
  }

  getEventStyle(cita: Cita, day: Date): { [key: string]: string } {
    const dayCitas = this.getCitasForDay(day);
    dayCitas.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
    
    const currentStart = new Date(cita.fechaHora).getTime();
    const durationMs = 60 * 60 * 1000;
    const currentEnd = currentStart + durationMs;
    
    const overlapping = dayCitas.filter(other => {
      const otherStart = new Date(other.fechaHora).getTime();
      const otherEnd = otherStart + durationMs;
      return otherStart < currentEnd && other.idCita !== cita.idCita && currentStart < otherEnd;
    });
    
    if (overlapping.length === 0) {
      return {
        'top.px': this.getEventTop(cita.fechaHora).toString(),
        'height.px': '58',
        'left.px': '4',
        'width': 'calc(100% - 8px)'
      };
    }
    
    const allInGroup = [cita, ...overlapping].sort((a, b) => {
      const timeDiff = new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
      if (timeDiff !== 0) return timeDiff;
      return (a.idCita || 0) - (b.idCita || 0);
    });
    
    const totalColumns = allInGroup.length;
    const colIndex = allInGroup.findIndex(x => x.idCita === cita.idCita);
    const colWidthPct = 100 / totalColumns;
    const leftPct = colIndex * colWidthPct;
    
    return {
      'top.px': this.getEventTop(cita.fechaHora).toString(),
      'height.px': '58',
      'left': `calc(${leftPct}% + 2px)`,
      'width': `calc(${colWidthPct}% - 4px)`
    };
  }

  getEventTop(fechaHora: string): number {
    if (!fechaHora) return 0;
    const date = new Date(fechaHora);
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Start hour is 08:00 AM. 1 hour = 60px height.
    const relativeHour = hour - 8;
    const top = (relativeHour * 60) + minute + 30; // +30px offset for top day text headers
    return Math.max(0, top);
  }

  getHourOnly(fechaHora: string): string {
    if (!fechaHora) return '';
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  updateTimeIndicator(): void {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (hour >= 8 && hour < 18) {
      this.showTimeIndicator = true;
      const relativeHour = hour - 8;
      this.timeIndicatorTop = (relativeHour * 60) + minute + 30;
    } else {
      this.showTimeIndicator = false;
    }
  }

  getEventClass(status?: string): string {
    switch (status) {
      case 'ATENDIDA':
        return 'bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border-emerald-500 text-emerald-300 hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)]';
      case 'PROGRAMADA':
        return 'bg-gradient-to-br from-amber-500/20 to-orange-500/5 border-amber-500 text-amber-300 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.05)]';
      case 'REPROGRAMADA':
        return 'bg-gradient-to-br from-indigo-500/20 to-purple-500/5 border-indigo-500 text-indigo-300 hover:border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.05)]';
      case 'CANCELADA':
        return 'bg-gradient-to-br from-rose-500/10 to-red-500/5 border-rose-500 text-rose-300/80 opacity-50 hover:opacity-75 line-through';
      default:
        return 'bg-surface border-outline-variant text-on-surface-variant';
    }
  }

  getAgendaCardClass(cita: Cita): string {
    switch (cita.estadoCita) {
      case 'ATENDIDA':
        return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/55 hover:shadow-[0_4px_16px_rgba(16,185,129,0.04)]';
      case 'PROGRAMADA':
        return 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/55 hover:shadow-[0_4px_16px_rgba(245,158,11,0.04)]';
      case 'REPROGRAMADA':
        return 'border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/55 hover:shadow-[0_4px_16px_rgba(99,102,241,0.04)]';
      case 'CANCELADA':
        return 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 opacity-70';
      default:
        return 'border-outline-variant bg-surface-container hover:border-outline-variant-high';
    }
  }

  getBadgeClass(status?: string): string {
    switch (status) {
      case 'ATENDIDA':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PROGRAMADA':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REPROGRAMADA':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'CANCELADA':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant';
    }
  }

  getBadgeDotClass(status?: string): string {
    switch (status) {
      case 'ATENDIDA':
        return 'bg-emerald-500';
      case 'PROGRAMADA':
        return 'bg-amber-500';
      case 'REPROGRAMADA':
        return 'bg-indigo-500';
      case 'CANCELADA':
        return 'bg-rose-500';
      default:
        return 'bg-outline';
    }
  }

  formatDateHeader(date: Date): string {
    return date.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'short' });
  }

  getEmptyCita(): Cita {
    return {
      idMascota: 0,
      idVeterinario: 0,
      idServicio: 0,
      fechaHora: '',
      motivo: '',
      observaciones: ''
    };
  }

  // Expanded Agenda Panel trigger
  toggleAgendaExpand(idCita: number): void {
    if (this.expandedAgendaCitaId() === idCita) {
      this.expandedAgendaCitaId.set(null);
    } else {
      this.expandedAgendaCitaId.set(idCita);
    }
  }

  // Helper getters for enhanced information
  getOwnerName(idMascota: number): string {
    const m = this.mascotas().find(p => p.idMascota === idMascota);
    return m?.nombreCliente || 'Sin dueño';
  }

  getPetBreed(idMascota: number): string {
    const m = this.mascotas().find(p => p.idMascota === idMascota);
    if (!m) return '';
    return `${m.nombreEspecie || ''} (${m.nombreRaza || ''})`;
  }

  getServicioPrecio(idServicio?: number): string {
    if (!idServicio) return '';
    const s = this.servicios().find(svc => svc.idServicio === idServicio);
    return s ? `S/ ${s.precio.toFixed(2)}` : '';
  }

  getSelectedServicio(): Servicio | null {
    if (!this.selectedCitaToChangeState) return null;
    return this.servicios().find(s => s.idServicio === this.selectedCitaToChangeState?.idServicio) || null;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return dateStr;
    }
  }

  getPetAge(birthDateStr?: string): string {
    if (!birthDateStr) return 'N/A';
    try {
      const birth = new Date(birthDateStr);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
        years--;
        months += 12;
      }
      if (years > 0) {
        return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? ` y ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
      }
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } catch {
      return 'N/A';
    }
  }


  getVeterinarioEspecialidad(idVeterinario: number): string {
    const v = this.veterinarios().find(vet => vet.idVeterinario === idVeterinario);
    return v?.especialidad || 'General';
  }

  getServiceIcon(serviceName?: string): string {
    if (!serviceName) return 'pets';
    const name = serviceName.toLowerCase();
    if (name.includes('vacun') || name.includes('vacuna')) return 'vaccines';
    if (name.includes('cirug') || name.includes('operac') || name.includes('quirurg')) return 'healing';
    if (name.includes('peluquer') || name.includes('baño') || name.includes('corte') || name.includes('estetic') || name.includes('higiene')) return 'content_cut';
    if (name.includes('desparasit')) return 'shield';
    if (name.includes('consult') || name.includes('chequeo') || name.includes('atencion')) return 'stethoscope';
    return 'pets';
  }

  // Autocomplete helper methods
  filteredMascotas(): Mascota[] {
    const q = this.petSearchQuery.toLowerCase().trim();
    const list = this.mascotas();
    if (!q) {
      return list.slice(0, 10);
    }
    return list.filter(m => 
      m.nombre.toLowerCase().includes(q) || 
      (m.nombreCliente?.toLowerCase() || '').includes(q)
    ).slice(0, 10);
  }

  selectMascota(m: Mascota): void {
    this.activeCita.idMascota = m.idMascota!;
    this.petSearchQuery = `${m.nombre} (Dueño: ${m.nombreCliente || 'Sin dueño'})`;
    this.isPetDropdownOpen.set(false);
  }

  clearMascotaSelection(): void {
    this.activeCita.idMascota = 0;
    this.petSearchQuery = '';
    this.isPetDropdownOpen.set(true);
  }

  onPetSearchBlur(): void {
    setTimeout(() => {
      this.isPetDropdownOpen.set(false);
      const current = this.mascotas().find(m => m.idMascota === this.activeCita.idMascota);
      if (current) {
        this.petSearchQuery = `${current.nombre} (Dueño: ${current.nombreCliente || 'Sin dueño'})`;
      } else {
        this.activeCita.idMascota = 0;
        this.petSearchQuery = '';
      }
    }, 200);
  }

  // Toast state triggers
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

  // Custom Confirmation Dialog triggers
  showConfirm(title: string, message: string, callback: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.isConfirmOpen.set(true);
  }

  closeConfirm(): void {
    this.isConfirmOpen.set(false);
    this.confirmCallback = null;
  }

  executeConfirm(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirm();
  }

  // Add / Schedule Cita Modal methods
  openAddModal(): void {
    this.activeCita = this.getEmptyCita();
    this.petSearchQuery = '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveCita(): void {
    if (!this.activeCita.idMascota || this.activeCita.idMascota <= 0) {
      this.showToast('Por favor, seleccione un paciente (mascota) válido de la lista sugerida.', 'warning');
      return;
    }

    this.dataService.createCita(this.activeCita).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Cita programada con éxito.', 'success');
          this.loadCitas();
          this.closeModal();
        } else {
          this.showToast('Error al programar la cita: ' + res.message, 'error');
        }
      },
      error: (err) => {
        this.showToast('Error al conectar con el servidor.', 'error');
      }
    });
  }

  cancelCitaDirect(cita: Cita): void {
    this.showConfirm(
      'Cancelar Cita',
      `¿Está seguro de que desea cancelar la cita para la mascota ${cita.nombreMascota}? Esta acción no se puede deshacer.`,
      () => {
        this.dataService.deleteCita(cita.idCita!).subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Cita cancelada con éxito.', 'success');
              this.loadCitas();
            } else {
              this.showToast('Error al cancelar la cita: ' + res.message, 'error');
            }
          },
          error: (err) => {
            this.showToast('Error al cancelar la cita.', 'error');
          }
        });
      }
    );
  }

  attendCitaDirect(cita: Cita): void {
    this.dataService.changeCitaEstado(cita.idCita!, 2, 'Atendido desde la agenda diaria.').subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(`Cita de ${cita.nombreMascota} marcada como ATENDIDA.`, 'success');
          this.loadCitas();
        } else {
          this.showToast('Error al cambiar el estado: ' + res.message, 'error');
        }
      },
      error: (err) => {
        this.showToast('Error al actualizar el estado de la cita.', 'error');
      }
    });
  }

  // State Change Modals
  openStateModal(cita: Cita): void {
    this.selectedCitaToChangeState = cita;
    this.selectedStateId = cita.idEstadoCita || 0;
    this.stateObservation = '';
    this.isEditingCita.set(false);
    this.editableCita.set({ ...cita });
    this.activeModalTab.set('appointment');
    this.editFechaHora = this.toDatetimeLocal(cita.fechaHora);

    this.selectedMascotaDetails.set(null);
    this.selectedClienteDetails.set(null);
    this.selectedHistorialDetails.set([]);
    this.editableMascota.set(null);
    this.editableCliente.set(null);

    const pet = this.mascotas().find(m => m.idMascota === cita.idMascota);
    if (pet) {
      this.selectedMascotaDetails.set(pet);
      this.editableMascota.set({ ...pet });
      
      this.dataService.getCliente(pet.idCliente).subscribe(res => {
        if (res.success && res.data) {
          this.selectedClienteDetails.set(res.data);
          this.editableCliente.set({ ...res.data });
        }
      });

      this.dataService.getHistorialClinicoByMascota(pet.idMascota!).subscribe(res => {
        if (res.success && res.data) {
          this.selectedHistorialDetails.set(res.data.content || []);
        }
      });
    }

    this.isStateModalOpen.set(true);
  }

  closeStateModal(): void {
    this.isStateModalOpen.set(false);
  }

  saveStateChange(): void {
    if (!this.selectedCitaToChangeState) return;
    const id = this.selectedCitaToChangeState.idCita!;
    
    this.dataService.changeCitaEstado(id, this.selectedStateId, this.stateObservation).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Estado de la cita actualizado con éxito.', 'success');
          this.loadCitas();
          this.closeStateModal();
        } else {
          this.showToast('Error al actualizar el estado: ' + res.message, 'error');
        }
      },
      error: (err) => {
        this.showToast('Error al actualizar el estado de la cita.', 'error');
      }
    });
  }

  toDatetimeLocal(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  }

  fromDatetimeLocal(localStr: string): string {
    if (!localStr) return '';
    try {
      return new Date(localStr).toISOString();
    } catch {
      return localStr;
    }
  }

  saveCitaEdit(): void {
    const edited = this.editableCita();
    if (!edited || !edited.idCita) return;
    
    edited.fechaHora = this.fromDatetimeLocal(this.editFechaHora);
    
    this.dataService.updateCita(edited.idCita, edited).subscribe({
      next: (res) => {
        if (res.success) {
          // Save Pet changes if available
          const petToUpdate = this.editableMascota();
          if (petToUpdate && petToUpdate.idMascota) {
            this.dataService.updateMascota(petToUpdate.idMascota, petToUpdate).subscribe({
              next: (petRes) => {
                if (petRes.success) {
                  this.loadMascotas();
                }
              }
            });
          }

          // Save Client changes if available
          const clientToUpdate = this.editableCliente();
          if (clientToUpdate && clientToUpdate.idCliente) {
            this.dataService.updateCliente(clientToUpdate.idCliente, clientToUpdate).subscribe({
              next: (clientRes) => {
                if (clientRes.success) {
                  // Client updated successfully
                }
              }
            });
          }

          this.showToast('Cita y datos asociados modificados con éxito.', 'success');
          this.loadCitas();
          this.isStateModalOpen.set(false);
        } else {
          this.showToast('Error al modificar la cita: ' + res.message, 'error');
        }
      },
      error: (err) => {
        this.showToast('Error al actualizar la cita.', 'error');
      }
    });
  }
}
