import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Cita, Mascota, MascotaVacuna } from '../../services/data';

export interface NotificationItem {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'vacuna' | 'cita' | 'mascota' | 'general';
  fecha: Date;
  leido: boolean;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-lg">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-md">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface font-bold">Notificaciones</h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-1">Alertas operativas de vacunas próximas, citas programadas y nuevos registros.</p>
        </div>
        <div class="flex items-center gap-sm">
          <button 
            (click)="markAllAsRead()" 
            [disabled]="unreadCount() === 0"
            class="px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:border-primary/45 rounded-lg text-label-md font-label-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <!-- Tabs and Filter controls -->
      <div class="flex justify-between items-center border-b border-outline-variant pb-xs">
        <div class="flex gap-md font-label-md text-label-md">
          <button 
            (click)="setFilter('todas')" 
            [class.border-primary]="filter() === 'todas'"
            [class.text-primary]="filter() === 'todas'"
            class="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-semibold">
            Todas ({{ notifications().length }})
          </button>
          <button 
            (click)="setFilter('noLeidas')" 
            [class.border-primary]="filter() === 'noLeidas'"
            [class.text-primary]="filter() === 'noLeidas'"
            class="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-semibold">
            No Leídas ({{ unreadCount() }})
          </button>
          <button 
            (click)="setFilter('leidas')" 
            [class.border-primary]="filter() === 'leidas'"
            [class.text-primary]="filter() === 'leidas'"
            class="px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-semibold">
            Leídas ({{ notifications().length - unreadCount() }})
          </button>
        </div>
        <span class="text-body-sm text-on-surface-variant">Actualizado hace unos momentos</span>
      </div>

      <!-- Notifications List -->
      <div class="flex flex-col gap-sm">
        <div 
          *ngFor="let item of filteredNotifications()" 
          [class.bg-surface-container]="item.leido"
          [class.bg-primary/5]="!item.leido"
          [class.border-primary/30]="!item.leido"
          class="group flex items-start justify-between p-lg rounded-xl border border-outline-variant transition-all hover:shadow-md relative overflow-hidden">
          
