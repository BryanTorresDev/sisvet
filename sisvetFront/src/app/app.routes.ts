import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ClientesComponent } from './components/clientes/clientes';
import { MascotasComponent } from './components/mascotas/mascotas';
import { CitasComponent } from './components/citas/citas';
import { VeterinariosComponent } from './components/veterinarios/veterinarios';
import { PagosComponent } from './components/pagos/pagos';
import { HistorialClinicoComponent } from './components/historial-clinico/historial-clinico';
import { VacunasComponent } from './components/vacunas/vacunas';
import { UsuariosComponent } from './components/usuarios/usuarios';
import { LandingComponent } from './components/landing/landing';
import { NotificacionesComponent } from './components/notificaciones/notificaciones';
import { ReportesComponent } from './components/reportes/reportes';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil';
import { AuditoriaComponent } from './components/auditoria/auditoria';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'mascotas', component: MascotasComponent, canActivate: [authGuard] },
  { path: 'historial-clinico/:id', component: HistorialClinicoComponent, canActivate: [authGuard] },
  { path: 'historial-clinico', component: HistorialClinicoComponent, canActivate: [authGuard] },
  { path: 'citas', component: CitasComponent, canActivate: [authGuard] },
  { path: 'vacunas', component: VacunasComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'veterinarios', component: VeterinariosComponent, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] } },
  { path: 'pagos', component: PagosComponent, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] } },
  { path: 'notificaciones', component: NotificacionesComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: 'mi-perfil', component: MiPerfilComponent, canActivate: [authGuard] },
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

