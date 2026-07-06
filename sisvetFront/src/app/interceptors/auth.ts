import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

// Public routes that should NOT trigger a login redirect on 401
const PUBLIC_ROUTES = ['/', '/login', ''];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only redirect to login on 401/403 if the user is NOT on a public page
      const currentPath = router.url.split('?')[0].split('#')[0];
      const isPublicPage = PUBLIC_ROUTES.includes(currentPath);

      if ((error.status === 401 || error.status === 403) && !isPublicPage) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
