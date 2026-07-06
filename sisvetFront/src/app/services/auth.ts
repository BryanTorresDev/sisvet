import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  username: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    username: string;
    email: string;
    roles: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  
  // User state signal
  private readonly currentUserSignal = signal<User | null>(null);
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.roles.includes('ADMINISTRADOR') ?? false);
  readonly isVeterinario = computed(() => this.currentUserSignal()?.roles.includes('VETERINARIO') ?? false);
  readonly isRecepcionista = computed(() => this.currentUserSignal()?.roles.includes('RECEPCIONISTA') ?? false);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('token', res.data.token);
          const user: User = {
            username: res.data.username,
            email: res.data.email,
            roles: res.data.roles
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSignal.set(user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }
}
