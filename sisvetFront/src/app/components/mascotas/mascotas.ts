import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService, Mascota, Cliente, Especie, Raza, HistorialClinico, MascotaVacuna } from '../../services/data';
import { AuthService } from '../../services/auth';

declare var gsap: any;

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-grow">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-xl gap-md">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface mb-xs">Gestión de Pacientes</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Vea y administre todas las mascotas registradas en la clínica.</p>
        </div>
        <div class="flex items-center gap-sm">
          <button 
            (click)="openAddModal()"
            class="flex items-center gap-sm bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.05)] hover:bg-surface-tint hover:shadow-[0_12px_12px_rgba(0,0,0,0.08)] transition-all duration-300">
            <span class="material-symbols-outlined">add</span>
            Registrar Mascota
          </button>
        </div>
      </div>

      <!-- Pet Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        
        <!-- Action/Add Card -->
        <div 
          (click)="openAddModal()"
          class="bg-surface border-2 border-dashed border-outline-variant rounded-xl overflow-hidden hover:border-primary/50 hover:bg-surface-container transition-all duration-300 group flex flex-col h-full cursor-pointer items-center justify-center min-h-[360px]">
          <div class="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-md group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <span class="material-symbols-outlined text-[32px]">add</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface mb-xs">Nueva Mascota</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant text-center px-lg">Añada un nuevo paciente al registro clínico.</p>
        </div>

        <!-- Pet Cards dynamically loaded -->
        <div 
          *ngFor="let m of mascotas()"
          class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2)] hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full relative">
          
          <div class="h-48 w-full relative overflow-hidden bg-surface-container-low">
            <img 
              [src]="getPetImage(m)" 
              [alt]="m.nombre" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            
            <!-- Quick View / Hover Overlay -->
            <div class="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                (click)="openProfileModal(m)"
                class="flex items-center gap-xs bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg shadow-md hover:bg-primary-container transition-all">
                <span class="material-symbols-outlined text-[20px]">person</span>
                Ver Perfil
              </button>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-sm right-sm">
              <span 
                class="inline-flex items-center gap-xs px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-md border backdrop-blur-md"
                [ngClass]="m.estado ? 'bg-secondary-container text-on-secondary-container border-secondary/20' : 'bg-error-container text-on-error-container border-error/20'">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="m.estado ? 'bg-secondary' : 'bg-error'"></span>
                {{ m.estado ? 'Al día' : 'Desactivo' }}
              </span>
            </div>
          </div>

          <div class="p-md flex flex-col flex-grow">
            <!-- Title & Breed Badge -->
            <div class="flex justify-between items-start mb-md">
              <div class="min-w-0">
                <h3 class="font-headline-sm text-headline-sm text-on-surface truncate font-semibold" [title]="m.nombre">{{ m.nombre }}</h3>
                <span class="inline-block mt-xs px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 truncate max-w-full">
                  {{ m.nombreEspecie }} • {{ m.nombreRaza }}
                </span>
              </div>
              
              <!-- Dropdown Context Menu (Keeping as secondary fallback option) -->
              <div class="relative">
                <button (click)="toggleCardActions(m.idMascota!)" class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high">
                  <span class="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
                <div 
                  *ngIf="openCardMenuId() === m.idMascota" 
                  class="absolute right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-lg shadow-lg py-1 z-10">
                  <button (click)="openEditModal(m)" class="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-high transition-colors flex items-center gap-sm">
                    <span class="material-symbols-outlined text-[18px]">edit</span> Editar
                  </button>
                  <button (click)="goToHistorial(m.idMascota!)" class="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-high transition-colors flex items-center gap-sm">
                    <span class="material-symbols-outlined text-[18px]">history_edu</span> Historial Clínico
                  </button>
                  <button 
                    *ngIf="!authService.isRecepcionista()"
                    (click)="deleteMascota(m)" 
                    class="w-full text-left px-4 py-2 text-body-sm hover:bg-error-container/20 text-error transition-colors flex items-center gap-sm">
                    <span class="material-symbols-outlined text-[18px]">delete</span> {{ m.estado ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="pt-sm border-t border-outline-variant/50 grid grid-cols-2 gap-sm mb-md text-body-sm">
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">cake</span>
                <div class="min-w-0">
                  <p class="text-[10px] text-on-surface-variant uppercase tracking-wider leading-none">Edad</p>
                  <p class="font-medium text-on-surface truncate leading-tight mt-0.5">{{ calculateAge(m.fechaNacimiento) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">{{ m.sexo === 'M' ? 'male' : 'female' }}</span>
                <div class="min-w-0">
                  <p class="text-[10px] text-on-surface-variant uppercase tracking-wider leading-none">Sexo</p>
                  <p class="font-medium text-on-surface truncate leading-tight mt-0.5">{{ m.sexo === 'M' ? 'Macho' : 'Hembra' }}</p>
                </div>
              </div>
              <div class="col-span-2 flex items-center gap-xs pt-xs border-t border-outline-variant/30 mt-xs">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                <div class="min-w-0">
                  <p class="text-[10px] text-on-surface-variant uppercase tracking-wider leading-none">Propietario</p>
                  <p class="font-medium text-on-surface truncate leading-tight mt-0.5" [title]="m.nombreCliente ?? ''">{{ m.nombreCliente || 'Sin registrar' }}</p>
                </div>
              </div>
            </div>

            <!-- Direct Quick Action Buttons at Card Footer -->
            <div class="mt-auto pt-sm border-t border-outline-variant/50 flex flex-col gap-sm">
              <button 
                (click)="openProfileModal(m)"
                class="w-full py-1.5 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-xs shadow-sm hover:shadow-md">
                <span class="material-symbols-outlined text-[18px]">person</span>
                Ver Perfil Completo
              </button>
              
              <div class="flex gap-sm">
                <button 
                  (click)="goToHistorial(m.idMascota!)"
                  class="flex-grow py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-xs border border-primary/20">
                  <span class="material-symbols-outlined text-[16px]">history_edu</span>
                  Historial
                </button>
                <button 
                  (click)="openEditModal(m)"
                  class="py-1.5 px-3 border border-outline-variant hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg font-label-md text-label-md transition-all flex items-center justify-center"
                  title="Editar Paciente">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Add / Edit (Tailwind styled modal) -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl max-w-lg w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">
              {{ isEditMode() ? 'Editar Mascota' : 'Registrar Mascota' }}
            </h3>
            <button (click)="closeModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
          </div>

          <form (ngSubmit)="saveMascota()" #mascotaForm="ngForm" class="flex flex-col gap-md">
            
            <div class="form-group flex flex-col gap-xs relative">
              <label for="clienteSearch" class="font-label-md text-label-md text-on-surface-variant">Dueño (Cliente)</label>
              <div class="relative">
                <input 
                  type="text"
                  id="clienteSearch"
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-primary text-body-sm text-on-surface"
                  placeholder="Escribe nombres, apellidos o DNI para buscar..."
                  [(ngModel)]="clientSearchQuery"
                  (focus)="isClientDropdownOpen.set(true)"
                  (blur)="onClientSearchBlur()"
                  (ngModelChange)="onClientSearchChange()"
                  name="clienteSearchQuery"
                  autocomplete="off"
                  required>
                <button 
                  type="button" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                  (click)="clearClientSelection()">
                  {{ activeMascota.idCliente ? '✕' : '▼' }}
                </button>
              </div>
              
              <!-- Suggestions Dropdown -->
              <div 
                *ngIf="isClientDropdownOpen() && filteredClientes().length > 0"
                class="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-surface-container border border-outline-variant rounded-lg shadow-xl z-[9999] py-1">
                <button
                  type="button"
                  *ngFor="let c of filteredClientes()"
                  (mousedown)="selectCliente(c)"
                  class="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-high transition-colors text-on-surface flex flex-col gap-0.5 border-b border-outline-variant/30 last:border-b-0 cursor-pointer">
                  <span class="font-semibold">{{ c.nombres }} {{ c.apellidoPaterno }} {{ c.apellidoMaterno }}</span>
                  <span class="text-[11px] text-on-surface-variant">Doc: {{ c.numeroDocumento }} • Tel: {{ c.telefono || '-' }}</span>
                </button>
              </div>
              <div 
                *ngIf="isClientDropdownOpen() && clientSearchQuery.trim() !== '' && filteredClientes().length === 0"
                class="absolute left-0 right-0 top-full mt-1 bg-surface-container border border-outline-variant rounded-lg shadow-xl z-[9999] p-3 text-center text-xs text-on-surface-variant">
                No se encontraron clientes coincidentes.
              </div>
            </div>

            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="nombre" class="font-label-md text-label-md text-on-surface-variant">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  [(ngModel)]="activeMascota.nombre" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                  placeholder="Nombre de la mascota">
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="sexo" class="font-label-md text-label-md text-on-surface-variant">Sexo</label>
                <select 
                  id="sexo" 
                  name="sexo" 
                  [(ngModel)]="activeMascota.sexo" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option value="" disabled>Seleccione...</option>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="especie" class="font-label-md text-label-md text-on-surface-variant">Especie</label>
                <select 
                  id="especie" 
                  name="especieId" 
                  [(ngModel)]="selectedEspecieId" 
                  (ngModelChange)="onEspecieChange()"
                  [required]="!isEditMode()"
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option [value]="0" disabled>Seleccione...</option>
                  <option *ngFor="let e of especies()" [value]="e.idEspecie">
                    {{ e.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="raza" class="font-label-md text-label-md text-on-surface-variant">Raza</label>
                <select 
                  id="raza" 
                  name="idRaza" 
                  [(ngModel)]="activeMascota.idRaza" 
                  required 
                  [disabled]="razas().length === 0"
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option [value]="0" disabled>Seleccione raza...</option>
                  <option *ngFor="let r of razas()" [value]="r.idRaza">
                    {{ r.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-md">
              <div class="form-group flex flex-col gap-xs">
                <label for="peso" class="font-label-md text-label-md text-on-surface-variant">Peso (kg)</label>
                <input 
                  type="number" 
                  step="0.01"
                  id="peso" 
                  name="peso" 
                  [(ngModel)]="activeMascota.peso" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                  placeholder="0.00">
              </div>

              <div class="form-group flex flex-col gap-xs">
                <label for="fechaNac" class="font-label-md text-label-md text-on-surface-variant">Nacimiento</label>
                <input 
                  type="date" 
                  id="fechaNac" 
                  name="fechaNacimiento" 
                  [(ngModel)]="activeMascota.fechaNacimiento" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
              </div>
            </div>

            <div class="form-group flex flex-col gap-xs">
              <label for="color" class="font-label-md text-label-md text-on-surface-variant">Color / Manto</label>
              <input 
                type="text" 
                id="color" 
                name="color" 
                [(ngModel)]="activeMascota.color" 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Ej. Dorado, Blanco con manchas">
            </div>

            <div class="form-group flex flex-col gap-xs">
              <label for="observaciones" class="font-label-md text-label-md text-on-surface-variant">Observaciones</label>
              <textarea 
                id="observaciones" 
                name="observaciones" 
                [(ngModel)]="activeMascota.observaciones" 
                rows="2"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Notas de salud, alergias..."></textarea>
            </div>

            <div class="flex justify-end gap-sm border-t border-outline-variant/50 pt-md mt-sm">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="!mascotaForm.valid" 
                class="bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-primary transition-colors">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Detailed Profile Modal (GSAP animated) -->
      <div *ngIf="isProfileModalOpen()" class="profile-modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div *ngIf="selectedPetProfile() as m" class="profile-modal-box bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full p-lg flex flex-col gap-md max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-outline-variant pb-md flex-shrink-0">
            <div class="flex items-center gap-md">
              <img [src]="getPetImage(m)" class="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-sm" />
              <div>
                <h3 class="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
                  {{ m.nombre }}
                  <span class="material-symbols-outlined text-primary text-[20px]" data-weight="fill">verified</span>
                </h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                  {{ m.nombreEspecie }} • {{ m.nombreRaza }}
                </p>
              </div>
            </div>
            <button (click)="closeProfileModal()" class="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center text-[20px]">&times;</button>
          </div>

          <!-- Bento Grid Profile Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-lg overflow-y-auto pr-2 flex-grow">
            
            <!-- Left Side: Pet and Owner Info -->
            <div class="space-y-lg">
              <!-- Pet Info Card -->
              <div class="bg-surface-container-low border border-outline-variant rounded-xl p-md">
                <h4 class="font-label-md text-label-md text-primary flex items-center gap-xs uppercase tracking-wider mb-md border-b border-outline-variant pb-xs">
                  <span class="material-symbols-outlined text-[18px]">pets</span> Detalles del Paciente
                </h4>
                <div class="grid grid-cols-2 gap-md text-body-sm">
                  <div>
                    <span class="text-on-surface-variant block text-xs">Sexo</span>
                    <span class="text-on-surface font-medium flex items-center gap-xs mt-0.5">
                      <span class="material-symbols-outlined text-[16px] text-tertiary">{{ m.sexo === 'M' ? 'male' : 'female' }}</span>
                      {{ m.sexo === 'M' ? 'Macho' : 'Hembra' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-on-surface-variant block text-xs">Peso Actual</span>
                    <span class="text-on-surface font-medium flex items-center gap-xs mt-0.5">
                      <span class="material-symbols-outlined text-[16px] text-secondary">scale</span>
                      {{ m.peso }} kg
                    </span>
                  </div>
                  <div>
                    <span class="text-on-surface-variant block text-xs">Color</span>
                    <span class="text-on-surface font-medium flex items-center gap-xs mt-0.5">
                      <span class="material-symbols-outlined text-[16px] text-on-surface-variant" data-weight="fill">palette</span>
                      {{ m.color || '-' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-on-surface-variant block text-xs">Fecha de Nacimiento</span>
                    <span class="text-on-surface font-medium flex items-center gap-xs mt-0.5">
                      <span class="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                      {{ formatProfileDate(m.fechaNacimiento) }} ({{ calculateAge(m.fechaNacimiento) }})
                    </span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-on-surface-variant block text-xs">Observaciones / Alergias</span>
                    <p class="text-on-surface text-body-sm mt-1 bg-surface-container rounded-lg p-2 border border-outline-variant/30 italic">
                      {{ m.observaciones || 'Sin observaciones registradas.' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Owner Info Card -->
              <div class="bg-surface-container-low border border-outline-variant rounded-xl p-md" *ngIf="selectedPetOwner() as owner; else loadingOwner">
                <h4 class="font-label-md text-label-md text-secondary flex items-center gap-xs uppercase tracking-wider mb-md border-b border-outline-variant pb-xs">
                  <span class="material-symbols-outlined text-[18px]">person</span> Datos del Propietario
                </h4>
                <div class="space-y-sm text-body-sm">
                  <div class="flex justify-between items-center">
                    <span class="text-on-surface-variant">Propietario:</span>
                    <span class="text-on-surface font-semibold">{{ owner.nombres }} {{ owner.apellidoPaterno }} {{ owner.apellidoMaterno }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-on-surface-variant">Identificación:</span>
                    <span class="text-on-surface font-semibold">Doc. N° {{ owner.numeroDocumento }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-on-surface-variant">Teléfono:</span>
                    <a href="tel:{{owner.telefono}}" class="text-primary hover:underline font-semibold flex items-center gap-xs">
                      <span class="material-symbols-outlined text-[16px]">call</span> {{ owner.telefono }}
                    </a>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-on-surface-variant">Correo:</span>
                    <a href="mailto:{{owner.correo}}" class="text-primary hover:underline font-semibold flex items-center gap-xs">
                      <span class="material-symbols-outlined text-[16px]">mail</span> {{ owner.correo }}
                    </a>
                  </div>
                  <div>
                    <span class="text-on-surface-variant block text-xs mb-0.5">Dirección:</span>
                    <span class="text-on-surface block font-medium bg-surface-container rounded-lg p-2 border border-outline-variant/30">
                      <span class="material-symbols-outlined text-[16px] text-on-surface-variant align-middle mr-1">location_on</span>
                      {{ owner.direccion }}
                    </span>
                  </div>
                </div>
              </div>
              <ng-template #loadingOwner>
                <div class="flex items-center justify-center p-md bg-surface-container-low border border-outline-variant rounded-xl">
                  <span class="material-symbols-outlined text-primary animate-spin mr-sm">progress_activity</span>
                  <span class="text-body-sm text-on-surface-variant">Cargando propietario...</span>
                </div>
              </ng-template>
            </div>

            <!-- Right Side: Recent Treatments & Vaccines -->
            <div class="space-y-lg">
              <!-- Recent Treatments Card -->
              <div class="bg-surface-container-low border border-outline-variant rounded-xl p-md">
                <h4 class="font-label-md text-label-md text-tertiary flex items-center gap-xs uppercase tracking-wider mb-md border-b border-outline-variant pb-xs">
                  <span class="material-symbols-outlined text-[18px]">medical_services</span> Tratamientos Recientes
                </h4>
                <div class="space-y-sm max-h-56 overflow-y-auto">
                  <div *ngFor="let t of selectedPetTreatments()" class="border-b border-outline-variant/20 last:border-b-0 pb-sm last:pb-0 text-body-sm">
                    <div class="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>{{ formatProfileDate(t.fechaAtencion) }}</span>
                      <span class="font-semibold text-primary">{{ t.nombreVeterinario }}</span>
                    </div>
                    <p class="font-semibold text-on-surface">{{ t.diagnostico }}</p>
                    <p class="text-on-surface-variant mt-0.5 italic text-xs" *ngIf="t.tratamiento">Tratamiento: {{ t.tratamiento }}</p>
                  </div>
                  <div *ngIf="selectedPetTreatments().length === 0" class="text-center py-md text-on-surface-variant italic">
                    Sin registros de tratamiento recientes.
                  </div>
                </div>
              </div>

              <!-- Vaccination Card -->
              <div class="bg-surface-container-low border border-outline-variant rounded-xl p-md">
                <h4 class="font-label-md text-label-md text-secondary flex items-center gap-xs uppercase tracking-wider mb-md border-b border-outline-variant pb-xs">
                  <span class="material-symbols-outlined text-[18px]">vaccines</span> Registro de Vacunación
                </h4>
                <div class="space-y-sm max-h-56 overflow-y-auto">
                  <div *ngFor="let v of selectedPetVaccines()" class="border-b border-outline-variant/20 last:border-b-0 pb-sm last:pb-0 text-body-sm flex justify-between gap-sm">
                    <div>
                      <p class="font-semibold text-on-surface flex items-center gap-xs">
                        <span class="material-symbols-outlined text-[16px] text-secondary" data-weight="fill">check_circle</span>
                        {{ v.nombreVacuna }}
                      </p>
                      <p class="text-xs text-on-surface-variant mt-0.5">Lote: {{ v.lote || '-' }} • Vet: {{ v.nombreVeterinario }}</p>
                    </div>
                    <div class="text-right text-xs">
                      <span class="block text-on-surface-variant">{{ formatProfileDate(v.fechaAplicacion) }}</span>
                      <span class="block text-secondary font-semibold mt-0.5" *ngIf="v.proximaDosis">Próx: {{ formatProfileDate(v.proximaDosis) }}</span>
                    </div>
                  </div>
                  <div *ngIf="selectedPetVaccines().length === 0" class="text-center py-md text-on-surface-variant italic">
                    Sin registros de vacunas aplicadas.
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-sm border-t border-outline-variant pt-md flex-shrink-0">
            <button 
              (click)="goToHistorial(m.idMascota!)" 
              class="px-md py-sm bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-label-md flex items-center gap-xs transition-all shadow-sm">
              <span class="material-symbols-outlined text-[18px]">history_edu</span> Ver Historial Completo
            </button>
            <button 
              (click)="closeProfileModal()" 
              class="px-md py-sm border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg font-label-md text-label-md transition-colors">
              Cerrar Perfil
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
    .animate-slideIn {
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .toast-notification {
      animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes toastSlideIn {
      from { transform: translateX(120%) scale(0.9); opacity: 0; }
      to { transform: translateX(0) scale(1); opacity: 1; }
    }
  `]
})
export class MascotasComponent implements OnInit {
  mascotas = signal<Mascota[]>([]);
  clientes = signal<Cliente[]>([]);
  especies = signal<Especie[]>([]);
  razas = signal<Raza[]>([]);
  
  // Card Actions Menu State
  openCardMenuId = signal<number | null>(null);

  // Selected specie for loading breeds
  selectedEspecieId = 0;

  // Modal state
  isModalOpen = signal(false);
  isEditMode = signal(false);
  activeMascota: Mascota = this.getEmptyMascota();

  // Profile Modal State (GreenSock animated)
  isProfileModalOpen = signal(false);
  selectedPetProfile = signal<Mascota | null>(null);
  selectedPetOwner = signal<Cliente | null>(null);
  selectedPetTreatments = signal<HistorialClinico[]>([]);
  selectedPetVaccines = signal<MascotaVacuna[]>([]);

  // Autocomplete variables
  clientSearchQuery = '';
  isClientDropdownOpen = signal(false);

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

  // Images for styling matching the VetCare request
  dogImage1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgIvdNl79sJvfdkYeY6Yht2K2kFhLj5JFCPoKt3cjuYcKb2txe4i_1UY5bTsNrVu3RvfKCARYKtQNMIcspFdaPpMjOySrmSr90jJpo9ZQBZlLA-qqDJwZgth4QKCsrcfi_9t48Hm6dEPPCgjNO7hOYOIoBrknGKk0PZc-Blba8EDpoE1g4D2qZOJj74Tl9EGjPyIh7eNVm21FW4V9X1RV01EYpl1-548CG7zn3qyfhXh2uSlxmXYMdkKp_fIEeCcF3F_lcmSQOvFQ';
  catImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGSGrA9quus7p9RM1K_ne08eXam7tMlquWYr-4j1wYH9vhDy25zNr8nGGVKnpi-DOh0vwNv-3jJxcn9xaLDGBzhe3fGR9j2BKKAQwilh8C23kfRl9iNKR949kam7maN7u8Il8CeX0rlkmXBZnfL3vVLcBbVsBQiQ1WYb1j-dbdEcCNJuBfX3E--QcOCIvSPNT-XC1WjwVO9J5d0FX-K7CcaXtx3WL3xt3r6rYfxHClhVKHBKTdlrU87ZX0FWfcavX2DQnlxFrLxs';
  dogImage2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfDVSWG_QjD4bssvQnQSMKhO1BB-QrrrdnXo1ks9UkF_2Yh2OyH0zjA4ajBcsgWDv4AgZFjbxP0TVAwh-zEDK32vjiyNatlb5juBnoT0S2TzCpmwkH3kus0a9YLXpo1I10o5iS7k0IawlQV9TjBEf_5JXGkUIgA8hEW1jsEeQZFHXfLJkSupA9vIId-Nbm2Ux54mSYVHZdnMvagmqJDjWcSYANEuG6qFOOMRmP_RikELDnFZd5CaqA2RJotnNMYhOMkoduHqzThds';

  constructor(
    private dataService: DataService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMascotas();
    this.loadClientes();
    this.loadEspecies();
    this.animateCardsOnLoad();
  }

  animateCardsOnLoad(): void {
    setTimeout(() => {
      const cards = document.querySelectorAll('.grid > div');
      if (cards.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
        );
      }
    }, 200);
  }

  loadMascotas(): void {
    this.dataService.getMascotas().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.mascotas.set(res.data.content);
          this.animateCardsOnLoad();
        }
      }
    });
  }

  loadClientes(): void {
    this.dataService.getClientes(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.clientes.set(res.data.content.filter(c => c.estado));
        }
      }
    });
  }

  loadEspecies(): void {
    this.dataService.getEspecies().subscribe({
      next: (res) => {
        if (res.success) {
          this.especies.set(res.data);
        }
      }
    });
  }

  onEspecieChange(): void {
    if (this.selectedEspecieId > 0) {
      this.activeMascota.idRaza = 0;
      this.dataService.getRazas(this.selectedEspecieId).subscribe({
        next: (res) => {
          if (res.success) {
            this.razas.set(res.data);
          }
        }
      });
    } else {
      this.razas.set([]);
    }
  }

  toggleCardActions(id: number): void {
    if (this.openCardMenuId() === id) {
      this.openCardMenuId.set(null);
    } else {
      this.openCardMenuId.set(id);
    }
  }

  getPetImage(m: Mascota): string {
    if (m.nombre.toLowerCase().includes('max') || (m.nombreEspecie?.toLowerCase().includes('perro') && m.nombreRaza?.toLowerCase().includes('retriever'))) {
      return this.dogImage1;
    }
    if (m.nombre.toLowerCase().includes('bella') || m.idMascota === 1) {
      return this.dogImage2;
    }
    if (m.nombre.toLowerCase().includes('luna') || m.idMascota === 2 || m.nombreEspecie?.toLowerCase().includes('gato')) {
      return this.catImage;
    }
    return this.dogImage2;
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

  getEmptyMascota(): Mascota {
    return {
      idCliente: 0,
      idRaza: 0,
      nombre: '',
      sexo: '',
      color: '',
      peso: 0,
      fechaNacimiento: '',
      observaciones: ''
    };
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedEspecieId = 0;
    this.razas.set([]);
    this.activeMascota = this.getEmptyMascota();
    this.clientSearchQuery = '';
    this.isClientDropdownOpen.set(false);
    this.isModalOpen.set(true);
  }

  openEditModal(mascota: Mascota): void {
    this.openCardMenuId.set(null);
    this.isEditMode.set(true);
    this.activeMascota = { ...mascota };
    this.selectedEspecieId = 0;
    this.syncClientSearchQuery();
    this.isClientDropdownOpen.set(false);
    
    const specie = this.especies().find(e => e.nombre === mascota.nombreEspecie);
    if (specie) {
      this.selectedEspecieId = specie.idEspecie;
      this.dataService.getRazas(specie.idEspecie).subscribe({
        next: (res) => {
          if (res.success) {
            this.razas.set(res.data);
            this.isModalOpen.set(true);
          }
        }
      });
    } else {
      this.isModalOpen.set(true);
    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  // Autocomplete helper methods
  filteredClientes(): Cliente[] {
    const q = this.clientSearchQuery.toLowerCase().trim();
    const list = this.clientes();
    if (!q) {
      return list.slice(0, 10);
    }
    return list.filter(c => 
      c.nombres.toLowerCase().includes(q) || 
      c.apellidoPaterno.toLowerCase().includes(q) || 
      c.apellidoMaterno.toLowerCase().includes(q) || 
      c.numeroDocumento.includes(q)
    ).slice(0, 10);
  }

  selectCliente(c: Cliente): void {
    this.activeMascota.idCliente = c.idCliente!;
    this.clientSearchQuery = `${c.nombres} ${c.apellidoPaterno} ${c.apellidoMaterno}`;
    this.isClientDropdownOpen.set(false);
  }

  clearClientSelection(): void {
    this.activeMascota.idCliente = 0;
    this.clientSearchQuery = '';
    this.isClientDropdownOpen.set(true);
  }

  onClientSearchChange(): void {
    const selected = this.clientes().find(c => c.idCliente === this.activeMascota.idCliente);
    if (selected) {
      const selectedName = `${selected.nombres} ${selected.apellidoPaterno} ${selected.apellidoMaterno}`;
      if (this.clientSearchQuery !== selectedName) {
        this.activeMascota.idCliente = 0;
      }
    }
  }

  onClientSearchBlur(): void {
    setTimeout(() => {
      this.isClientDropdownOpen.set(false);
      this.syncClientSearchQuery();
    }, 250);
  }

  syncClientSearchQuery(): void {
    if (this.activeMascota.idCliente && this.activeMascota.idCliente > 0) {
      const selected = this.clientes().find(c => c.idCliente === this.activeMascota.idCliente);
      if (selected) {
        this.clientSearchQuery = `${selected.nombres} ${selected.apellidoPaterno} ${selected.apellidoMaterno}`;
      }
    } else {
      this.clientSearchQuery = '';
    }
  }

  saveMascota(): void {
    if (!this.activeMascota.idCliente || this.activeMascota.idCliente <= 0) {
      this.showToast('Por favor, seleccione un dueño (cliente) válido de la lista sugerida.', 'warning');
      return;
    }

    if (this.isEditMode()) {
      const id = this.activeMascota.idMascota!;
      this.dataService.updateMascota(id, this.activeMascota).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Mascota actualizada con éxito.');
            this.loadMascotas();
            this.closeModal();
          } else {
            this.showToast('Error al actualizar mascota: ' + res.message, 'error');
          }
        },
        error: (err) => {
          this.showToast('Error al actualizar mascota: ' + (err.error?.message || err.message || 'Error de conexión'), 'error');
        }
      });
    } else {
      this.dataService.createMascota(this.activeMascota).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Mascota registrada con éxito.');
            this.loadMascotas();
            this.closeModal();
          } else {
            this.showToast('Error al registrar mascota: ' + res.message, 'error');
          }
        },
        error: (err) => {
          this.showToast('Error al registrar mascota: ' + (err.error?.message || err.message || 'Error de conexión'), 'error');
        }
      });
    }
  }

  deleteMascota(mascota: Mascota): void {
    this.openCardMenuId.set(null);
    if (confirm(`¿Está seguro de que desea cambiar el estado de la mascota ${mascota.nombre}?`)) {
      this.dataService.deleteMascota(mascota.idMascota!).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Estado de la mascota actualizado.');
            this.loadMascotas();
          } else {
            this.showToast('Error al desactivar/activar mascota: ' + res.message, 'error');
          }
        },
        error: (err) => {
          this.showToast('Error al cambiar el estado de la mascota', 'error');
        }
      });
    }
  }

  goToHistorial(id: number): void {
    this.openCardMenuId.set(null);
    this.closeProfileModal();
    this.router.navigate(['/historial-clinico', id]);
  }

  // Profile Modal Methods (GSAP Animated)
  openProfileModal(m: Mascota): void {
    this.selectedPetProfile.set(m);
    this.isProfileModalOpen.set(true);
    this.selectedPetOwner.set(null);
    this.selectedPetTreatments.set([]);
    this.selectedPetVaccines.set([]);

    // Fetch full owner details
    this.dataService.getCliente(m.idCliente).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedPetOwner.set(res.data);
        }
      }
    });

    // Fetch recent treatments (first page)
    this.dataService.getHistorialClinicoByMascota(m.idMascota!, 0, 5).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedPetTreatments.set(res.data.content || []);
        }
      }
    });

    // Fetch vaccines registered
    this.dataService.getVacunasByMascota(m.idMascota!, 0, 5).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedPetVaccines.set(res.data.content || []);
        }
      }
    });

    // GSAP Open Animation
    setTimeout(() => {
      const backdrop = document.querySelector('.profile-modal-backdrop');
      const box = document.querySelector('.profile-modal-box');
      if (backdrop && box && typeof gsap !== 'undefined') {
        gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(box, 
          { scale: 0.85, y: 40, opacity: 0 }, 
          { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' }
        );
      }
    }, 50);
  }

  closeProfileModal(): void {
    const backdrop = document.querySelector('.profile-modal-backdrop');
    const box = document.querySelector('.profile-modal-box');
    if (backdrop && box && typeof gsap !== 'undefined') {
      gsap.to(backdrop, { opacity: 0, duration: 0.25 });
      gsap.to(box, { 
        scale: 0.85, 
        y: 30, 
        opacity: 0, 
        duration: 0.25, 
        onComplete: () => {
          this.isProfileModalOpen.set(false);
          this.selectedPetProfile.set(null);
        }
      });
    } else {
      this.isProfileModalOpen.set(false);
      this.selectedPetProfile.set(null);
    }
  }

  formatProfileDate(dateStr?: any): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }
}
