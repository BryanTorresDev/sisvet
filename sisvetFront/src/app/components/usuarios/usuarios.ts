import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Usuario } from '../../services/data';

declare var gsap: any;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-grow">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-xl">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface font-bold">Gestión de Usuarios</h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-1">Administre el acceso, roles y permisos del personal de la clínica.</p>
        </div>
        <button 
          (click)="openAddModal()" 
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md hover:bg-primary-container transition-colors duration-300 shadow-sm hover:shadow-md h-fit">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Agregar Usuario
        </button>
      </div>

      <!-- Controls (Search & Filter) -->
      <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-lg">
        <!-- Search Input -->
        <div class="relative w-full lg:w-96 group">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            class="w-full h-10 pl-10 pr-4 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" 
            placeholder="Buscar usuarios por nombre o correo..."/>
        </div>

        <!-- Role Filters -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar w-full lg:w-auto font-label-sm text-label-sm">
          <button 
            (click)="setActiveRole('ALL')" 
            [ngClass]="activeRole === 'ALL' ? 'bg-surface-container-high text-on-surface border-transparent' : 'bg-surface text-on-surface-variant border-outline-variant hover:border-outline'"
            class="px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors shadow-sm">
            Todos los Roles
          </button>
          <button 
            (click)="setActiveRole('ADMIN')" 
            [ngClass]="activeRole === 'ADMIN' ? 'bg-surface-container-high text-on-surface border-transparent' : 'bg-surface text-on-surface-variant border-outline-variant hover:border-outline'"
            class="px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors shadow-sm">
            Administrador
          </button>
          <button 
            (click)="setActiveRole('VETERINARIO')" 
            [ngClass]="activeRole === 'VETERINARIO' ? 'bg-surface-container-high text-on-surface border-transparent' : 'bg-surface text-on-surface-variant border-outline-variant hover:border-outline'"
            class="px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors shadow-sm">
            Veterinario
          </button>
          <button 
            (click)="setActiveRole('RECEPCIONISTA')" 
            [ngClass]="activeRole === 'RECEPCIONISTA' ? 'bg-surface-container-high text-on-surface border-transparent' : 'bg-surface text-on-surface-variant border-outline-variant hover:border-outline'"
            class="px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors shadow-sm">
            Recepcionista
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-surface-container border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-xs">
                <th class="px-6 py-4 font-semibold">Usuario</th>
                <th class="px-6 py-4 font-semibold">Roles</th>
                <th class="px-6 py-4 font-semibold">Correo Electrónico</th>
                <th class="px-6 py-4 font-semibold">Último Acceso</th>
                <th class="px-6 py-4 font-semibold">Estado</th>
                <th class="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant/30">
              <tr 
                *ngFor="let u of filteredUsuarios()" 
                class="hover:bg-surface-container-low/30 transition-colors duration-200 group h-14">
                
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase border border-outline-variant shadow-sm">
                      {{ u.username.substring(0, 2) }}
                    </div>
                    <span class="font-medium text-on-surface group-hover:text-primary transition-colors">{{ u.username }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 text-on-surface-variant">
                  <span 
                    *ngFor="let role of u.roles"
                    class="inline-block mr-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface-container border border-outline-variant">
                    {{ formatRoleName(role) }}
                  </span>
                </td>

                <td class="px-6 py-4 text-on-surface-variant">{{ u.email }}</td>
                
                <td class="px-6 py-4 text-on-surface-variant">
                  {{ formatDateTime(u.ultimoLogin) }}
                </td>

                <td class="px-6 py-4">
                  <span 
                    [ngClass]="u.estado ? 'bg-secondary-container text-on-secondary-container border border-secondary/15' : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant'"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
                    {{ u.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <td class="px-6 py-4 text-right relative">
                  <button 
                    (click)="toggleMenu(u.idUsuario!)" 
                    class="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container">
                    <span class="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>

                  <div 
                    *ngIf="openMenuId === u.idUsuario" 
                    class="absolute right-6 mt-1 w-44 bg-surface border border-outline-variant rounded-lg shadow-lg py-1 z-20 text-left">
                    <button 
                      (click)="openEditModal(u)" 
                      class="w-full px-4 py-2 hover:bg-surface-container transition-colors flex items-center gap-sm text-body-sm text-on-surface">
                      <span class="material-symbols-outlined text-[18px]">edit</span> Editar
                    </button>
                    <button 
                      (click)="toggleStatus(u.idUsuario!)" 
                      class="w-full px-4 py-2 hover:bg-surface-container transition-colors flex items-center gap-sm text-body-sm text-on-surface">
                      <span class="material-symbols-outlined text-[18px]">cached</span> 
                      {{ u.estado ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="filteredUsuarios().length === 0">
                <td colspan="6" class="text-center py-xl text-on-surface-variant italic">
                  <span class="material-symbols-outlined text-[40px] block mb-xs">people_mute</span>
                  No se encontraron usuarios.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="bg-surface-container border-t border-outline-variant px-6 py-4 flex items-center justify-between">
          <span class="text-label-sm font-label-sm text-on-surface-variant">
            Mostrando {{ filteredUsuarios().length }} de {{ usuarios().length }} usuarios
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

      <!-- Add / Edit Modal -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
        <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl max-w-lg w-full p-lg animate-slideIn">
          <div class="flex items-center justify-between border-b border-outline-variant pb-md mb-md">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">
              {{ isEditMode() ? 'Editar Usuario' : 'Agregar Usuario' }}
            </h3>
            <button (click)="closeModal()" class="text-on-surface-variant hover:text-on-surface text-[24px]">&times;</button>
          </div>

          <form (ngSubmit)="saveUsuario()" #userForm="ngForm" class="flex flex-col gap-md">
            
            <!-- Username -->
            <div class="form-group flex flex-col gap-xs">
              <label for="username" class="font-label-md text-label-md text-on-surface-variant">Nombre de Usuario</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                [(ngModel)]="activeUser.username" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Ej. sjenkins">
            </div>

            <!-- Email -->
            <div class="form-group flex flex-col gap-xs">
              <label for="email" class="font-label-md text-label-md text-on-surface-variant">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                [(ngModel)]="activeUser.email" 
                required 
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="Ej. s.jenkins@vetcare.clinic">
            </div>

            <!-- Password -->
            <div class="form-group flex flex-col gap-xs">
              <label for="password" class="font-label-md text-label-md text-on-surface-variant">
                Contraseña {{ isEditMode() ? '(Dejar vacío para mantener)' : '' }}
              </label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                [(ngModel)]="activeUser.password" 
                [required]="!isEditMode()"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-4 focus:outline-none focus:border-primary text-body-sm text-on-surface" 
                placeholder="******">
            </div>

            <!-- Roles (Checkboxes) -->
            <div class="form-group flex flex-col gap-xs">
              <label class="font-label-md text-label-md text-on-surface-variant mb-xs">Asignar Roles</label>
              <div class="flex flex-col gap-sm bg-surface-container-low border border-outline-variant rounded-lg p-md">
                
                <label class="flex items-center gap-sm cursor-pointer text-body-sm text-on-surface font-medium">
                  <input 
                    type="checkbox" 
                    [checked]="hasRole('ADMIN')" 
                    (change)="toggleRoleAssignment('ADMIN')" 
                    class="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface" />
                  Administrador (Admin)
                </label>

                <label class="flex items-center gap-sm cursor-pointer text-body-sm text-on-surface font-medium">
                  <input 
                    type="checkbox" 
                    [checked]="hasRole('VETERINARIO')" 
                    (change)="toggleRoleAssignment('VETERINARIO')" 
                    class="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface" />
                  Veterinario (Veterinarian)
                </label>

                <label class="flex items-center gap-sm cursor-pointer text-body-sm text-on-surface font-medium">
                  <input 
                    type="checkbox" 
                    [checked]="hasRole('RECEPCIONISTA')" 
                    (change)="toggleRoleAssignment('RECEPCIONISTA')" 
                    class="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface" />
                  Recepcionista (Receptionist)
                </label>

              </div>
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
                [disabled]="!userForm.valid || activeUser.roles.length === 0" 
                class="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-primary-container transition-colors">
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
export class UsuariosComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  filteredUsuarios = signal<Usuario[]>([]);

  // Filters State
  searchQuery = '';
  activeRole = 'ALL';

  // Pagination
  currentPage = 0;
  pageSize = 5;
  isLastPage = false;

  // Modal State
  isModalOpen = signal(false);
  isEditMode = signal(false);
  activeUser: Usuario = this.getEmptyUser();

  // Selected row menu mapping
  openMenuId: number | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  animateOnLoad(): void {
    setTimeout(() => {
      const rows = document.querySelectorAll('tbody tr');
      if (rows.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(rows, 
          { y: 15, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }, 150);
  }

  loadUsuarios(): void {
    this.dataService.getUsuarios(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.usuarios.set(res.data.content || []);
          this.isLastPage = res.data.last;
          this.applyFilters();
          this.animateOnLoad();
        }
      }
    });
  }

  applyFilters(): void {
    let list = this.usuarios();
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      list = list.filter(u => 
        u.username.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    if (this.activeRole !== 'ALL') {
      list = list.filter(u => u.roles.includes(this.activeRole));
    }

    this.filteredUsuarios.set(list);
  }

  setActiveRole(role: string): void {
    this.activeRole = role;
    this.applyFilters();
    this.animateOnLoad();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsuarios();
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
      this.loadUsuarios();
    }
  }

  getEmptyUser(): Usuario {
    return {
      username: '',
      email: '',
      password: '',
      roles: []
    };
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.activeUser = this.getEmptyUser();
    this.isModalOpen.set(true);
  }

  openEditModal(user: Usuario): void {
    this.openMenuId = null;
    this.isEditMode.set(true);
    this.activeUser = { 
      ...user, 
      password: '' // Keep empty unless editing password
    };
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

  hasRole(roleName: string): boolean {
    return this.activeUser.roles.includes(roleName);
  }

  toggleRoleAssignment(roleName: string): void {
    const index = this.activeUser.roles.indexOf(roleName);
    if (index > -1) {
      this.activeUser.roles.splice(index, 1);
    } else {
      this.activeUser.roles.push(roleName);
    }
  }

  saveUsuario(): void {
    if (this.isEditMode()) {
      this.dataService.updateUsuario(this.activeUser.idUsuario!, this.activeUser).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadUsuarios();
            this.closeModal();
          }
        }
      });
    } else {
      this.dataService.createUsuario(this.activeUser).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadUsuarios();
            this.closeModal();
          }
        }
      });
    }
  }

  toggleStatus(id: number): void {
    this.openMenuId = null;
    this.dataService.toggleUsuarioEstado(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadUsuarios();
        }
      }
    });
  }

  formatRoleName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'VETERINARIO':
        return 'Veterinario';
      case 'RECEPCIONISTA':
        return 'Recepcionista';
      default:
        return role;
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return 'Nunca';
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
    } catch {
      return dateStr;
    }
  }
}
