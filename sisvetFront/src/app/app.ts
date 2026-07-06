import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);

  get isLandingPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/' || path === '';
  }
  
  // Mobile sidebar state
  isSidebarOpen = signal(false);

  // Desktop sidebar collapse state
  isSidebarCollapsed = signal(false);

  // Collapsible submenus for receptionist sidebar
  activeSubmenu = signal<string | null>(null);

  toggleSubmenu(menu: string): void {
    if (this.activeSubmenu() === menu) {
      this.activeSubmenu.set(null);
    } else {
      this.activeSubmenu.set(menu);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.isSidebarOpen.set(false);
    this.router.navigate(['/login']);
  }
}
