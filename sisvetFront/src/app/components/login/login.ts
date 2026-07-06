import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card card">
        <div class="login-header">
          <div class="logo-icon">🐾</div>
          <h2>SisVet</h2>
          <p>Sistema de Gestión Veterinaria Empresarial</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <div *ngIf="errorMessage()" class="alert alert-danger">
            {{ errorMessage() }}
          </div>
          
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="credentials.username" 
              required
              class="form-control" 
              placeholder="Ingrese su usuario"
              autocomplete="username">
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="credentials.password" 
              required
              class="form-control" 
              placeholder="Ingrese su contraseña"
              autocomplete="current-password">
          </div>
          
          <button 
            type="submit" 
            [disabled]="isLoading() || !loginForm.valid" 
            class="btn btn-primary btn-block">
            <span *ngIf="isLoading()">Iniciando sesión...</span>
            <span *ngIf="!isLoading()">Ingresar</span>
          </button>
        </form>
        
        <div class="login-footer">
          <p>Acceso restringido para personal autorizado.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: radial-gradient(circle at 50% 50%, hsl(224, 25%, 15%), hsl(224, 25%, 8%));
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem 2rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .login-header h2 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #ffffff, var(--accent-primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .login-header p {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .alert-danger {
      background-color: hsla(350, 80%, 60%, 0.15);
      border: 1px solid var(--accent-error);
      color: var(--accent-error);
    }
    .btn-block {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      margin-top: 0.5rem;
    }
    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Error de conexión con el servidor.');
        }
      }
    });
  }
}
