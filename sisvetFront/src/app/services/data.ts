import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Cliente {
  idCliente?: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado?: boolean;
  fechaRegistro?: string;
}

export interface Mascota {
  idMascota?: number;
  idCliente: number;
  nombreCliente?: string;
  idRaza: number;
  nombreRaza?: string;
  nombreEspecie?: string;
  nombre: string;
  sexo: string;
  color: string;
  peso: number;
  fechaNacimiento: string;
  observaciones: string;
  estado?: boolean;
  fechaRegistro?: string;
}

export interface Veterinario {
  idVeterinario: number;
  especialidad: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  numeroColegiatura: string;
  direccion: string;
  estado: boolean;
}

export interface Cita {
  idCita?: number;
  idMascota: number;
  nombreMascota?: string;
  idVeterinario: number;
  nombreVeterinario?: string;
  idServicio: number;
  nombreServicio?: string;
  idEstadoCita?: number;
  estadoCita?: string;
  fechaHora: string;
  motivo: string;
  observaciones: string;
}

export interface Pago {
  idPago?: number;
  idCita: number;
  monto: number;
  metodoPago: string;
  fechaPago?: string;
  numeroOperacion: string;
  observaciones: string;
  estado?: string;
}

export interface HistorialClinico {
  idHistorial?: number;
  idMascota: number;
  nombreMascota?: string;
  idVeterinario: number;
  nombreVeterinario?: string;
  idCita?: number;
  fechaAtencion?: string;
  temperatura?: number;
  peso?: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
  estado?: boolean;
  fechaRegistro?: string;
}

export interface MascotaVacuna {
  idMascotaVacuna?: number;
  idMascota: number;
  nombreMascota?: string;
  nombreVacuna: string;
  nombreVeterinario?: string;
  fechaAplicacion: string;
  proximaDosis?: string;
  lote?: string;
  observaciones?: string;
  fechaRegistro?: string;
}

export interface VacunaCatalog {
  idVacuna?: number;
  nombre: string;
  descripcion?: string;
  dosisRecomendada?: string;
  estado?: boolean;
}

export interface Usuario {
  idUsuario?: number;
  username: string;
  password?: string;
  email: string;
  estado?: boolean;
  fechaCreacion?: string;
  ultimoLogin?: string;
  roles: string[];
}

export interface DashboardData {
  totalClientes: number;
  totalMascotas: number;
  totalVeterinarios: number;
  citasProgramadas: number;
  citasAtendidas: number;
  citasCanceladas: number;
  ingresosTotales: number;
}

export interface Especie {
  idEspecie: number;
  nombre: string;
  estado: boolean;
}

export interface Raza {
  idRaza: number;
  idEspecie: number;
  nombre: string;
  estado: boolean;
}

export interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  estado: boolean;
}

export interface TipoDocumento {
  idTipoDocumento: number;
  nombre: string;
  longitud: number;
  estado: boolean;
}

export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  estado?: boolean;
}

