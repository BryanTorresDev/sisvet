import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService, Veterinario, Especialidad, TipoDocumento } from '../../services/data';
import { AuthService } from '../../services/auth';

declare var gsap: any;

@Component({
  selector: 'app-veterinarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex-grow">
      
      <!-- Page Header & Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-xl">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface font-bold">Personal Médico</h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-1">
            Administre su equipo de veterinarios, actualice sus especialidades y controle su disponibilidad en la clínica.
          </p>
        </div>
        <button 
          *ngIf="!authService.isRecepcionista()"
          (click)="openAddModal()" 
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors duration-300 shadow-sm hover:shadow-md h-fit cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Registrar Veterinario
        </button>
      </div>

      <!-- Controls (Search & Filters) -->
      <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-lg">
        <!-- Search Input -->
        <div class="relative w-full lg:w-96 group">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            class="w-full h-10 pl-10 pr-4 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
            placeholder="Buscar veterinarios por nombre, especialidad o CMVP..."/>
        </div>
      </div>

      <!-- Bento Grid for Staff Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        
        <!-- Vet Card -->
        <div 
          *ngFor="let v of filteredVeterinarios()" 
          class="vet-card bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          
          <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:bg-primary/10 transition-colors"></div>
          
          <!-- Card Header (Avatar & Context menu) -->
          <div class="flex justify-between items-start">
            <img 
              [src]="getAvatarUrl(v.nombres, v.idVeterinario)" 
              [alt]="v.nombres" 
              class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
            
            <div class="relative" *ngIf="!authService.isRecepcionista()">
              <button 
                (click)="toggleMenu(v.idVeterinario)" 
                class="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container cursor-pointer">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
              
              <!-- Floating actions menu -->
              <div 
                *ngIf="openMenuId === v.idVeterinario" 
                class="absolute right-0 mt-1 w-36 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-20 text-left">
                <button 
                  (click)="openEditModal(v)" 
                  class="w-full px-4 py-2 hover:bg-surface-container transition-colors flex items-center gap-sm text-body-sm text-on-surface cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">edit</span> Editar
                </button>
                <button 
                  (click)="deleteVet(v.idVeterinario)" 
                  class="w-full px-4 py-2 hover:bg-surface-container text-error hover:bg-error-container/10 transition-colors flex items-center gap-sm text-body-sm cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">delete</span> Desactivar
                </button>
              </div>
            </div>
          </div>

          <!-- Doctor Identity -->
          <div>
            <h3 class="text-headline-sm font-headline-sm font-bold text-on-surface leading-tight">
              Dr(a). {{ v.nombres }} {{ v.apellidoPaterno }}
            </h3>
            <p class="text-primary font-label-md text-label-md mt-1 font-semibold">
              {{ v.especialidad }}
            </p>
            <p class="text-[11px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-wider">
              C.M.V.P: {{ v.numeroColegiatura || 'N/A' }}
            </p>
          </div>

          <!-- Professional bio info -->
          <div class="flex flex-col gap-xs text-body-sm font-body-sm text-on-surface-variant border-t border-outline-variant/40 pt-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-primary">work</span>
              <span>{{ getYearsExperience(v.idVeterinario) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-primary">school</span>
              <span class="truncate" [title]="getUniversity(v.idVeterinario)">{{ getUniversity(v.idVeterinario) }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="material-symbols-outlined text-[16px]">phone</span>
              <span>{{ v.telefono || '-' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">mail</span>
              <span class="truncate" [title]="v.correo">{{ v.correo || '-' }}</span>
            </div>
          </div>

          <!-- Card Footer Status -->
          <div class="mt-auto pt-4 border-t border-outline-variant/40 flex items-center justify-between">
            <div class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm flex items-center gap-1 font-semibold border border-secondary/15">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Disponible
            </div>
            <a 
              routerLink="/citas" 
              class="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors flex items-center cursor-pointer"
              title="Programar cita">
              <span class="material-symbols-outlined text-[20px]">calendar_add_on</span>
            </a>
          </div>
          
        </div>

        <!-- Empty state -->
        <div *ngIf="filteredVeterinarios().length === 0" class="col-span-full bg-surface border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <span class="material-symbols-outlined text-[48px] text-outline-variant">medical_services</span>
          <p class="italic text-body-md font-medium">No se encontraron médicos veterinarios registrados.</p>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl max-w-2xl w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">
              {{ isEditMode() ? 'Editar Veterinario' : 'Registrar Veterinario' }}
            </h3>
            <button (click)="closeModal()" class="text-on-surface-variant hover:text-on-surface text-[24px] cursor-pointer">&times;</button>
          </div>

          <form (ngSubmit)="saveVeterinario()" #vetForm="ngForm" class="flex flex-col gap-md">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
              <!-- Nombres -->
              <div class="form-group flex flex-col gap-xs">
                <label for="nombres" class="font-label-md text-label-md text-on-surface-variant">Nombres</label>
                <input 
                  type="text" 
                  id="nombres" 
                  name="nombres" 
                  [(ngModel)]="activeVet.nombres" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>

              <!-- Apellido Paterno -->
              <div class="form-group flex flex-col gap-xs">
                <label for="apellidoPaterno" class="font-label-md text-label-md text-on-surface-variant">Apellido Paterno</label>
                <input 
                  type="text" 
                  id="apellidoPaterno" 
                  name="apellidoPaterno" 
                  [(ngModel)]="activeVet.apellidoPaterno" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>

              <!-- Apellido Materno -->
              <div class="form-group flex flex-col gap-xs">
                <label for="apellidoMaterno" class="font-label-md text-label-md text-on-surface-variant">Apellido Materno</label>
                <input 
                  type="text" 
                  id="apellidoMaterno" 
                  name="apellidoMaterno" 
                  [(ngModel)]="activeVet.apellidoMaterno" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
              <!-- Tipo Documento -->
              <div class="form-group flex flex-col gap-xs">
                <label for="idTipoDocumento" class="font-label-md text-label-md text-on-surface-variant">Tipo Documento</label>
                <select 
                  id="idTipoDocumento" 
                  name="idTipoDocumento" 
                  [(ngModel)]="activeVet.idTipoDocumento" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option *ngFor="let t of tiposDocumento()" [value]="t.idTipoDocumento">{{ t.nombre }}</option>
                </select>
              </div>

              <!-- Número Documento -->
              <div class="form-group flex flex-col gap-xs">
                <label for="numeroDocumento" class="font-label-md text-label-md text-on-surface-variant">Número Documento</label>
                <input 
                  type="text" 
                  id="numeroDocumento" 
                  name="numeroDocumento" 
                  [(ngModel)]="activeVet.numeroDocumento" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>

              <!-- Especialidad -->
              <div class="form-group flex flex-col gap-xs">
                <label for="idEspecialidad" class="font-label-md text-label-md text-on-surface-variant">Especialidad</label>
                <select 
                  id="idEspecialidad" 
                  name="idEspecialidad" 
                  [(ngModel)]="activeVet.idEspecialidad" 
                  required 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface">
                  <option *ngFor="let e of especialidades()" [value]="e.idEspecialidad">{{ e.nombre }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
              <!-- Teléfono -->
              <div class="form-group flex flex-col gap-xs">
                <label for="telefono" class="font-label-md text-label-md text-on-surface-variant">Teléfono</label>
                <input 
                  type="text" 
                  id="telefono" 
                  name="telefono" 
                  [(ngModel)]="activeVet.telefono" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>

              <!-- Correo -->
              <div class="form-group flex flex-col gap-xs">
                <label for="correo" class="font-label-md text-label-md text-on-surface-variant">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="correo" 
                  name="correo" 
                  [(ngModel)]="activeVet.correo" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>

              <!-- Número de Colegiatura -->
              <div class="form-group flex flex-col gap-xs">
                <label for="numeroColegiatura" class="font-label-md text-label-md text-on-surface-variant">Colegiatura (C.M.V.P)</label>
                <input 
                  type="text" 
                  id="numeroColegiatura" 
                  name="numeroColegiatura" 
                  [(ngModel)]="activeVet.numeroColegiatura" 
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
              </div>
            </div>

            <!-- Dirección -->
            <div class="form-group flex flex-col gap-xs">
              <label for="direccion" class="font-label-md text-label-md text-on-surface-variant">Dirección</label>
              <input 
                type="text" 
                id="direccion" 
                name="direccion" 
                [(ngModel)]="activeVet.direccion" 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" />
            </div>

            <div class="flex justify-end gap-sm border-t border-outline-variant pb-xs pt-md mt-sm">
              <button 
                type="button" 
                (click)="closeModal()" 
                class="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md py-sm px-md rounded-lg hover:bg-surface-container transition-colors cursor-pointer">
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="!vetForm.valid" 
                class="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-primary-container transition-colors cursor-pointer">
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
export class VeterinariosComponent implements OnInit {
  veterinarians = signal<Veterinario[]>([]);
  filteredVeterinarios = signal<Veterinario[]>([]);
  especialidades = signal<Especialidad[]>([]);
  tiposDocumento = signal<TipoDocumento[]>([]);

  searchQuery = '';
  openMenuId: number | null = null;

  isModalOpen = signal(false);
  isEditMode = signal(false);

  activeVet: any = this.getEmptyVet();

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadVeterinarios();
    this.loadCatalogs();
  }

  loadVeterinarios(): void {
    this.dataService.getVeterinarios(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.veterinarians.set(res.data.content);
          this.applyFilters();
          this.animateOnLoad();
        }
      }
    });
  }

  loadCatalogs(): void {
    this.dataService.getEspecialidades().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.especialidades.set(res.data);
        }
      }
    });

    this.dataService.getTiposDocumento().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tiposDocumento.set(res.data);
        }
      }
    });
  }

  animateOnLoad(): void {
    setTimeout(() => {
      const cards = document.querySelectorAll('.vet-card');
      if (cards.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
      }
    }, 150);
  }

  applyFilters(): void {
    let list = this.veterinarians();
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      list = list.filter(v => 
        v.nombres.toLowerCase().includes(query) || 
        v.apellidoPaterno.toLowerCase().includes(query) || 
        (v.especialidad && v.especialidad.toLowerCase().includes(query)) ||
        (v.numeroColegiatura && v.numeroColegiatura.toLowerCase().includes(query))
      );
    }

    this.filteredVeterinarios.set(list);
  }

  toggleMenu(id: number): void {
    if (this.openMenuId === id) {
      this.openMenuId = null;
    } else {
      this.openMenuId = id;
    }
  }

  getEmptyVet(): any {
    return {
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      idTipoDocumento: null,
      numeroDocumento: '',
      idEspecialidad: null,
      telefono: '',
      correo: '',
      numeroColegiatura: '',
      direccion: ''
    };
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.activeVet = this.getEmptyVet();
    this.isModalOpen.set(true);
  }

  openEditModal(vet: Veterinario): void {
    this.openMenuId = null;
    this.isEditMode.set(true);
    
    // Find matching catalog IDs to set dropdown defaults correctly
    const espObj = this.especialidades().find(e => e.nombre.toLowerCase() === vet.especialidad.toLowerCase());
    const tipoDocObj = this.tiposDocumento().find(t => t.nombre.toLowerCase() === vet.tipoDocumento.toLowerCase());

    this.activeVet = {
      idVeterinario: vet.idVeterinario,
      nombres: vet.nombres,
      apellidoPaterno: vet.apellidoPaterno,
      apellidoMaterno: vet.apellidoMaterno,
      idTipoDocumento: tipoDocObj ? tipoDocObj.idTipoDocumento : null,
      numeroDocumento: vet.numeroDocumento,
      idEspecialidad: espObj ? espObj.idEspecialidad : null,
      telefono: vet.telefono,
      correo: vet.correo,
      numeroColegiatura: vet.numeroColegiatura,
      direccion: vet.direccion
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveVeterinario(): void {
    const payload = {
      ...this.activeVet,
      idTipoDocumento: Number(this.activeVet.idTipoDocumento),
      idEspecialidad: Number(this.activeVet.idEspecialidad)
    };

    if (this.isEditMode()) {
      this.dataService.updateVeterinario(this.activeVet.idVeterinario, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadVeterinarios();
            this.closeModal();
          }
        }
      });
    } else {
      this.dataService.createVeterinario(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadVeterinarios();
            this.closeModal();
          }
        }
      });
    }
  }

  deleteVet(id: number): void {
    this.openMenuId = null;
    if (confirm('¿Está seguro de que desea desactivar a este veterinario?')) {
      this.dataService.deleteVeterinario(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadVeterinarios();
          }
        }
      });
    }
  }

  // Visual helper methods
  getAvatarUrl(name: string, id: number): string {
    const avatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvGhgF244vKK739oP05s6-_qYnyByY9ymDv3YOAvHW5O0qtnqbGFM6xCJG0iPObZ_ZULGOPlnRSau7eQ8go7hP5xRPTueZLqBNY0m6NNK6xEwaQosHzNCfCz5dAZkEATF_4dLZZnKwMqg5ePVr0gHa1KkxRTLbIeNBiyNze3maQGeu9Sdtr74Q9qBSzN07IZSaoWdVc9yJBZvIoKoMCYSjqlRQzXI5_dbWpfrrwD5n4nrVzSl2anS0F2EMS5d8gz6WsQSChpezOPU',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByPhH5VeWKl8axDYqwqw2SThGPwM-qIwDzWnJpKZTZ7GOO5l4N_AnOqNSU69QHm9h43X5MoqQr56-cS36yZbeXkHPUeblcHmc2p5Dh8oXuE9eHdoRADJP0PDl7v_T8e9ZIUU5qOz6JavtjV4w7Wrnbf_SqPCrdXFy5pUUjsKHfAYaQwbqr0atHzbIclabdVTT0oZ2eJls9YdhGq5oKbENx8OhOpqhHshh0ZekXGZevr3u9quIRqi0-R5vdgC7r8C8Wf24xzfJMpf4',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCU-0joWLilF_ZjkNjQ4a8kGLSrfVi4wNxQmsQdJG7pfnKQKh2MHwy6rja2xfmydv5d6M2SfUIz7RG_qIJQkldHly-LWNMfD1qKG4wEOtRcyvgvJ_-paLa3rqFa3l3XZLfebgTyOi0VzyHxarYLSu3G3d3ZkNf4zsG7kv3NLgYtOxBlseJYUnsTaYtI4qh2bffFYdMvaebo_9uThu9663ReyADc2Ge-cnkBjTqF-0r6ITS89kRn1b_mUZ1Vb-5sE8BZYV8esU3I36g',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6nlwSAAlwu4Qtgcb-6icnwb0l7ZiG5jQRKYkRO3bhBJw9Jw-xcLNcan6NMWjaOBc_gotdVmqLmeOSzZbI99Ei-Luye8DhbIEaWXaknoX9CeT8kTrA7fI71K05Ne1b-tEUu_81IK-YKrQ9vUd9l4Wvl0-9TMMR3FHDTzMSirwBVoDDWxF_bDO0dXHZY_FtAMSt_-IonK_JprllboBsSKT2gEY1mksECnQ0rAzrofZ6djOqFz8JVF446a2WKm5fh8scOGI0PWugAOA'
    ];
    return avatars[id % avatars.length];
  }

  getYearsExperience(id: number): string {
    return `${((id * 3) % 12) + 4} años de experiencia`;
  }

  getUniversity(id: number): string {
    const universities = [
      'Univ. Nacional Mayor de San Marcos',
      'Univ. Nacional Agraria La Molina',
      'Univ. Científica del Sur',
      'Univ. Peruana Cayetano Heredia'
    ];
    return universities[id % universities.length];
  }
}
