import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-lg">
      
      <!-- Page Header -->
      <div>
        <h2 class="text-headline-lg font-headline-lg text-on-surface font-bold">Mi Perfil</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">Gestione sus datos de acceso y visualice sus roles asignados.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-lg items-start">
        
        <!-- Left Card (Profile Summary) -->
        <div class="card flex flex-col items-center text-center p-xl gap-md">
          <div class="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-headline-lg border-2 border-outline-variant shadow-md">
            {{ (authService.currentUser()?.username || '').substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <h3 class="font-headline-md text-headline-md font-bold text-on-surface">{{ authService.currentUser()?.username }}</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant">{{ authService.currentUser()?.email }}</p>
          </div>
          <div class="w-full border-t border-outline-variant/30 my-xs"></div>
          <div class="w-full text-left flex flex-col gap-sm">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Roles Asignados</span>
            <div class="flex flex-wrap gap-xs">
              <span 
                *ngFor="let role of authService.currentUser()?.roles" 
                class="px-2.5 py-1 rounded bg-surface-container border border-outline-variant text-[11px] font-bold text-primary">
                {{ role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Card (Settings/Form) -->
        <div class="card md:col-span-2 flex flex-col gap-md">
          <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface border-b border-outline-variant/30 pb-sm mb-xs">Ajustes de Cuenta</h3>
          
          <form (ngSubmit)="updateProfile()" #profileForm="ngForm" class="flex flex-col gap-md">
            
            <div class="form-group">
              <label for="username">Nombre de Usuario</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                [ngModel]="authService.currentUser()?.username" 
                disabled 
                class="form-control opacity-60 cursor-not-allowed">
              <p class="text-[10px] text-on-surface-variant mt-0.5">El nombre de usuario es gestionado por el Administrador del sistema.</p>
            </div>

            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                [ngModel]="authService.currentUser()?.email" 
                disabled 
                class="form-control opacity-60 cursor-not-allowed">
            </div>

            <div class="w-full border-t border-outline-variant/30 my-sm"></div>

            <h4 class="font-headline-sm text-base font-bold text-on-surface">Cambiar Contraseña</h4>
            
            <div class="grid-2">
              <div class="form-group">
                <label for="newPass">Nueva Contraseña</label>
                <input 
                  type="password" 
                  id="newPass" 
                  name="newPassword" 
                  [(ngModel)]="newPassword" 
                  required
                  placeholder="******" 
                  class="form-control">
              </div>

              <div class="form-group">
                <label for="confirmPass">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  id="confirmPass" 
                  name="confirmPassword" 
                  [(ngModel)]="confirmPassword" 
                  required
                  placeholder="******" 
                  class="form-control">
              </div>
            </div>

            <div class="flex justify-end gap-sm border-t border-outline-variant/30 pt-md mt-sm">
              <button 
                type="submit" 
                [disabled]="!profileForm.valid || newPassword() !== confirmPassword() || newPassword() === ''"
                class="btn btn-primary">
                Actualizar Contraseña
              </button>
            </div>
            
            <div *ngIf="successMessage()" class="p-sm bg-secondary-container/20 text-accent-success border border-accent-success/30 rounded-lg text-body-sm font-semibold">
              {{ successMessage() }}
            </div>
            <div *ngIf="newPassword() !== confirmPassword() && confirmPassword() !== ''" class="p-sm bg-error-container/20 text-accent-error border border-accent-error/30 rounded-lg text-body-sm">
              Las contraseñas nuevas no coinciden.
            </div>

          </form>
        </div>

      </div>

    </div>
  `
})
export class MiPerfilComponent {
  authService = inject(AuthService);

  newPassword = signal<string>('');
  confirmPassword = signal<string>('');
  successMessage = signal<string>('');

  updateProfile(): void {
    if (this.newPassword() === this.confirmPassword()) {
      this.successMessage.set('Contraseña actualizada exitosamente (simulado).');
      this.newPassword.set('');
      this.confirmPassword.set('');
      
      setTimeout(() => {
        this.successMessage.set('');
      }, 4000);
    }
  }
}
