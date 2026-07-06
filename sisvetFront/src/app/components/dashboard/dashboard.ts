import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService, DashboardData, Cita, MascotaVacuna } from '../../services/data';
import { AuthService } from '../../services/auth';

declare var gsap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col gap-xl">
      
      <!-- Welcome Header Banner -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-surface-tint p-8 text-on-primary shadow-md border border-primary/20 animate-slideIn">
        <!-- Abstract background shapes for visual flair -->
        <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        <div class="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-primary-fixed-dim/20 blur-3xl"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex flex-col gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white w-fit backdrop-blur-md">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
              Clínica Veterinaria VetCare
            </span>
            <h2 class="font-headline-lg text-headline-lg font-bold text-white tracking-tight leading-none mt-1">
              {{ greeting }}, {{ authService.currentUser()?.username || 'Personal' }} 👋
            </h2>
            <p class="font-body-md text-body-md text-primary-fixed/85 max-w-xl" *ngIf="authService.isAdmin()">
              Aquí tienes el resumen ejecutivo y los indicadores de rendimiento de la clínica veterinaria para hoy.
            </p>
            <p class="font-body-md text-body-md text-primary-fixed/85 max-w-xl" *ngIf="authService.isRecepcionista()">
              Aquí tienes tu panel de control de citas, admisiones y agenda diaria de la clínica.
            </p>
            <p class="font-body-md text-body-md text-primary-fixed/85 max-w-xl" *ngIf="authService.isVeterinario()">
              Aquí tienes tu agenda de atenciones médicas, pacientes asignados y control de vacunas para hoy.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              (click)="refreshData()" 
              class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-label-md font-label-md transition-all border border-white/20 shadow-sm backdrop-blur-md cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">sync</span>
              Actualizar
            </button>
            <a 
              *ngIf="!authService.isVeterinario()"
              routerLink="/citas" 
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary hover:bg-primary-fixed-dim hover:text-on-primary-fixed-variant rounded-lg text-label-md font-label-md transition-all duration-300 font-semibold shadow-md cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">add</span>
              Nueva Cita
            </a>
            <a 
              *ngIf="authService.isVeterinario()"
              routerLink="/citas" 
              class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary hover:bg-primary-fixed-dim hover:text-on-primary-fixed-variant rounded-lg text-label-md font-label-md transition-all duration-300 font-semibold shadow-md cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">calendar_today</span>
              Ver Mi Agenda
            </a>
          </div>
        </div>
      </div>

      <!-- Stats Grid for Administrator / Veterinario -->
      <div *ngIf="!authService.isRecepcionista() && statsSignal() as stats" 
           class="grid grid-cols-1 sm:grid-cols-2 gap-gutter animate-fadeIn"
           [ngClass]="authService.isAdmin() ? 'lg:grid-cols-4' : 'lg:grid-cols-2'">
        
        <!-- Clients Card (Common) -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-primary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,40,150,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Clientes Registrados</span>
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ stats.totalClientes }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">trending_up</span>
              <span class="text-secondary font-semibold">Clientes activos</span> en el sistema
            </p>
          </div>
        </div>

        <!-- Pets Card (Common) -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-secondary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,100,50,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Pacientes (Mascotas)</span>
            <div class="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">pets</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ stats.totalMascotas }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
              <span class="font-semibold">Historiales médicos</span> activos
            </p>
          </div>
        </div>

        <!-- Veterinarians Card (Admin only) -->
        <div *ngIf="authService.isAdmin()" class="stat-card group bg-surface border border-outline-variant hover:border-tertiary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(150,50,0,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-tertiary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Staff Médico</span>
            <div class="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">medical_services</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ stats.totalVeterinarios }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-primary text-[14px]">shield</span>
              Médicos colegiados activos
            </p>
          </div>
        </div>

        <!-- Revenue Card (Admin only) -->
        <div *ngIf="authService.isAdmin()" class="stat-card group bg-surface border border-outline-variant hover:border-primary-container/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(100,50,200,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-primary-container rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Facturación Mensual</span>
            <div class="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">S/ {{ stats.ingresosTotales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">show_chart</span>
              <span class="text-secondary font-semibold">Ingresos registrados</span> por servicios
            </p>
          </div>
        </div>

      </div>

      <!-- Stats Grid for Recepcionista -->
      <div *ngIf="authService.isRecepcionista()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter animate-fadeIn">
        
        <!-- Citas del día -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-primary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Citas del Día</span>
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">today</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ citasDelDiaCount() }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">event</span>
              Citas agendadas para hoy
            </p>
          </div>
        </div>

        <!-- Próximas citas -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-secondary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Próximas Citas</span>
            <div class="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">next_week</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ proximasCitasCount() }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">calendar_month</span>
              Citas programadas a futuro
            </p>
          </div>
        </div>

        <!-- Mascotas registradas hoy -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-tertiary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-tertiary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Mascotas Registradas Hoy</span>
            <div class="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">pets</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ mascotasHoyCount() }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-primary text-[14px]">add_circle</span>
              Nuevos pacientes ingresados hoy
            </p>
          </div>
        </div>

        <!-- Clientes registrados hoy -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-primary-container/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-primary-container rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Clientes Registrados Hoy</span>
            <div class="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">person_add</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ clientesHoyCount() }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">groups_3</span>
              Nuevos propietarios registrados
            </p>
          </div>
        </div>

        <!-- Vacunas próximas a vencer -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-error/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-error rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Vacunas Próximas a Vencer</span>
            <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">vaccines</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ vacunasProximasCount() }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-[14px]">warning</span>
              Próximas dosis (en 15 días)
            </p>
          </div>
        </div>

        <!-- Notificaciones -->
        <div class="stat-card group bg-surface border border-outline-variant hover:border-primary/45 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-2xl"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Notificaciones Activas</span>
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined">notifications_active</span>
            </div>
          </div>
          <div>
            <h3 class="font-headline-lg text-[32px] font-bold text-on-surface leading-none mb-1 tracking-tight">{{ unreadNotificationsCount() }}</h3>
            <p class="text-[12px] text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-primary text-[14px]">mark_chat_unread</span>
              Mensajes sin leer en buzón
            </p>
          </div>
        </div>

      </div>

      <!-- Quick Actions Grid for Receptionist -->
      <div *ngIf="authService.isRecepcionista()" class="recepcionista-actions bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-0.5">Operaciones de Recepción</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Accesos rápidos para atención al cliente y registro diario</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a 
            routerLink="/clientes" 
            class="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/45 rounded-xl transition-all duration-350 group cursor-pointer hover:shadow-md">
            <div class="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
              <span class="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-primary transition-colors">Registrar Cliente</h4>
              <p class="text-[11px] text-on-surface-variant mt-0.5">Alta de dueños de mascota</p>
            </div>
          </a>
          
          <a 
            routerLink="/mascotas" 
            class="flex items-center gap-3 p-4 bg-secondary-container/10 hover:bg-secondary-container/20 border border-secondary/20 hover:border-secondary/45 rounded-xl transition-all duration-350 group cursor-pointer hover:shadow-md">
            <div class="w-10 h-10 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-lg shrink-0">
              <span class="material-symbols-outlined">pets</span>
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-secondary transition-colors">Registrar Mascota</h4>
              <p class="text-[11px] text-on-surface-variant mt-0.5">Alta de pacientes clínicos</p>
            </div>
          </a>

          <a 
            routerLink="/citas" 
            class="flex items-center gap-3 p-4 bg-tertiary-fixed hover:bg-tertiary-fixed/15 border border-tertiary/20 hover:border-tertiary/45 rounded-xl transition-all duration-350 group cursor-pointer hover:shadow-md">
            <div class="w-10 h-10 rounded-lg bg-tertiary text-white flex items-center justify-center font-bold text-lg shrink-0">
              <span class="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <h4 class="font-bold text-sm text-white group-hover:text-tertiary transition-colors">Agendar Cita</h4>
              <p class="text-[11px] text-on-surface-variant mt-0.5">Reservar turnos y médicos</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Sections Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        
        <!-- Column 1 -->
        <div class="flex flex-col gap-gutter">
          <!-- Status Breakdown -->
          <div *ngIf="statsSignal() as stats" class="card-element bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-300">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-0.5">Distribución de Citas</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Análisis de citas registradas en el sistema</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-surface-container border border-outline-variant text-on-surface-variant">
                Total: {{ appointmentPercentages().total }}
              </span>
            </div>
            
            <div class="flex flex-col gap-5">
              <!-- Programadas -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between text-body-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
                    <span class="font-semibold text-on-surface">Programadas / Reprogramadas</span>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-on-surface">{{ stats.citasProgramadas }}</span>
                    <span class="text-[12px] text-on-surface-variant ml-1.5">({{ appointmentPercentages().programadas }}%)</span>
                  </div>
                </div>
                <div class="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-outline-variant/30">
                  <div 
                    class="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                    [style.width.%]="appointmentPercentages().programadas">
                  </div>
                </div>
              </div>

              <!-- Atendidas -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between text-body-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-secondary"></span>
                    <span class="font-semibold text-on-surface">Atendidas con éxito</span>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-on-surface">{{ stats.citasAtendidas }}</span>
                    <span class="text-[12px] text-on-surface-variant ml-1.5">({{ appointmentPercentages().atendidas }}%)</span>
                  </div>
                </div>
                <div class="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-outline-variant/30">
                  <div 
                    class="h-full bg-secondary rounded-full transition-all duration-1000 ease-out" 
                    [style.width.%]="appointmentPercentages().atendidas">
                  </div>
                </div>
              </div>

              <!-- Canceladas -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between text-body-sm">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-error"></span>
                    <span class="font-semibold text-on-surface">Canceladas / Ausentes</span>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-on-surface">{{ stats.citasCanceladas }}</span>
                    <span class="text-[12px] text-on-surface-variant ml-1.5">({{ appointmentPercentages().canceladas }}%)</span>
                  </div>
                </div>
                <div class="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-outline-variant/30">
                  <div 
                    class="h-full bg-error rounded-full transition-all duration-1000 ease-out" 
                    [style.width.%]="appointmentPercentages().canceladas">
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats summary cards inside breakdown -->
            <div class="grid grid-cols-3 gap-3 mt-2">
              <div class="bg-surface-container border border-outline-variant/40 rounded-xl p-3 text-center">
                <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">Completado</p>
                <h4 class="text-headline-sm font-bold text-secondary">{{ appointmentPercentages().atendidas }}%</h4>
              </div>
              <div class="bg-surface-container border border-outline-variant/40 rounded-xl p-3 text-center">
                <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">Pendiente</p>
                <h4 class="text-headline-sm font-bold text-primary">{{ appointmentPercentages().programadas }}%</h4>
              </div>
              <div class="bg-surface-container border border-outline-variant/40 rounded-xl p-3 text-center">
                <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">Cancelación</p>
                <h4 class="text-headline-sm font-bold text-error">{{ appointmentPercentages().canceladas }}%</h4>
              </div>
            </div>
          </div>

          <!-- Control de Vacunas (Vacunas Próximas a Vencer) -->
          <div class="card-element bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-300">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-0.5">Control de Vacunas Próximas</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Inmunizaciones agendadas para los próximos 15 días</p>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-secondary/10 border border-secondary/20 text-secondary">
                {{ upcomingVacunas().length }} Próximas
              </span>
            </div>

            <div class="flex flex-col gap-sm max-h-[350px] overflow-y-auto pr-1">
              <div 
                *ngFor="let item of upcomingVacunas()" 
                class="flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-low transition-all duration-200 rounded-xl border border-outline-variant/50 relative group">
                
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined">vaccines</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-body-sm text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2 truncate">
                      {{ item.nombreMascota }}
                    </h4>
                    <p class="text-[12px] text-on-surface-variant font-medium mt-0.5 truncate">
                      Vacuna: <span class="text-secondary font-semibold">{{ item.nombreVacuna }}</span> • Lote: {{ item.lote || '-' }}
                    </p>
                  </div>
                </div>

                <div class="text-right flex flex-col items-end shrink-0 justify-between h-full min-h-[40px]">
                  <p class="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1 mb-1.5">
                    <span class="material-symbols-outlined text-[14px]">event_repeat</span>
                    Dosis: {{ formatVaccineDate(item.proximaDosis) }}
                  </p>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20">
                    <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                    Por Vencer
                  </span>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="upcomingVacunas().length === 0" class="text-center py-xl text-on-surface-variant flex flex-col items-center gap-2">
                <span class="material-symbols-outlined text-[40px] text-outline-variant">check_circle</span>
                <span class="italic text-body-sm">No hay vacunas por vencer en los próximos 15 días.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2 -->
        <div class="flex flex-col gap-gutter">
          <!-- Recent Activities list -->
          <div class="card-element bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-300">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-0.5">Atenciones Recientes</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Últimos movimientos del consultorio médico</p>
              </div>
              <a 
                routerLink="/citas" 
                class="text-body-sm text-primary hover:text-primary-container font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                Ver todas
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            <div class="flex flex-col relative pl-6 border-l border-outline-variant/65 gap-6 max-h-[350px] overflow-y-auto pr-1">
              
              <!-- Timeline Item -->
              <div 
                *ngFor="let cita of recentCitas(); let idx = index" 
                class="timeline-item flex items-start justify-between p-4 bg-surface-container hover:bg-surface-container-low transition-all duration-200 rounded-xl border border-outline-variant/50 relative group">
                
                <!-- Timeline node dot -->
                <span class="absolute -left-[31.5px] top-[22px] w-3 h-3 rounded-full border-2 border-surface bg-primary shadow-sm z-10 group-hover:scale-125 transition-transform duration-200"
                  [ngClass]="{
                    'bg-secondary': cita.estadoCita === 'ATENDIDA',
                    'bg-primary': cita.estadoCita === 'PROGRAMADA' || cita.estadoCita === 'REPROGRAMADA',
                    'bg-error': cita.estadoCita === 'CANCELADA'
                  }">
                </span>

                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {{ (cita.nombreMascota || '').substring(0, 2) }}
                  </div>
                  <div>
                    <h4 class="font-body-sm text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                      {{ cita.nombreMascota }}
                    </h4>
                    <p class="text-[12px] text-on-surface-variant font-medium mt-0.5">
                      Dr(a). {{ cita.nombreVeterinario }} • <span class="text-primary font-semibold">{{ cita.nombreServicio }}</span>
                    </p>
                  </div>
                </div>

                <div class="text-right flex flex-col items-end justify-between h-full min-h-[40px]">
                  <p class="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1 mb-1.5">
                    <span class="material-symbols-outlined text-[14px]">schedule</span>
                    {{ formatDate(cita.fechaHora) }}
                  </p>
                  <div class="flex flex-col items-end gap-1.5">
                    <span 
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                      [ngClass]="getStatusClass(cita.estadoCita)">
                      <span class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="{
                          'bg-secondary': cita.estadoCita === 'ATENDIDA',
                          'bg-primary': cita.estadoCita === 'PROGRAMADA' || cita.estadoCita === 'REPROGRAMADA',
                          'bg-error': cita.estadoCita === 'CANCELADA'
                        }"></span>
                      {{ cita.estadoCita }}
                    </span>

                    <!-- Quick actions for Vet / Admin -->
                    <div 
                      *ngIf="(authService.isVeterinario() || authService.isAdmin()) && (cita.estadoCita === 'PROGRAMADA' || cita.estadoCita === 'REPROGRAMADA')"
                      class="flex gap-1 mt-1">
                      <button 
                        (click)="cancelarCita(cita, $event)" 
                        class="px-1.5 py-0.5 bg-surface border border-outline-variant hover:bg-error-container/20 hover:border-error text-error rounded text-[9px] font-bold transition-all flex items-center gap-0.5 cursor-pointer" 
                        title="Cancelar cita">
                        <span class="material-symbols-outlined text-[11px]">close</span>
                      </button>
                      <button 
                        (click)="marcarAtendida(cita, $event)" 
                        class="px-2 py-0.5 bg-primary text-on-primary hover:bg-surface-tint rounded text-[9px] font-bold transition-all flex items-center gap-0.5 shadow-xs hover:scale-[1.02] cursor-pointer" 
                        title="Atender cita">
                        <span class="material-symbols-outlined text-[11px]">check</span>
                        Atender
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Empty State -->
              <div *ngIf="recentCitas().length === 0" class="text-center py-xl text-on-surface-variant flex flex-col items-center gap-2">
                <span class="material-symbols-outlined text-[40px] text-outline-variant">calendar_today</span>
                <span class="italic text-body-sm">No hay citas recientes registradas.</span>
              </div>

            </div>
          </div>

          <!-- Recent Notifications list (Recepcionista only) -->
          <div *ngIf="authService.isRecepcionista()" class="card-element bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-300">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-0.5">Buzón de Notificaciones</h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Alertas y recordatorios operacionales recientes</p>
              </div>
              <a 
                routerLink="/notificaciones" 
                class="text-body-sm text-primary hover:text-primary-container font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                Ver todas
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            <div class="flex flex-col gap-sm max-h-[350px] overflow-y-auto pr-1">
              <div 
                *ngFor="let item of dashboardNotifications(); let idx = index" 
                [class.bg-surface-container]="item.leido"
                [class.bg-primary/5]="!item.leido"
                class="flex items-start justify-between p-md rounded-xl border border-outline-variant/65 relative overflow-hidden transition-all hover:bg-surface-container-high/30">
                
                <div class="flex gap-md">
                  <span 
                    [ngClass]="{
                      'text-amber-500': item.tipo === 'vacuna',
                      'text-blue-500': item.tipo === 'cita',
                      'text-emerald-500': item.tipo === 'mascota',
                      'text-purple-500': item.tipo === 'general'
                    }"
                    class="material-symbols-outlined shrink-0 mt-0.5">
                    {{ item.tipo === 'vacuna' ? 'vaccines' : item.tipo === 'cita' ? 'calendar_today' : item.tipo === 'mascota' ? 'pets' : 'notifications' }}
                  </span>
                  <div class="flex flex-col gap-1">
                    <h4 class="font-bold text-xs text-on-surface flex items-center gap-xs">
                      {{ item.titulo }}
                      <span *ngIf="!item.leido" class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                    </h4>
                    <p class="text-[11px] text-on-surface-variant leading-relaxed">{{ item.mensaje }}</p>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="dashboardNotifications().length === 0" class="text-center py-xl text-on-surface-variant flex flex-col items-center gap-2">
                <span class="material-symbols-outlined text-[40px] text-outline-variant">notifications_off</span>
                <span class="italic text-body-sm">No hay notificaciones activas.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    /* Custom scrollbar for timelines */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #e0e3e5;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #c3c6d7;
    }
    .animate-slideIn {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  statsSignal = signal<DashboardData | null>(null);
  recentCitas = signal<Cita[]>([]);
  appointmentPercentages = signal<{ programadas: number, atendidas: number, canceladas: number, total: number }>({ programadas: 0, atendidas: 0, canceladas: 0, total: 0 });

  // Receptionist dynamic metrics signals
  citasDelDiaCount = signal<number>(0);
  proximasCitasCount = signal<number>(0);
  mascotasHoyCount = signal<number>(0);
  clientesHoyCount = signal<number>(0);
  vacunasProximasCount = signal<number>(0);
  unreadNotificationsCount = signal<number>(0);
  dashboardNotifications = signal<any[]>([]);
  upcomingVacunas = signal<any[]>([]);

  greeting = 'Bienvenido';

  constructor(
    private dataService: DataService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadDashboardData();
    this.loadRecentAppointments();
    this.loadUpcomingVacunas();
    if (this.authService.isRecepcionista()) {
      this.loadReceptionistStats();
    }
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Buenos días';
    } else if (hour < 19) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }

  animateDashboard(): void {
    setTimeout(() => {
      if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        
        // Welcome banner fade-in
        tl.fromTo('.relative.overflow-hidden.rounded-2xl', 
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );

        // Stats cards stagger entrance
        tl.fromTo('.stat-card', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
          '-=0.3'
        );

        // Main panels slide-up
        tl.fromTo('.card-element', 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.2'
        );

        // Timeline items sweep in from left
        tl.fromTo('.timeline-item', 
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
          '-=0.2'
        );
      }
    }, 100);
  }

  loadDashboardData(): void {
    this.dataService.getDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.statsSignal.set(res.data);
          
          // Calculate percentages
          const total = res.data.citasProgramadas + res.data.citasAtendidas + res.data.citasCanceladas;
          const programadas = total > 0 ? Math.round((res.data.citasProgramadas / total) * 100) : 0;
          const atendidas = total > 0 ? Math.round((res.data.citasAtendidas / total) * 100) : 0;
          const canceladas = total > 0 ? Math.round((res.data.citasCanceladas / total) * 100) : 0;

          this.appointmentPercentages.set({
            programadas,
            atendidas,
            canceladas,
            total
          });
          
          this.animateDashboard();
        }
      }
    });
  }

  loadRecentAppointments(): void {
    this.dataService.getCitas(0, 5).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          this.recentCitas.set(res.data.content);
        }
      }
    });
  }

  loadUpcomingVacunas(): void {
    this.dataService.getMascotaVacunas(0, 100).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          const list = res.data.content;
          const today = new Date();
          today.setHours(0,0,0,0);
          const limit = new Date();
          limit.setDate(today.getDate() + 15); // next 15 days
          
          const filtered = list.filter(mv => {
            if (!mv.proximaDosis) return false;
            const nextDate = new Date(mv.proximaDosis);
            nextDate.setHours(0,0,0,0);
            return nextDate >= today && nextDate <= limit;
          }).sort((a, b) => new Date(a.proximaDosis!).getTime() - new Date(b.proximaDosis!).getTime())
            .slice(0, 5); // top 5
          
          this.upcomingVacunas.set(filtered);
        }
      }
    });
  }

  loadReceptionistStats(): void {
    const todayStr = new Date().toDateString();
    
    // Citas Del Dia & Proximas
    this.dataService.getCitas(0, 100).subscribe(res => {
      if (res.success && res.data && res.data.content) {
        const list = res.data.content;
        
        const todayCount = list.filter(c => {
          if (!c.fechaHora) return false;
          const d = new Date(c.fechaHora);
          return d.toDateString() === todayStr;
        }).length;
        this.citasDelDiaCount.set(todayCount);

        const futureCount = list.filter(c => {
          if (!c.fechaHora) return false;
          const d = new Date(c.fechaHora);
          return d > new Date() && d.toDateString() !== todayStr;
        }).length;
        this.proximasCitasCount.set(futureCount);
      }
    });

    // Mascotas
    this.dataService.getMascotas(0, 100).subscribe(res => {
      if (res.success && res.data && res.data.content) {
        const list = res.data.content;
        const count = list.filter(m => {
          const regDateStr = (m as any).fechaRegistro;
          if (!regDateStr) return false;
          return new Date(regDateStr).toDateString() === todayStr;
        }).length;
        this.mascotasHoyCount.set(count);
      }
    });

    // Clientes
    this.dataService.getClientes(0, 100).subscribe(res => {
      if (res.success && res.data && res.data.content) {
        const list = res.data.content;
        const count = list.filter(c => {
          const regDateStr = c.fechaRegistro;
          if (!regDateStr) return false;
          return new Date(regDateStr).toDateString() === todayStr;
        }).length;
        this.clientesHoyCount.set(count);
      }
    });

    // Vacunas proximas metric
    this.dataService.getMascotaVacunas(0, 100).subscribe(res => {
      if (res.success && res.data && res.data.content) {
        const list = res.data.content;
        const count = list.filter(mv => {
          if (!mv.proximaDosis) return false;
          const proximaDate = new Date(mv.proximaDosis);
          const diffTime = proximaDate.getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 15;
        }).length;
        this.vacunasProximasCount.set(count);
      }
    });

    // Notifications
    const saved = localStorage.getItem('sisvet_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const count = parsed.filter((n: any) => !n.leido).length;
        this.unreadNotificationsCount.set(count);
        this.dashboardNotifications.set(parsed.slice(0, 4)); // show top 4
      } catch (e) {
        this.unreadNotificationsCount.set(0);
        this.dashboardNotifications.set([]);
      }
    } else {
      this.unreadNotificationsCount.set(3); // default mock count
      this.dashboardNotifications.set([
        {
          id: 'init-1',
          titulo: 'Vacuna próxima a vencer',
          mensaje: 'La mascota "Rocky" tiene programada la próxima dosis de la vacuna "Triple Canina" para el 10/06/2026.',
          tipo: 'vacuna',
          leido: false
        },
        {
          id: 'init-2',
          titulo: 'Cita programada para mañana',
          mensaje: 'Cita médica de la mascota "Luna" programada para mañana a las 10:00 AM con el Dr. Carlos Mendoza.',
          tipo: 'cita',
          leido: false
        },
        {
          id: 'init-3',
          titulo: 'Nueva mascota registrada',
          mensaje: 'Se ha registrado exitosamente a la mascota "Coco" (Raza: Poodle). Propietario: Ana Gómez.',
          tipo: 'mascota',
          leido: false
        }
      ]);
    }
  }

  refreshData(): void {
    this.loadDashboardData();
    this.loadRecentAppointments();
    this.loadUpcomingVacunas();
    if (this.authService.isRecepcionista()) {
      this.loadReceptionistStats();
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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

  getStatusClass(status?: string): string {
    switch (status) {
      case 'ATENDIDA':
        return 'bg-secondary-container text-on-secondary-container border-secondary/20';
      case 'PROGRAMADA':
      case 'REPROGRAMADA':
        return 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20';
      case 'CANCELADA':
        return 'bg-error-container text-on-error-container border-error/20';
      default:
        return 'bg-surface text-on-surface border-outline-variant';
    }
  }

  marcarAtendida(cita: Cita, event: Event): void {
    event.stopPropagation();
    if (confirm(`¿Marcar la cita de ${cita.nombreMascota} como ATENDIDA?`)) {
      this.dataService.changeCitaEstado(cita.idCita!, 2, 'Atendido desde el dashboard de veterinario.').subscribe({
        next: (res) => {
          if (res.success) {
            this.refreshData();
          } else {
            alert('Error al actualizar el estado: ' + res.message);
          }
        },
        error: (err) => {
          alert('Error al conectar con el servidor.');
        }
      });
    }
  }

  cancelarCita(cita: Cita, event: Event): void {
    event.stopPropagation();
    const motivo = prompt(`¿Desea cancelar la cita de ${cita.nombreMascota}? Ingrese el motivo de cancelación:`);
    if (motivo !== null) {
      this.dataService.changeCitaEstado(cita.idCita!, 3, motivo || 'Cancelado desde el dashboard.').subscribe({
        next: (res) => {
          if (res.success) {
            this.refreshData();
          } else {
            alert('Error al cancelar la cita: ' + res.message);
          }
        },
        error: (err) => {
          alert('Error al conectar con el servidor.');
        }
      });
    }
  }
}