          <!-- Indication line for unread status -->
          <div *ngIf="!item.leido" class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          
          <div class="flex gap-md">
            <div 
              [ngClass]="{
                'bg-amber-500/10 text-amber-500 border-amber-500/25': item.tipo === 'vacuna',
                'bg-blue-500/10 text-blue-500 border-blue-500/25': item.tipo === 'cita',
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/25': item.tipo === 'mascota',
                'bg-purple-500/10 text-purple-500 border-purple-500/25': item.tipo === 'general'
              }"
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border">
              <span class="material-symbols-outlined text-[20px]" *ngIf="item.tipo === 'vacuna'">vaccines</span>
              <span class="material-symbols-outlined text-[20px]" *ngIf="item.tipo === 'cita'">calendar_today</span>
              <span class="material-symbols-outlined text-[20px]" *ngIf="item.tipo === 'mascota'">pets</span>
              <span class="material-symbols-outlined text-[20px]" *ngIf="item.tipo === 'general'">notifications</span>
            </div>
            
            <div class="flex flex-col gap-xs">
              <div class="flex items-center gap-xs">
                <h4 class="font-headline-sm text-sm font-bold text-on-surface">{{ item.titulo }}</h4>
                <span *ngIf="!item.leido" class="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant pr-md">{{ item.mensaje }}</p>
              <span class="text-[11px] text-on-surface-variant font-semibold mt-1">
                {{ formatRelativeTime(item.fecha) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              *ngIf="!item.leido"
              (click)="markAsRead(item.id)" 
              class="px-3 py-1 bg-surface border border-outline-variant hover:border-primary hover:text-primary rounded text-[11px] font-bold transition-all whitespace-nowrap">
              Marcar Leída
            </button>
            <button 
              (click)="deleteNotification(item.id)" 
              class="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-1.5 rounded-full transition-all shrink-0">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
          
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredNotifications().length === 0" class="text-center py-xl text-on-surface-variant flex flex-col items-center gap-2 border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest/50">
          <span class="material-symbols-outlined text-[48px] text-outline-variant">notifications_off</span>
          <h4 class="font-bold text-on-surface text-base">Sin notificaciones</h4>
          <p class="text-body-sm text-on-surface-variant max-w-xs">No hay alertas en este momento para la categoría seleccionada.</p>
        </div>
      </div>

    </div>
  `
})
export class NotificacionesComponent implements OnInit {
  private dataService = inject(DataService);

  notifications = signal<NotificationItem[]>([]);
  filter = signal<'todas' | 'noLeidas' | 'leidas'>('todas');
  
  unreadCount = signal(0);
  filteredNotifications = signal<NotificationItem[]>([]);

  ngOnInit(): void {
    this.loadAndGenerateNotifications();
  }

  loadAndGenerateNotifications(): void {
    const saved = localStorage.getItem('sisvet_notifications');
    let loadedItems: NotificationItem[] = [];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadedItems = parsed.map((n: any) => ({
          ...n,
          fecha: new Date(n.fecha)
        }));
      } catch (e) {
        loadedItems = [];
      }
    }

    // Generate dynamic notifications based on live data
    // Fetch appointments
    this.dataService.getCitas(0, 50).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          const citas = res.data.content;
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          citas.forEach(cita => {
            if (!cita.fechaHora) return;
            const citaDate = new Date(cita.fechaHora);
            
            // If appointment is tomorrow
            if (citaDate.toDateString() === tomorrow.toDateString()) {
              const id = `cita-tom-${cita.idCita}`;
              if (!loadedItems.some(n => n.id === id)) {
                loadedItems.push({
                  id,
                  titulo: 'Cita programada para mañana',
                  mensaje: `Cita médica de la mascota "${cita.nombreMascota}" programada para mañana con el Veterinario Dr(a). ${cita.nombreVeterinario}. Servicio: ${cita.nombreServicio}.`,
                  tipo: 'cita',
                  fecha: new Date(),
                  leido: false
                });
              }
            }
          });
          this.updateState(loadedItems);
        }
      }
    });

    // Fetch applied vaccines (mascotas-vacunas)
    this.dataService.getMascotaVacunas(0, 50).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          const mvList = res.data.content;
          const today = new Date();
          
          mvList.forEach(mv => {
            if (!mv.proximaDosis) return;
            const proximaDate = new Date(mv.proximaDosis);
            const diffTime = proximaDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If vaccine next dose is in the next 7 days
            if (diffDays >= 0 && diffDays <= 7) {
              const id = `vacuna-exp-${mv.idMascotaVacuna}`;
              if (!loadedItems.some(n => n.id === id)) {
                loadedItems.push({
                  id,
                  titulo: 'Vacuna próxima a vencer',
                  mensaje: `La mascota "${mv.nombreMascota}" tiene programada la próxima dosis de la vacuna "${mv.nombreVacuna}" para el ${proximaDate.toLocaleDateString('es-PE')}.`,
                  tipo: 'vacuna',
                  fecha: new Date(),
                  leido: false
                });
              }
            }
          });
          this.updateState(loadedItems);
        }
      }
    });

    // Fetch pets (Mascotas) for newly registered today
    this.dataService.getMascotas(0, 50).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.content) {
          const pets = res.data.content;
          const todayStr = new Date().toDateString();

          pets.forEach(pet => {
            // Check if registered today
            // Note: Since we updated the DTO but might have mock date or actual date:
            const regDateStr = (pet as any).fechaRegistro;
            if (regDateStr) {
              const regDate = new Date(regDateStr);
              if (regDate.toDateString() === todayStr) {
                const id = `pet-new-${pet.idMascota}`;
                if (!loadedItems.some(n => n.id === id)) {
                  loadedItems.push({
                    id,
                    titulo: 'Nueva mascota registrada',
                    mensaje: `Se ha registrado exitosamente a la mascota "${pet.nombre}" de raza ${pet.nombreRaza || ''}. Propietario: ${pet.nombreCliente || ''}.`,
                    tipo: 'mascota',
                    fecha: new Date(regDate),
                    leido: false
                  });
                }
              }
            }
          });
          this.updateState(loadedItems);
        }
      }
    });

    // Add some default notifications if empty
    setTimeout(() => {
      if (loadedItems.length === 0) {
        loadedItems = [
          {
            id: 'init-1',
            titulo: 'Vacuna próxima a vencer',
            mensaje: 'La mascota "Rocky" tiene programada la próxima dosis de la vacuna "Triple Canina" para el 10/06/2026.',
            tipo: 'vacuna',
            fecha: new Date(Date.now() - 3600000 * 2), // 2 hours ago
            leido: false
          },
          {
            id: 'init-2',
            titulo: 'Cita programada para mañana',
            mensaje: 'Cita médica de la mascota "Luna" programada para mañana a las 10:00 AM con el Dr. Carlos Mendoza.',
            tipo: 'cita',
            fecha: new Date(Date.now() - 3600000 * 4), // 4 hours ago
            leido: false
          },
          {
            id: 'init-3',
            titulo: 'Nueva mascota registrada',
            mensaje: 'Se ha registrado exitosamente a la mascota "Coco" (Raza: Poodle). Propietario: Ana Gómez.',
            tipo: 'mascota',
            fecha: new Date(Date.now() - 3600000 * 6), // 6 hours ago
            leido: false
          }
        ];
        this.updateState(loadedItems);
      }
    }, 500);

    this.updateState(loadedItems);
  }

  updateState(items: NotificationItem[]): void {
    // Sort by date desc
    items.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    this.notifications.set(items);
    this.saveToStorage();
    this.applyFilter();
  }

  saveToStorage(): void {
    localStorage.setItem('sisvet_notifications', JSON.stringify(this.notifications()));
    // Update unread count
    this.unreadCount.set(this.notifications().filter(n => !n.leido).length);
  }

  setFilter(f: 'todas' | 'noLeidas' | 'leidas'): void {
    this.filter.set(f);
    this.applyFilter();
  }

  applyFilter(): void {
    const f = this.filter();
    const list = this.notifications();
    
    if (f === 'noLeidas') {
      this.filteredNotifications.set(list.filter(n => !n.leido));
    } else if (f === 'leidas') {
      this.filteredNotifications.set(list.filter(n => n.leido));
    } else {
      this.filteredNotifications.set(list);
    }
  }

  markAsRead(id: string): void {
    const list = this.notifications().map(n => {
      if (n.id === id) {
        return { ...n, leido: true };
      }
      return n;
    });
    this.updateState(list);
  }

  markAllAsRead(): void {
    const list = this.notifications().map(n => ({ ...n, leido: true }));
    this.updateState(list);
  }

  deleteNotification(id: string): void {
    const list = this.notifications().filter(n => n.id !== id);
    this.updateState(list);
  }

  formatRelativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    if (hours > 0) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    if (minutes > 0) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    return 'Hace un momento';
  }
}