export interface LogAuditoria {
  idLog?: number;
  usuario: string;
  modulo: string;
  accion: string;
  descripcion: string;
  ipCliente: string;
  fechaEvento: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.baseUrl}/dashboard`);
  }

  // Clientes
  getClientes(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Cliente>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Cliente>>>(`${this.baseUrl}/clientes`, { params });
  }

  buscarClientes(q: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Cliente>>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Cliente>>>(`${this.baseUrl}/clientes/buscar`, { params });
  }

  createCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${this.baseUrl}/clientes`, cliente);
  }

  updateCliente(id: number, cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/clientes/${id}`);
  }

  getCliente(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.baseUrl}/clientes/${id}`);
  }

  // Mascotas
  getMascotas(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Mascota>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Mascota>>>(`${this.baseUrl}/mascotas`, { params });
  }

  createMascota(mascota: Mascota): Observable<ApiResponse<Mascota>> {
    return this.http.post<ApiResponse<Mascota>>(`${this.baseUrl}/mascotas`, mascota);
  }

  updateMascota(id: number, mascota: Mascota): Observable<ApiResponse<Mascota>> {
    return this.http.put<ApiResponse<Mascota>>(`${this.baseUrl}/mascotas/${id}`, mascota);
  }

  deleteMascota(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/mascotas/${id}`);
  }

  getMascota(id: number): Observable<ApiResponse<Mascota>> {
    return this.http.get<ApiResponse<Mascota>>(`${this.baseUrl}/mascotas/${id}`);
  }

  getVacunasByMascota(idMascota: number, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<MascotaVacuna>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<MascotaVacuna>>>(`${this.baseUrl}/mascotas-vacunas/mascota/${idMascota}`, { params });
  }

  getMascotaVacunas(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<MascotaVacuna>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<MascotaVacuna>>>(`${this.baseUrl}/mascotas-vacunas`, { params });
  }

  createMascotaVacuna(mv: MascotaVacuna): Observable<ApiResponse<MascotaVacuna>> {
    return this.http.post<ApiResponse<MascotaVacuna>>(`${this.baseUrl}/mascotas-vacunas`, mv);
  }

  deleteMascotaVacuna(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/mascotas-vacunas/${id}`);
  }

  getVacunas(page: number = 0, size: number = 100): Observable<ApiResponse<PageResponse<VacunaCatalog>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<VacunaCatalog>>>(`${this.baseUrl}/vacunas`, { params });
  }

  // Usuarios
  getUsuarios(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Usuario>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Usuario>>>(`${this.baseUrl}/usuarios`, { params });
  }

  createUsuario(user: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios`, user);
  }

  updateUsuario(id: number, user: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, user);
  }

  deleteUsuario(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/usuarios/${id}`);
  }

  toggleUsuarioEstado(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/usuarios/${id}/estado`, {});
  }

  // Historial Clínico
  getHistorialClinicoByMascota(idMascota: number, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<HistorialClinico>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<HistorialClinico>>>(`${this.baseUrl}/historial-clinico/mascota/${idMascota}`, { params });
  }

  createHistorialClinico(historial: HistorialClinico): Observable<ApiResponse<HistorialClinico>> {
    return this.http.post<ApiResponse<HistorialClinico>>(`${this.baseUrl}/historial-clinico`, historial);
  }

  updateHistorialClinico(id: number, historial: HistorialClinico): Observable<ApiResponse<HistorialClinico>> {
    return this.http.put<ApiResponse<HistorialClinico>>(`${this.baseUrl}/historial-clinico/${id}`, historial);
  }

  deleteHistorialClinico(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/historial-clinico/${id}`);
  }

  // Veterinarios
  getVeterinarios(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Veterinario>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Veterinario>>>(`${this.baseUrl}/veterinarios`, { params });
  }

  // Citas
  getCitas(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Cita>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Cita>>>(`${this.baseUrl}/citas`, { params });
  }

  createCita(cita: Cita): Observable<ApiResponse<Cita>> {
    return this.http.post<ApiResponse<Cita>>(`${this.baseUrl}/citas`, cita);
  }

  updateCita(id: number, cita: Cita): Observable<ApiResponse<Cita>> {
    return this.http.put<ApiResponse<Cita>>(`${this.baseUrl}/citas/${id}`, cita);
  }

  changeCitaEstado(id: number, idEstado: number, observacion?: string): Observable<ApiResponse<Cita>> {
    let params = new HttpParams().set('idEstado', idEstado);
    if (observacion) {
      params = params.set('observacion', observacion);
    }
    return this.http.patch<ApiResponse<Cita>>(`${this.baseUrl}/citas/${id}/estado`, {}, { params });
  }

  deleteCita(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/citas/${id}`);
  }

  // Pagos
  getPagos(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Pago>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<Pago>>>(`${this.baseUrl}/pagos`, { params });
  }

  createPago(pago: Pago): Observable<ApiResponse<Pago>> {
    return this.http.post<ApiResponse<Pago>>(`${this.baseUrl}/pagos`, pago);
  }

  // Catalogs
  getServicios(): Observable<ApiResponse<Servicio[]>> {
    return this.http.get<ApiResponse<Servicio[]>>(`${this.baseUrl}/catalogos/servicios`);
  }

  getTiposDocumento(): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.baseUrl}/catalogos/tipos-documento`);
  }

  getEspecies(): Observable<ApiResponse<Especie[]>> {
    return this.http.get<ApiResponse<Especie[]>>(`${this.baseUrl}/catalogos/especies`);
  }

  getRazas(idEspecie: number): Observable<ApiResponse<Raza[]>> {
    return this.http.get<ApiResponse<Raza[]>>(`${this.baseUrl}/catalogos/razas/${idEspecie}`);
  }

  getEspecialidades(): Observable<ApiResponse<Especialidad[]>> {
    return this.http.get<ApiResponse<Especialidad[]>>(`${this.baseUrl}/catalogos/especialidades`);
  }

  createVeterinario(vet: any): Observable<ApiResponse<Veterinario>> {
    return this.http.post<ApiResponse<Veterinario>>(`${this.baseUrl}/veterinarios`, vet);
  }

  updateVeterinario(id: number, vet: any): Observable<ApiResponse<Veterinario>> {
    return this.http.put<ApiResponse<Veterinario>>(`${this.baseUrl}/veterinarios/${id}`, vet);
  }

  deleteVeterinario(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/veterinarios/${id}`);
  }

  consultarDni(dni: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/integraciones/dni/${dni}`);
  }

  getLogsAuditoria(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<LogAuditoria>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<LogAuditoria>>>(`${this.baseUrl}/auditoria`, { params });
  }
}

