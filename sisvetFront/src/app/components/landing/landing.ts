import {
  Component, OnInit, OnDestroy, signal, HostListener, ElementRef, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { DataService, Servicio, Veterinario } from '../../services/data';
import { catchError, forkJoin, of } from 'rxjs';

declare var gsap: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="landing-root">

  <!-- ====================================================
       NAVBAR
  ===================================================== -->
  <nav id="navbar" class="navbar" [class.navbar--scrolled]="scrolled">
    <div class="navbar__inner">
      <!-- Logo -->
      <a href="#inicio" class="navbar__brand" (click)="closeMobileMenu()">
        <div class="brand-icon">🐾</div>
        <div class="brand-text">
          <span class="brand-name">VetCare</span>
          <span class="brand-tag">Clínica Veterinaria</span>
        </div>
      </a>

      <!-- Desktop nav -->
      <div class="navbar__links">
        <a href="#inicio"      class="nav-link" (click)="scrollTo('inicio')">Inicio</a>
        <a href="#servicios"   class="nav-link" (click)="scrollTo('servicios')">Servicios</a>
        <a href="#equipo"      class="nav-link" (click)="scrollTo('equipo')">Nuestro Equipo</a>
        <a href="#nosotros"    class="nav-link" (click)="scrollTo('nosotros')">Nosotros</a>
        <a href="#reserva"     class="nav-link" (click)="scrollTo('reserva')">Agendar Cita</a>
      </div>

      <!-- CTA + hamburger -->
      <div class="navbar__actions">
        <a [routerLink]="isAuthenticated() ? '/dashboard' : '/login'"
           class="btn btn-nav">
          <span class="material-symbols-outlined">{{ isAuthenticated() ? 'dashboard' : 'login' }}</span>
          {{ isAuthenticated() ? 'Panel' : 'Acceso' }}
        </a>
        <button class="hamburger" (click)="toggleMobileMenu()" [class.hamburger--open]="mobileOpen" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div class="mobile-menu" [class.mobile-menu--open]="mobileOpen">
      <a href="#inicio"    class="mobile-link" (click)="scrollTo('inicio');closeMobileMenu()">🏠 Inicio</a>
      <a href="#servicios" class="mobile-link" (click)="scrollTo('servicios');closeMobileMenu()">💉 Servicios</a>
      <a href="#equipo"    class="mobile-link" (click)="scrollTo('equipo');closeMobileMenu()">👨‍⚕️ Nuestro Equipo</a>
      <a href="#nosotros"  class="mobile-link" (click)="scrollTo('nosotros');closeMobileMenu()">🏥 Nosotros</a>
      <a href="#reserva"   class="mobile-link" (click)="scrollTo('reserva');closeMobileMenu()">📅 Agendar Cita</a>
      <a [routerLink]="isAuthenticated() ? '/dashboard' : '/login'"
         class="mobile-link mobile-link--cta" (click)="closeMobileMenu()">
        {{ isAuthenticated() ? '→ Ir al Panel' : '→ Iniciar Sesión' }}
      </a>
    </div>
  </nav>

  <!-- ====================================================
       HERO
  ===================================================== -->
  <header id="inicio" class="hero">
    <!-- Animated background orbs -->
    <div class="hero__orb hero__orb--1"></div>
    <div class="hero__orb hero__orb--2"></div>
    <div class="hero__orb hero__orb--3"></div>

    <!-- Floating paws -->
    <div class="hero__paw" style="top:15%;left:8%;font-size:2rem;animation-delay:0s">🐾</div>
    <div class="hero__paw" style="top:30%;right:10%;font-size:1.4rem;animation-delay:0.8s">🐕</div>
    <div class="hero__paw" style="bottom:25%;left:12%;font-size:1.6rem;animation-delay:1.4s">🐈</div>
    <div class="hero__paw" style="bottom:20%;right:8%;font-size:1.2rem;animation-delay:0.4s">🐾</div>

    <div class="hero__content">
      <!-- Left -->
      <div class="hero__left hero-text">
        <div class="badge badge--pulse">
          <span class="badge__dot"></span>
          Clínica Abierta · 24 Horas de Emergencias
        </div>

        <h1 class="hero__title">
          <span class="gradient-text">Clínica Veterinaria</span><br>
          VetCare — San Isidro,<br>
          Lima 🐾
        </h1>

        <p class="hero__sub">
          En <strong>VetCare</strong>, la clínica veterinaria de referencia en San Isidro, Lima,
          combinamos tecnología médica de punta, un equipo de especialistas apasionados
          y atención personalizada para garantizar la salud y felicidad de tu mascota.
        </p>

        <div class="hero__cta-row">
          <a href="#reserva" class="btn btn-primary btn-lg" (click)="scrollTo('reserva')">
            <span class="material-symbols-outlined">calendar_month</span>
            Agendar Cita Médica
          </a>
          <a href="#servicios" class="btn btn-ghost btn-lg" (click)="scrollTo('servicios')">
            Ver Servicios
            <span class="material-symbols-outlined">arrow_downward</span>
          </a>
        </div>

        <!-- Mini stats -->
        <div class="hero__stats">
          <div class="stat">
            <span class="stat__num">+15K</span>
            <span class="stat__label">Pacientes atendidos</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__num">99%</span>
            <span class="stat__label">Satisfacción</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat__num">10+</span>
            <span class="stat__label">Años de experiencia</span>
          </div>
        </div>
      </div>

      <!-- Right card -->
      <div class="hero__right hero-card">
        <div class="hero-card__glow"></div>
        <div class="hero-card__inner">
          <!-- Hero Card Image Banner -->
          <div class="hcard-banner">
            <img src="/images/vet_hero.png"
                 alt="Veterinario de VetCare examinando a un perro en la clínica de San Isidro, Lima"
                 class="hcard-banner__img"
                 width="480" height="180"
                 fetchpriority="high">
            <div class="hcard-banner__badge">Clínica Certificada</div>
          </div>

          <!-- Status bar -->
          <div class="hcard-status">
            <div class="hcard-status__left">
              <div class="hcard-avatar">🏥</div>
              <div>
                <p class="hcard-status__title">VetCare — Estado del Sistema</p>
                <p class="hcard-status__sub">Todas las áreas operativas</p>
              </div>
            </div>
            <div class="pulse-ring">
              <span class="pulse-core"></span>
            </div>
          </div>

          <!-- Services quick peek -->
          <div class="hcard-services">
            <div class="hcard-service-item" *ngFor="let s of heroServices">
              <span class="hcard-service-icon">{{ s.icon }}</span>
              <span class="hcard-service-name">{{ s.name }}</span>
              <span class="hcard-service-price">S/ {{ s.price }}</span>
            </div>
            <div *ngIf="loadingServices" class="hcard-loading">
              <div class="skeleton skeleton--sm"></div>
              <div class="skeleton skeleton--sm"></div>
              <div class="skeleton skeleton--sm"></div>
            </div>
          </div>

          <!-- Promo badge -->
          <div class="hcard-promo">
            <span class="hcard-promo__emoji">🎁</span>
            <div>
              <p class="hcard-promo__title">¡Primera visita!</p>
              <p class="hcard-promo__sub">15% de descuento en consulta general</p>
            </div>
            <span class="hcard-promo__badge">PROMO</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====================================================
         TRUST BAR — integrated in hero bottom
    ===================================================== -->
    <div class="trust-bar">
      <div class="trust-bar__inner">
        <div class="trust-item">
          <span class="trust-item__icon">🏅</span>
          <span>Colegio Veterinario Certificado</span>
        </div>
        <div class="trust-sep">·</div>
        <div class="trust-item">
          <span class="trust-item__icon">🔬</span>
          <span>Laboratorio Clínico Propio</span>
        </div>
        <div class="trust-sep">·</div>
        <div class="trust-item">
          <span class="trust-item__icon">🚑</span>
          <span>Emergencias 24/7</span>
        </div>
        <div class="trust-sep">·</div>
        <div class="trust-item">
          <span class="trust-item__icon">💊</span>
          <span>Farmacia Veterinaria</span>
        </div>
        <div class="trust-sep">·</div>
        <div class="trust-item">
          <span class="trust-item__icon">📋</span>
          <span>Historial Clínico Digital</span>
        </div>
      </div>
    </div>
  </header>

  <!-- ====================================================
       SERVICIOS
  ===================================================== -->
  <section id="servicios" class="section section--alt">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">💉 Especialidades Médicas</span>
        <h2 class="section-title">Nuestros Servicios Veterinarios</h2>
        <p class="section-sub">
          Ofrecemos atención integral para perros, gatos, aves y más.
          Todos nuestros procedimientos son realizados por especialistas certificados.
        </p>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="loadingServices" class="services-grid">
        <div *ngFor="let _ of [1,2,3,4,5,6]" class="skeleton-card">
          <div class="skeleton skeleton--icon"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text short"></div>
        </div>
      </div>

      <!-- Service cards from API -->
      <div *ngIf="!loadingServices" class="services-grid">
        <div
          *ngFor="let s of services; let i = index"
          class="service-card reveal"
          [style.animation-delay]="(i * 0.07) + 's'">

          <div class="service-card__header">
            <div class="service-card__icon-wrap">
              <span class="service-card__emoji">{{ getServiceEmoji(s.nombre) }}</span>
            </div>
            <span class="service-card__duration">
              <span class="material-symbols-outlined">schedule</span>
              {{ s.duracionMinutos }} min
            </span>
          </div>

          <h3 class="service-card__name">{{ s.nombre }}</h3>
          <p class="service-card__desc">{{ s.descripcion || getServiceDefaultDesc(s.nombre) }}</p>

          <div class="service-card__footer">
            <div class="service-card__price-wrap">
              <span class="service-card__price-label">Precio</span>
              <span class="service-card__price">S/ {{ s.precio.toFixed(2) }}</span>
            </div>
            <a href="#reserva" class="btn btn-sm btn-outline" (click)="scrollTo('reserva')">
              Reservar
            </a>
          </div>

          <!-- Hover glow -->
          <div class="service-card__glow"></div>
        </div>
      </div>

      <!-- Error state -->
      <div *ngIf="!loadingServices && services.length === 0" class="empty-state">
        <span class="empty-state__icon">🐾</span>
        <p>Cargando servicios... asegúrate de que el servidor esté activo.</p>
      </div>
    </div>
  </section>

  <!-- ====================================================
       ABOUT — NUESTRA CLÍNICA
  ===================================================== -->
  <section id="nosotros" class="section">
    <div class="container about-grid">
      <!-- Visual column -->
      <div class="about-visual reveal-left">
        <div class="about-visual__card">
          <div class="about-visual__top">
            <img src="/images/vet_clinic.png"
                 alt="Interior moderno de VetCare Clínica Veterinaria en San Isidro, Lima"
                 class="about-visual__img"
                 width="600" height="320"
                 loading="lazy">
            <div class="about-visual__overlay">
              <h4>Clínica VetCare</h4>
              <p class="about-visual__address">
                <span class="material-symbols-outlined">location_on</span>
                Av. Los Veterinarios 456, Lima
              </p>
            </div>
          </div>
        </div>

        <!-- Floating badge -->
        <div class="about-badge about-badge--years">
          <span class="about-badge__num">10+</span>
          <span class="about-badge__label">Años de<br>experiencia</span>
        </div>
        <div class="about-badge about-badge--rating">
          <span>⭐ 4.9</span>
          <span class="about-badge__label">Calificación</span>
        </div>
      </div>

      <!-- Text column -->
      <div class="about-text reveal-right">
        <span class="section-tag">🏥 ¿Quiénes Somos?</span>
        <h2 class="section-title">Cuidamos a tu mascota con amor, ciencia y tecnología</h2>
        <p class="about-text__body">
          Fundada con el firme compromiso de ofrecer atención veterinaria de la más alta calidad,
          <strong>VetCare</strong> se ha consolidado como una de las clínicas de referencia en Lima.
          Contamos con quirófano completamente equipado, laboratorio clínico propio y diagnóstico
          por imágenes digital de última generación.
        </p>
        <p class="about-text__body">
          Creemos que cada mascota es un miembro especial de la familia. Por eso, diseñamos
          programas personalizados de salud preventiva y vacunación para cada etapa de su vida.
        </p>

        <div class="about-features">
          <div class="about-feature" *ngFor="let f of aboutFeatures">
            <div class="about-feature__icon">{{ f.icon }}</div>
            <div>
              <h4 class="about-feature__title">{{ f.title }}</h4>
              <p class="about-feature__desc">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================================================
       EQUIPO VETERINARIO
  ===================================================== -->
  <section id="equipo" class="section section--alt">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">👨‍⚕️ Staff Médico</span>
        <h2 class="section-title">Nuestros Veterinarios Especialistas</h2>
        <p class="section-sub">
          Conoce al equipo de profesionales que cuidan de tus engreídos con dedicación y experiencia.
        </p>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="loadingVets" class="vets-grid">
        <div *ngFor="let _ of [1,2,3,4]" class="skeleton-card vet-skeleton">
          <div class="skeleton skeleton--avatar"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text"></div>
        </div>
      </div>

      <!-- Vet cards from API -->
      <div *ngIf="!loadingVets" class="vets-grid">
        <div
          *ngFor="let v of vets; let i = index"
          class="vet-card reveal"
          [style.animation-delay]="(i * 0.1) + 's'">

          <div class="vet-card__avatar-wrap">
            <img [src]="getVetPhoto(i)"
                 [alt]="'Foto del Dr(a). ' + v.nombres + ' ' + v.apellidoPaterno + ' — Veterinario especialista en ' + v.especialidad + ' en VetCare Lima'"
                 class="vet-card__avatar-img"
                 width="72" height="72"
                 loading="lazy">
            <div class="vet-card__status-dot"></div>
          </div>

          <div class="vet-card__body">
            <span class="vet-card__specialty">{{ v.especialidad }}</span>
            <h3 class="vet-card__name">Dr(a). {{ v.nombres }} {{ v.apellidoPaterno }}</h3>
            <p class="vet-card__colegiatura">
              <span class="material-symbols-outlined">badge</span>
              Colegiatura: <strong>{{ v.numeroColegiatura }}</strong>
            </p>
            <p class="vet-card__email">
              <span class="material-symbols-outlined">mail</span>
              {{ v.correo }}
            </p>
          </div>

          <div class="vet-card__footer">
            <span class="vet-card__available">
              <span class="vet-card__available-dot"></span>
              Disponible para consultas
            </span>
            <a href="#reserva" class="btn btn-sm btn-outline" (click)="scrollTo('reserva')">
              Consultar
            </a>
          </div>
        </div>
      </div>

      <!-- Empty / fallback -->
      <div *ngIf="!loadingVets && vets.length === 0" class="empty-state">
        <span class="empty-state__icon">👨‍⚕️</span>
        <p>Cargando equipo médico... asegúrate de que el servidor esté activo.</p>
      </div>
    </div>
  </section>

  <!-- ====================================================
       TESTIMONIOS
  ===================================================== -->
  <section id="testimonios" class="section">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">⭐ Testimonios</span>
        <h2 class="section-title">Lo que dicen nuestros clientes</h2>
        <p class="section-sub">Familias que confían en VetCare para el cuidado de sus mascotas.</p>
      </div>

      <div class="testimonials-grid">
        <div *ngFor="let t of testimonials; let i = index"
             class="testimonial-card reveal"
             [style.animation-delay]="(i * 0.12) + 's'">
          <div class="testimonial-card__stars">
            <span *ngFor="let _ of [1,2,3,4,5]">⭐</span>
          </div>
          <p class="testimonial-card__text">"{{ t.text }}"</p>
          <div class="testimonial-card__author">
            <div class="testimonial-card__avatar" [style.background]="t.color">
              {{ t.initials }}
            </div>
            <div>
              <h4 class="testimonial-card__name">{{ t.name }}</h4>
              <p class="testimonial-card__pet">{{ t.pet }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ====================================================
       HORARIO & CONTACTO
  ===================================================== -->
  <section id="contacto" class="section section--alt">
    <div class="container info-grid">

      <div class="info-card reveal">
        <div class="info-card__icon">🕐</div>
        <h3 class="info-card__title">Horario de Atención</h3>
        <div class="info-card__schedule">
          <div class="schedule-row">
            <span>Lunes – Viernes</span>
            <strong>08:00 AM – 08:00 PM</strong>
          </div>
          <div class="schedule-row">
            <span>Sábados</span>
            <strong>09:00 AM – 06:00 PM</strong>
          </div>
          <div class="schedule-row">
            <span>Domingos</span>
            <strong>10:00 AM – 04:00 PM</strong>
          </div>
        </div>
        <div class="info-card__emergency">
          🚑 Emergencias disponibles <strong>24 horas</strong>
        </div>
      </div>

      <div class="info-card reveal" style="animation-delay:0.1s">
        <div class="info-card__icon">📍</div>
        <h3 class="info-card__title">Encuéntranos</h3>
        <div class="info-card__contact-list">
          <div class="contact-row">
            <span class="material-symbols-outlined">location_on</span>
            <span>Av. Los Veterinarios 456, San Isidro, Lima</span>
          </div>
          <div class="contact-row">
            <span class="material-symbols-outlined">call</span>
            <span>+51 999 888 777</span>
          </div>
          <div class="contact-row">
            <span class="material-symbols-outlined">mail</span>
            <span>contacto&#64;vetcare.pe</span>
          </div>
          <div class="contact-row">
            <span class="material-symbols-outlined">language</span>
            <span>www.vetcare.pe</span>
          </div>
        </div>
      </div>

      <div class="info-card reveal" style="animation-delay:0.2s">
        <div class="info-card__icon">🐾</div>
        <h3 class="info-card__title">Especies que Atendemos</h3>
        <div class="species-grid">
          <div class="species-item" *ngFor="let sp of species">
            <span class="species-item__emoji">{{ sp.emoji }}</span>
            <span class="species-item__name">{{ sp.name }}</span>
          </div>
        </div>
      </div>

      <div class="info-card reveal" style="animation-delay:0.3s">
        <div class="info-card__icon">🔬</div>
        <h3 class="info-card__title">Nuestra Infraestructura</h3>
        <div class="info-card__contact-list">
          <div class="contact-row">
            <span class="material-symbols-outlined">health_and_safety</span>
            <span>Quirófano estéril equipado</span>
          </div>
          <div class="contact-row">
            <span class="material-symbols-outlined">biotech</span>
            <span>Laboratorio de análisis propio</span>
          </div>
          <div class="contact-row">
            <span class="material-symbols-outlined">ecg</span>
            <span>Ecografía y Rayos X Digital</span>
          </div>
          <div class="contact-row">
            <span class="material-symbols-outlined">pets</span>
            <span>Zona de espera pet-friendly</span>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ====================================================
       RESERVA / FORMULARIO
  ===================================================== -->
  <section id="reserva" class="section">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-tag">📅 Reserva Online</span>
        <h2 class="section-title">Agendar una Cita Médica</h2>
        <p class="section-sub">
          Completa el formulario en 3 sencillos pasos. Te confirmaremos la cita
          por teléfono o correo electrónico.
        </p>
      </div>

      <!-- Step indicator -->
      <div class="step-indicator reveal">
        <div *ngFor="let step of [1,2,3]; let i = index" class="step-indicator__item">
          <button
            class="step-btn"
            [class.step-btn--active]="formStep() === step"
            [class.step-btn--done]="formStep() > step"
            (click)="goToStep(step)">
            <span *ngIf="formStep() > step" class="material-symbols-outlined" style="font-size:16px">check</span>
            <span *ngIf="formStep() <= step">{{ step }}</span>
          </button>
          <span class="step-label">{{ stepLabels[i] }}</span>
          <div *ngIf="i < 2" class="step-line" [class.step-line--done]="formStep() > step"></div>
        </div>
      </div>

      <!-- Form card -->
      <div class="form-card reveal">

        <!-- Step 1: Client Info -->
        <div *ngIf="formStep() === 1" class="form-step fade-in">
          <h3 class="form-step__title">
            <span>👤</span> Datos del Titular (Dueño)
          </h3>
          <div class="form-grid form-grid--2">
            <div class="form-group">
              <label class="form-label" for="f-dni">Número de Documento</label>
              <div class="input-with-btn">
                <input id="f-dni" type="text" class="form-input" placeholder="DNI / CE (8 dígitos)"
                  [(ngModel)]="booking.dni" maxlength="12">
                <button class="btn btn-sm btn-ghost" type="button"
                  [disabled]="booking.dni.length < 8" (click)="searchDni()">
                  <span class="material-symbols-outlined">search</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="f-telefono">Teléfono / Celular</label>
              <input id="f-telefono" type="tel" class="form-input" placeholder="999 888 777"
                [(ngModel)]="booking.telefono">
            </div>
            <div class="form-group">
              <label class="form-label" for="f-nombres">Nombres</label>
              <input id="f-nombres" type="text" class="form-input" placeholder="Tus nombres"
                [(ngModel)]="booking.nombres">
            </div>
            <div class="form-group">
              <label class="form-label" for="f-apellidos">Apellidos</label>
              <input id="f-apellidos" type="text" class="form-input" placeholder="Tus apellidos"
                [(ngModel)]="booking.apellidos">
            </div>
            <div class="form-group form-group--full">
              <label class="form-label" for="f-correo">Correo Electrónico</label>
              <input id="f-correo" type="email" class="form-input" placeholder="tu.correo@ejemplo.com"
                [(ngModel)]="booking.correo">
            </div>
          </div>
          <div class="form-actions form-actions--right">
            <button class="btn btn-primary" [disabled]="!step1Valid()" (click)="nextStep()">
              Siguiente <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Pet Info -->
        <div *ngIf="formStep() === 2" class="form-step fade-in">
          <h3 class="form-step__title">
            <span>🐾</span> Datos de tu Mascota
          </h3>
          <div class="form-grid form-grid--2">
            <div class="form-group">
              <label class="form-label" for="f-mascota">Nombre de la Mascota</label>
              <input id="f-mascota" type="text" class="form-input" placeholder="Nombre del engreído"
                [(ngModel)]="booking.nombreMascota">
            </div>
            <div class="form-group">
              <label class="form-label" for="f-especie">Especie</label>
              <select id="f-especie" class="form-input" [(ngModel)]="booking.especie">
                <option value="Perro">🐕 Perro</option>
                <option value="Gato">🐈 Gato</option>
                <option value="Ave">🐦 Ave</option>
                <option value="Conejo">🐇 Conejo</option>
                <option value="Otro">🐾 Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="f-raza">Raza</label>
              <input id="f-raza" type="text" class="form-input" placeholder="Ej. Labrador, Siamés"
                [(ngModel)]="booking.raza">
            </div>
            <div class="form-group">
              <label class="form-label">Sexo</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" name="sexo" value="M" [(ngModel)]="booking.sexo"> Macho 🐾
                </label>
                <label class="radio-option">
                  <input type="radio" name="sexo" value="F" [(ngModel)]="booking.sexo"> Hembra 🐾
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="f-peso">Peso aprox. (kg)</label>
              <input id="f-peso" type="number" class="form-input" placeholder="Ej. 8.5"
                [(ngModel)]="booking.peso" min="0" step="0.1">
            </div>
            <div class="form-group">
              <label class="form-label" for="f-edad">Edad (años)</label>
              <input id="f-edad" type="number" class="form-input" placeholder="Ej. 3"
                [(ngModel)]="booking.edad" min="0">
            </div>
          </div>
          <div class="form-actions form-actions--between">
            <button class="btn btn-ghost" (click)="prevStep()">
              <span class="material-symbols-outlined">arrow_back</span> Atrás
            </button>
            <button class="btn btn-primary" [disabled]="!step2Valid()" (click)="nextStep()">
              Siguiente <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Step 3: Appointment -->
        <div *ngIf="formStep() === 3" class="form-step fade-in">
          <h3 class="form-step__title">
            <span>📅</span> Detalles de la Cita
          </h3>
          <div class="form-grid form-grid--2">
            <div class="form-group">
              <label class="form-label" for="f-servicio">Servicio Requerido</label>
              <select id="f-servicio" class="form-input" [(ngModel)]="booking.idServicio">
                <option value="" disabled>Selecciona un servicio</option>
                <option *ngFor="let s of services" [value]="s.idServicio">
                  {{ s.nombre }} — S/ {{ s.precio.toFixed(2) }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="f-vet">Especialista Preferido</label>
              <select id="f-vet" class="form-input" [(ngModel)]="booking.idVeterinario">
                <option value="">Cualquier veterinario disponible</option>
                <option *ngFor="let v of vets" [value]="v.idVeterinario">
                  Dr(a). {{ v.nombres }} {{ v.apellidoPaterno }} — {{ v.especialidad }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="f-fecha">Fecha Preferida</label>
              <input id="f-fecha" type="date" class="form-input" [(ngModel)]="booking.fecha" [min]="todayStr">
            </div>
            <div class="form-group">
              <label class="form-label" for="f-hora">Turno Preferido</label>
              <select id="f-hora" class="form-input" [(ngModel)]="booking.hora">
                <option value="" disabled>Selecciona un turno</option>
                <option *ngFor="let h of timeSlots" [value]="h">{{ h }}</option>
              </select>
            </div>
            <div class="form-group form-group--full">
              <label class="form-label" for="f-motivo">Motivo de la Cita</label>
              <textarea id="f-motivo" class="form-input form-textarea" rows="3"
                placeholder="Describe brevemente el síntoma o motivo de consulta..."
                [(ngModel)]="booking.motivo"></textarea>
            </div>
          </div>
          <div class="form-actions form-actions--between">
            <button class="btn btn-ghost" (click)="prevStep()">
              <span class="material-symbols-outlined">arrow_back</span> Atrás
            </button>
            <button class="btn btn-primary btn-lg" [disabled]="!step3Valid() || isSubmitting()" (click)="submitBooking()">
              <span *ngIf="isSubmitting()" class="material-symbols-outlined spinning">progress_activity</span>
              <span *ngIf="!isSubmitting()">✅ Confirmar Reserva</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ====================================================
       SUCCESS MODAL
  ===================================================== -->
  <div *ngIf="showSuccess()" class="modal-overlay fade-in" (click)="closeSuccess()">
    <div class="modal-card scale-in" (click)="$event.stopPropagation()">
      <div class="modal-icon">✅</div>
      <h3 class="modal-title">¡Cita Pre-Registrada!</h3>
      <p class="modal-sub">
        Tu solicitud fue recibida. Nos comunicaremos al
        <strong>{{ booking.telefono }}</strong> o al correo
        <strong>{{ booking.correo }}</strong> para confirmar la fecha y hora.
      </p>

      <div class="booking-ticket">
        <div class="ticket-row">
          <span class="ticket-label">Código de reserva</span>
          <strong class="ticket-code">{{ bookingCode }}</strong>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Mascota</span>
          <span>{{ booking.nombreMascota }} ({{ booking.especie }})</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Servicio</span>
          <span>{{ getServiceName() }}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Fecha / Hora</span>
          <span>{{ booking.fecha }} · {{ booking.hora }}</span>
        </div>
      </div>

      <button class="btn btn-primary w-full" (click)="closeSuccess()">Entendido 🐾</button>
    </div>
  </div>

  <!-- ====================================================
       FOOTER
  ===================================================== -->
  <footer class="footer">
    <div class="footer__grid container">
      <div class="footer-brand">
        <div class="footer-brand__logo">🐾 VetCare</div>
        <p class="footer-brand__desc">
          Clínica veterinaria de alta complejidad. Cuidamos a tu mascota con amor,
          ciencia y tecnología de punta.
        </p>
        <p class="footer-brand__copy">© 2026 VetCare. Todos los derechos reservados.</p>
      </div>

      <div class="footer-col">
        <h4 class="footer-col__title">Servicios</h4>
        <a href="#servicios" class="footer-link" *ngFor="let s of services.slice(0,5)">{{ s.nombre }}</a>
      </div>

      <div class="footer-col">
        <h4 class="footer-col__title">Horario</h4>
        <p class="footer-text">Lun – Vie: 08:00 – 20:00</p>
        <p class="footer-text">Sáb: 09:00 – 18:00</p>
        <p class="footer-text">Dom: 10:00 – 16:00</p>
        <p class="footer-emerg">🚑 Emergencias 24/7</p>
      </div>

      <div class="footer-col">
        <h4 class="footer-col__title">Contacto</h4>
        <p class="footer-text">📞 +51 999 888 777</p>
        <p class="footer-text">✉️ contacto&#64;vetcare.pe</p>
        <p class="footer-text">📍 Av. Los Veterinarios 456</p>
        <p class="footer-text">San Isidro, Lima, Perú</p>
      </div>
    </div>

    <div class="footer__bottom container">
      <div class="footer__links">
        <a href="#" class="footer-link">Política de Privacidad</a>
        <a href="#" class="footer-link">Términos de Servicio</a>
        <a href="#" class="footer-link">Libro de Reclamaciones</a>
      </div>
      <p class="footer__credit">Desarrollado con 💜 para VetCare</p>
    </div>
  </footer>

</div>
  `,
  styles: [`
    /* =====================================================
       ROOT & RESET
    ====================================================== */
    :host { display: block; }
    .landing-root {
      min-height: 100vh;
      background: #0c0e14;
      color: #f5f7fa;
      font-family: 'Inter', sans-serif;
      overflow-x: clip;
      scroll-behavior: smooth;
    }
    /* Smooth scroll for the whole page */
    html { scroll-behavior: smooth; }

    /* =====================================================
       NAVBAR
    ====================================================== */
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      background: rgba(12,14,20,0.7);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(40,46,61,0.4);
      transition: background 0.3s, box-shadow 0.3s;
    }
    .navbar--scrolled {
      background: rgba(12,14,20,0.96);
      box-shadow: 0 4px 32px rgba(0,0,0,0.4);
    }
    .navbar__inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #7d44e0, #1bc475);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 4px 16px rgba(141,94,229,0.3);
    }
    .brand-name { font-size: 1.2rem; font-weight: 800; color: #fff; display: block; line-height: 1.1; }
    .brand-tag  { font-size: 0.65rem; color: #9aa2b1; font-weight: 500; letter-spacing: 0.05em; }
    .navbar__links {
      display: none;
      gap: 2rem;
    }
    @media(min-width:900px){ .navbar__links { display: flex; align-items: center; } }
    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: #9aa2b1;
      text-decoration: none;
      transition: color 0.2s;
      cursor: pointer;
    }
    .nav-link:hover { color: #fff; }
    .navbar__actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn-nav {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: rgba(141,94,229,0.15);
      border: 1px solid rgba(141,94,229,0.35);
      border-radius: 10px;
      color: #fff;
      font-size: 0.8rem; font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-nav:hover { background: rgba(141,94,229,0.3); border-color: #8f5ee5; }
    .btn-nav .material-symbols-outlined { font-size: 16px; }

    /* Hamburger */
    .hamburger {
      width: 40px; height: 40px;
      background: none; border: 1px solid rgba(40,46,61,0.8);
      border-radius: 8px; cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 5px;
      padding: 0;
    }
    @media(min-width:900px){ .hamburger { display: none; } }
    .hamburger span {
      display: block; width: 20px; height: 2px;
      background: #f5f7fa; border-radius: 2px;
      transition: all 0.3s;
    }
    .hamburger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger--open span:nth-child(2) { opacity: 0; }
    .hamburger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile menu */
    .mobile-menu {
      display: none;
      flex-direction: column;
      background: rgba(17,20,29,0.98);
      border-top: 1px solid rgba(40,46,61,0.5);
      padding: 1rem 1.5rem 1.5rem;
      gap: 0.25rem;
    }
    @media(max-width:899px){ .mobile-menu--open { display: flex; } }
    .mobile-link {
      display: block;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: #9aa2b1;
      font-size: 0.9rem; font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    .mobile-link:hover { background: rgba(141,94,229,0.1); color: #fff; }
    .mobile-link--cta {
      margin-top: 0.5rem;
      background: linear-gradient(135deg, #7d44e0, #1bc475);
      color: #fff; font-weight: 700;
      border-radius: 12px;
    }

    /* =====================================================
       HERO
    ====================================================== */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-top: 72px;
      overflow: hidden;
    }
    .hero__orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }
    .hero__orb--1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(141,94,229,0.18), transparent 70%);
      top: -100px; left: -150px;
    }
    .hero__orb--2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(27,196,117,0.12), transparent 70%);
      bottom: -50px; right: -100px;
    }
    .hero__orb--3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(243,146,39,0.08), transparent 70%);
      top: 40%; left: 40%;
    }
    .hero__paw {
      position: absolute;
      animation: floatPaw 4s ease-in-out infinite;
      pointer-events: none;
      opacity: 0.35;
      user-select: none;
    }
    @keyframes floatPaw {
      0%, 100% { transform: translateY(0) rotate(-5deg); }
      50% { transform: translateY(-18px) rotate(5deg); }
    }
    .hero__content {
      max-width: 1280px;
      margin: auto;
      padding: 1.5rem 1.5rem 2rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    @media(min-width:1024px){
      .hero__content { grid-template-columns: 1fr 1fr; gap: 3rem; }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      background: rgba(27,196,117,0.1);
      border: 1px solid rgba(27,196,117,0.25);
      font-size: 0.75rem; font-weight: 600;
      color: #1bc475;
      width: fit-content;
    }
    .badge__dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #1bc475;
      animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
    }
    @keyframes ping {
      75%, 100% { transform: scale(1.8); opacity: 0; }
    }

    .hero__title {
      font-size: clamp(2rem, 4.5vw, 3.4rem);
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.02em;
      color: #fff;
      margin: 0.5rem 0;
    }
    .gradient-text {
      background: linear-gradient(135deg, #8f5ee5, #1bc475);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero__sub {
      font-size: 1.05rem;
      color: #9aa2b1;
      line-height: 1.7;
      max-width: 540px;
    }
    .hero__cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .hero__stats {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(40,46,61,0.6);
      flex-wrap: wrap;
    }
    .stat__num { font-size: 1.5rem; font-weight: 800; color: #8f5ee5; display: block; }
    .stat__label { font-size: 0.72rem; color: #9aa2b1; font-weight: 500; }
    .stat-divider { width: 1px; height: 32px; background: rgba(40,46,61,0.8); }

    /* Hero Card */
    .hero__right { position: relative; }
    .hero-card__glow {
      position: absolute;
      inset: -2px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(141,94,229,0.2), rgba(27,196,117,0.15));
      filter: blur(12px);
      z-index: 0;
    }
    .hcard-banner {
      position: relative;
      height: 140px;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 0.15rem;
    }
    .hcard-banner__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
    }
    .hcard-banner__badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(12, 14, 20, 0.85);
      backdrop-filter: blur(8px);
      padding: 0.3rem 0.75rem;
      border-radius: 99px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #1bc475;
      border: 1px solid rgba(27, 196, 117, 0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .hero-card__inner {
      position: relative;
      background: rgba(17,20,29,0.9);
      border: 1px solid rgba(40,46,61,0.8);
      border-radius: 24px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      backdrop-filter: blur(12px);
    }
    .hcard-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(40,46,61,0.6);
    }
    .hcard-status__left { display: flex; align-items: center; gap: 0.75rem; }
    .hcard-avatar {
      width: 40px; height: 40px;
      background: rgba(141,94,229,0.15);
      border: 1px solid rgba(141,94,229,0.3);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem;
    }
    .hcard-status__title { font-size: 0.82rem; font-weight: 700; color: #fff; }
    .hcard-status__sub   { font-size: 0.7rem; color: #1bc475; font-weight: 500; }
    .pulse-ring {
      position: relative;
      width: 16px; height: 16px;
    }
    .pulse-core {
      position: absolute;
      inset: 3px;
      background: #1bc475;
      border-radius: 50%;
    }
    .pulse-ring::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(27,196,117,0.4);
      border-radius: 50%;
      animation: ping 1.5s ease-in-out infinite;
    }

    .hcard-services { display: flex; flex-direction: column; gap: 0.6rem; }
    .hcard-service-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.45rem 0.75rem;
      background: rgba(23,26,38,0.8);
      border: 1px solid rgba(40,46,61,0.5);
      border-radius: 12px;
    }
    .hcard-service-icon { font-size: 1.1rem; }
    .hcard-service-name { font-size: 0.78rem; font-weight: 600; color: #f5f7fa; flex: 1; }
    .hcard-service-price { font-size: 0.75rem; font-weight: 700; color: #1bc475; }
    .hcard-loading { display: flex; flex-direction: column; gap: 0.5rem; }

    .hcard-promo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      background: linear-gradient(135deg, rgba(141,94,229,0.12), rgba(27,196,117,0.08));
      border: 1px solid rgba(141,94,229,0.25);
      border-radius: 14px;
    }
    .hcard-promo__emoji { font-size: 1.4rem; }
    .hcard-promo__title { font-size: 0.8rem; font-weight: 700; color: #fff; }
    .hcard-promo__sub { font-size: 0.68rem; color: #9aa2b1; }
    .hcard-promo__badge {
      margin-left: auto;
      padding: 0.2rem 0.55rem;
      background: #8f5ee5;
      border-radius: 6px;
      font-size: 0.6rem; font-weight: 800;
      color: #fff; letter-spacing: 0.08em;
    }

    /* Scroll indicator */
    .scroll-indicator {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex; flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .scroll-indicator__arrow {
      width: 24px; height: 24px;
      border-right: 2px solid rgba(141,94,229,0.5);
      border-bottom: 2px solid rgba(141,94,229,0.5);
      transform: rotate(45deg);
      animation: bounce 1.6s ease-in-out infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: rotate(45deg) translateY(0); }
      50% { transform: rotate(45deg) translateY(6px); }
    }

    /* =====================================================
       TRUST BAR
    ====================================================== */
    .trust-bar {
      background: rgba(17,20,29,0.7);
      border-top: 1px solid rgba(40,46,61,0.5);
      border-bottom: 1px solid rgba(40,46,61,0.5);
      padding: 1rem 0;
      overflow: hidden;
    }
    .trust-bar__inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem 1.5rem;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #9aa2b1;
    }
    .trust-item__icon { font-size: 1.1rem; }
    .trust-sep { color: rgba(40,46,61,0.8); font-size: 1.2rem; }
    @media(max-width:600px){ .trust-sep { display: none; } }

    /* =====================================================
       GENERIC SECTION
    ====================================================== */
    /* =====================================================
       SECTIONS — uniform vertical rhythm
    ====================================================== */
    .section {
      min-height: calc(100vh - 72px);
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
      padding: 5rem 0;
      scroll-margin-top: 72px;
      position: relative;
    }
    .section--alt {
      background: rgba(17,20,29,0.55);
      border-top: 1px solid rgba(40,46,61,0.4);
      border-bottom: 1px solid rgba(40,46,61,0.4);
    }

    /* =====================================================
       CONTAINER — full-width, perfectly centered
    ====================================================== */
    .container {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 clamp(1rem, 4vw, 3rem);
      box-sizing: border-box;
    }
    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
      max-width: 680px;
      margin-left: auto;
      margin-right: auto;
    }
    .section-tag {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8f5ee5;
      margin-bottom: 0.75rem;
    }
    .section-title {
      font-size: clamp(1.7rem, 3vw, 2.4rem);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      margin: 0 0 0.75rem;
    }
    .section-sub {
      font-size: 0.95rem;
      color: #9aa2b1;
      line-height: 1.7;
      margin: 0;
    }

    /* =====================================================
       SERVICE CARDS — responsive 1 → 2 → 3 → 4 col grid
    ====================================================== */
    .services-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media(min-width: 600px)  { .services-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(min-width: 900px)  { .services-grid { grid-template-columns: repeat(3, 1fr); } }
    .service-card {
      position: relative;
      background: rgba(17,20,29,0.8);
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
      overflow: hidden;
      cursor: default;
    }
    .service-card:hover {
      transform: translateY(-6px);
      border-color: rgba(141,94,229,0.4);
      box-shadow: 0 20px 60px rgba(141,94,229,0.12);
    }
    .service-card:hover .service-card__glow { opacity: 1; }
    .service-card__glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at top left, rgba(141,94,229,0.06), transparent 60%);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
    }
    .service-card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .service-card__icon-wrap {
      width: 52px; height: 52px;
      background: rgba(141,94,229,0.12);
      border: 1px solid rgba(141,94,229,0.2);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem;
      transition: transform 0.3s;
    }
    .service-card:hover .service-card__icon-wrap { transform: scale(1.1) rotate(-4deg); }
    .service-card__duration {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.68rem;
      font-weight: 600;
      color: #9aa2b1;
      background: rgba(40,46,61,0.6);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
    }
    .service-card__duration .material-symbols-outlined { font-size: 13px; }
    .service-card__name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .service-card__desc {
      font-size: 0.82rem;
      color: #9aa2b1;
      line-height: 1.6;
      flex: 1;
      margin: 0;
    }
    .service-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(40,46,61,0.5);
      margin-top: auto;
    }
    .service-card__price-label { font-size: 0.65rem; color: #9aa2b1; font-weight: 500; }
    .service-card__price {
      font-size: 1.2rem;
      font-weight: 800;
      color: #1bc475;
    }
    .service-card__price-wrap { display: flex; flex-direction: column; }

    /* =====================================================
       ABOUT
    ====================================================== */
    .about-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
    }
    @media(min-width:900px){ .about-grid { grid-template-columns: 1fr 1fr; } }

    .about-visual { position: relative; }
    .about-visual__card {
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 24px;
      overflow: hidden;
      background: rgba(17,20,29,0.8);
    }
    .about-visual__top {
      height: 320px;
      background: linear-gradient(135deg, rgba(141,94,229,0.15), rgba(27,196,117,0.08));
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .about-visual__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .about-visual__card:hover .about-visual__img {
      transform: scale(1.05);
    }
    .about-visual__overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: linear-gradient(to top, rgba(12,14,20,0.95) 0%, transparent 100%);
      padding: 2rem 1.5rem 1.5rem;
    }
    .about-visual__overlay h4 { font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0; }
    .about-visual__address {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: #9aa2b1;
      margin-top: 0.35rem;
    }
    .about-visual__address .material-symbols-outlined { font-size: 14px; }

    .about-badge {
      position: absolute;
      background: rgba(17,20,29,0.95);
      border: 1px solid rgba(40,46,61,0.8);
      border-radius: 16px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      backdrop-filter: blur(8px);
    }
    .about-badge--years {
      top: -1rem; right: -1rem;
      box-shadow: 0 8px 32px rgba(141,94,229,0.2);
      border-color: rgba(141,94,229,0.3);
    }
    .about-badge--rating {
      bottom: 1.5rem; left: -1rem;
      font-size: 1rem;
    }
    .about-badge__num { font-size: 1.6rem; font-weight: 900; color: #8f5ee5; }
    .about-badge__label { font-size: 0.65rem; color: #9aa2b1; text-align: center; }

    .about-text { display: flex; flex-direction: column; gap: 1.25rem; }
    .about-text .section-tag { display: inline-block; }
    .about-text .section-title { text-align: left; margin: 0; }
    .about-text__body { font-size: 0.92rem; color: #9aa2b1; line-height: 1.75; margin: 0; }
    .about-features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    @media(max-width:600px){ .about-features { grid-template-columns: 1fr; } }
    .about-feature {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .about-feature__icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .about-feature__title { font-size: 0.82rem; font-weight: 700; color: #fff; }
    .about-feature__desc { font-size: 0.73rem; color: #9aa2b1; margin-top: 0.1rem; }

    /* =====================================================
       VET CARDS GRID — 1 → 2 → 4 col
    ====================================================== */
    .vets-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media(min-width: 600px)  { .vets-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(min-width: 1024px) { .vets-grid { grid-template-columns: repeat(4, 1fr); } }
    .vet-card {
      background: rgba(17,20,29,0.8);
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .vet-card:hover {
      transform: translateY(-5px);
      border-color: rgba(27,196,117,0.3);
      box-shadow: 0 16px 48px rgba(27,196,117,0.08);
    }
    .vet-card__avatar-wrap { position: relative; display: inline-block; width: fit-content; }
    .vet-card__avatar-img {
      width: 72px; height: 72px;
      border-radius: 18px;
      object-fit: cover;
      border: 2px solid rgba(141,94,229,0.25);
      background: linear-gradient(135deg, rgba(141,94,229,0.2), rgba(27,196,117,0.15));
      display: block;
    }
    .vet-card__avatar {
      width: 72px; height: 72px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(141,94,229,0.2), rgba(27,196,117,0.15));
      border: 2px solid rgba(141,94,229,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
    }
    .vet-card__status-dot {
      position: absolute;
      bottom: 2px; right: 2px;
      width: 14px; height: 14px;
      background: #1bc475;
      border: 2px solid #11141d;
      border-radius: 50%;
    }
    .vet-card__specialty {
      display: inline-flex;
      padding: 0.2rem 0.65rem;
      background: rgba(27,196,117,0.1);
      border: 1px solid rgba(27,196,117,0.2);
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      color: #1bc475;
      letter-spacing: 0.04em;
      width: fit-content;
    }
    .vet-card__name { font-size: 1rem; font-weight: 700; color: #fff; margin: 0.25rem 0 0; }
    .vet-card__colegiatura, .vet-card__email {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: #9aa2b1;
      margin: 0;
    }
    .vet-card__colegiatura .material-symbols-outlined,
    .vet-card__email .material-symbols-outlined { font-size: 14px; color: #8f5ee5; }
    .vet-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(40,46,61,0.5);
    }
    .vet-card__available { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; font-weight: 600; color: #1bc475; }
    .vet-card__available-dot { width: 8px; height: 8px; background: #1bc475; border-radius: 50%; animation: ping 1.5s ease-in-out infinite; }

    /* =====================================================
       TESTIMONIALS
    ====================================================== */
    /* =====================================================
       TESTIMONIALS GRID — 1 → 2 → 4 col
    ====================================================== */
    .testimonials-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media(min-width: 600px)  { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(min-width: 1024px) { .testimonials-grid { grid-template-columns: repeat(4, 1fr); } }
    .testimonial-card {
      background: rgba(17,20,29,0.8);
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.3s, border-color 0.3s;
    }
    .testimonial-card:hover {
      transform: translateY(-4px);
      border-color: rgba(243,146,39,0.3);
    }
    .testimonial-card__stars { display: flex; gap: 2px; font-size: 0.85rem; }
    .testimonial-card__text { font-size: 0.85rem; color: #9aa2b1; line-height: 1.7; font-style: italic; flex: 1; }
    .testimonial-card__author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(40,46,61,0.5);
    }
    .testimonial-card__avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800;
      color: #fff; flex-shrink: 0;
    }
    .testimonial-card__name { font-size: 0.8rem; font-weight: 700; color: #fff; }
    .testimonial-card__pet { font-size: 0.7rem; color: #9aa2b1; }

    /* =====================================================
       INFO CARDS (Horario, Contacto, Especies, Infra)
       1 → 2 → 4 col grid
    ====================================================== */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media(min-width: 600px)  { .info-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(min-width: 1024px) { .info-grid { grid-template-columns: repeat(4, 1fr); } }
    .info-card {
      background: rgba(17,20,29,0.8);
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .info-card__icon { font-size: 2rem; }
    .info-card__title { font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0; }
    .info-card__schedule { display: flex; flex-direction: column; gap: 0.5rem; }
    .schedule-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: #9aa2b1;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(40,46,61,0.4);
    }
    .schedule-row strong { color: #fff; }
    .info-card__emergency {
      padding: 0.75rem 1rem;
      background: rgba(27,196,117,0.08);
      border: 1px solid rgba(27,196,117,0.2);
      border-radius: 10px;
      font-size: 0.8rem;
      color: #1bc475;
      font-weight: 600;
    }
    .info-card__contact-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .contact-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: #9aa2b1;
    }
    .contact-row .material-symbols-outlined { font-size: 16px; color: #8f5ee5; }
    .species-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .species-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.8rem;
      background: rgba(23,26,38,0.8);
      border: 1px solid rgba(40,46,61,0.5);
      border-radius: 10px;
    }
    .species-item__emoji { font-size: 1.2rem; }
    .species-item__name { font-size: 0.78rem; font-weight: 600; color: #f5f7fa; }

    /* =====================================================
       FORM / BOOKING
    ====================================================== */
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2.5rem;
    }
    .step-indicator__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }
    .step-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(40,46,61,0.8);
      background: rgba(17,20,29,0.9);
      color: #9aa2b1;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
      z-index: 2;
    }
    .step-btn--active {
      border-color: #8f5ee5;
      background: #8f5ee5;
      color: #fff;
      box-shadow: 0 0 20px rgba(141,94,229,0.4);
    }
    .step-btn--done {
      border-color: #1bc475;
      background: rgba(27,196,117,0.15);
      color: #1bc475;
    }
    .step-label { font-size: 0.72rem; font-weight: 600; color: #9aa2b1; white-space: nowrap; margin-left: 0.25rem; }
    .step-line {
      width: 60px; height: 2px;
      background: rgba(40,46,61,0.8);
      margin: 0 0.5rem;
      transition: background 0.3s;
    }
    .step-line--done { background: #1bc475; }
    @media(max-width:500px){ .step-label { display: none; } .step-line { width: 30px; } }

    .form-card {
      max-width: 700px;
      margin: 0 auto;
      background: rgba(17,20,29,0.9);
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 24px;
      padding: 2rem;
    }
    .form-step { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-step__title {
      display: flex; align-items: center; gap: 0.6rem;
      font-size: 1.05rem; font-weight: 700; color: #fff;
      margin: 0 0 0.25rem;
    }
    .form-grid { display: grid; gap: 1rem; }
    .form-grid--2 { grid-template-columns: 1fr 1fr; }
    @media(max-width:600px){ .form-grid--2 { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group--full { grid-column: 1 / -1; }
    .form-label { font-size: 0.78rem; font-weight: 600; color: #9aa2b1; }
    .form-input {
      background: rgba(23,26,38,0.9);
      border: 1px solid rgba(40,46,61,0.8);
      border-radius: 10px;
      padding: 0.65rem 0.9rem;
      color: #f5f7fa;
      font-size: 0.88rem;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s, box-shadow 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      border-color: #8f5ee5;
      box-shadow: 0 0 0 3px rgba(141,94,229,0.15);
    }
    .form-input::placeholder { color: #4a5060; }
    .form-textarea { resize: vertical; min-height: 80px; }
    select.form-input { cursor: pointer; }
    select.form-input option { background: #11141d; color: #f5f7fa; }
    .input-with-btn { display: flex; gap: 0.5rem; }
    .input-with-btn .form-input { flex: 1; }

    .radio-group { display: flex; gap: 1.5rem; padding-top: 0.25rem; }
    .radio-option {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.85rem; color: #9aa2b1; cursor: pointer;
    }
    .radio-option input { accent-color: #8f5ee5; }

    .form-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .form-actions--right  { justify-content: flex-end; }
    .form-actions--between { justify-content: space-between; }

    /* =====================================================
       BUTTONS
    ====================================================== */
    .btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      font-size: 0.875rem; font-weight: 600;
      cursor: pointer; border: none;
      text-decoration: none;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
      white-space: nowrap;
    }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary {
      background: linear-gradient(135deg, #7d44e0, #8f5ee5);
      color: #fff;
      box-shadow: 0 4px 16px rgba(141,94,229,0.3);
    }
    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 8px 24px rgba(141,94,229,0.4);
      transform: translateY(-1px);
    }
    .btn-ghost {
      background: rgba(40,46,61,0.5);
      border: 1px solid rgba(40,46,61,0.8);
      color: #9aa2b1;
    }
    .btn-ghost:hover:not(:disabled) { background: rgba(40,46,61,0.8); color: #fff; }
    .btn-outline {
      background: transparent;
      border: 1px solid rgba(141,94,229,0.4);
      color: #8f5ee5;
    }
    .btn-outline:hover:not(:disabled) { background: rgba(141,94,229,0.1); }
    .btn-lg { padding: 0.85rem 1.75rem; font-size: 1rem; border-radius: 12px; }
    .btn-sm { padding: 0.4rem 0.85rem; font-size: 0.78rem; border-radius: 8px; }
    .w-full { width: 100%; justify-content: center; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn .material-symbols-outlined { font-size: 18px; }

    /* =====================================================
       SUCCESS MODAL
    ====================================================== */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
    }
    .modal-card {
      background: rgba(17,20,29,0.98);
      border: 1px solid rgba(40,46,61,0.8);
      border-radius: 28px;
      padding: 2.5rem;
      max-width: 520px; width: 100%;
      display: flex; flex-direction: column;
      align-items: center; gap: 1.25rem;
      text-align: center;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5);
    }
    .modal-icon { font-size: 3.5rem; }
    .modal-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; }
    .modal-sub { font-size: 0.85rem; color: #9aa2b1; line-height: 1.7; margin: 0; max-width: 380px; }
    .booking-ticket {
      width: 100%;
      background: rgba(23,26,38,0.9);
      border: 1px solid rgba(40,46,61,0.7);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.75rem;
    }
    .ticket-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.8rem; color: #9aa2b1;
    }
    .ticket-label { font-weight: 600; }
    .ticket-code { font-family: monospace; font-size: 1rem; color: #1bc475; letter-spacing: 0.08em; }

    /* =====================================================
       FOOTER
    ====================================================== */
    .footer {
      background: rgba(11,13,18,0.98);
      border-top: 1px solid rgba(40,46,61,0.5);
      padding: 4rem 0 2rem;
      scroll-margin-top: 72px;
    }
    .footer__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      margin-bottom: 2.5rem;
    }
    @media(min-width:700px){ .footer__grid { grid-template-columns: 2fr 1fr 1fr 1fr; } }
    .footer-brand__logo { font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem; }
    .footer-brand__desc { font-size: 0.8rem; color: #9aa2b1; line-height: 1.7; max-width: 240px; }
    .footer-brand__copy { font-size: 0.7rem; color: #8f5ee5; margin-top: 0.75rem; }
    .footer-col { display: flex; flex-direction: column; gap: 0.6rem; }
    .footer-col__title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #fff; margin-bottom: 0.25rem; }
    .footer-link { font-size: 0.8rem; color: #9aa2b1; text-decoration: none; transition: color 0.2s; }
    .footer-link:hover { color: #fff; }
    .footer-text { font-size: 0.8rem; color: #9aa2b1; }
    .footer-emerg { font-size: 0.8rem; color: #1bc475; font-weight: 600; margin-top: 0.25rem; }
    .footer__bottom {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(40,46,61,0.4);
    }
    .footer__links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .footer__credit { font-size: 0.72rem; color: #9aa2b1; }

    /* =====================================================
       SKELETON LOADERS
    ====================================================== */
    .skeleton-card {
      background: rgba(17,20,29,0.8);
      border: 1px solid rgba(40,46,61,0.5);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .skeleton {
      background: linear-gradient(90deg, rgba(40,46,61,0.4) 25%, rgba(40,46,61,0.7) 50%, rgba(40,46,61,0.4) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton--icon  { width: 52px; height: 52px; border-radius: 14px; }
    .skeleton--avatar { width: 72px; height: 72px; border-radius: 18px; }
    .skeleton--title { height: 20px; width: 65%; border-radius: 6px; }
    .skeleton--text  { height: 14px; width: 100%; border-radius: 4px; }
    .skeleton--text.short { width: 60%; }
    .skeleton--sm { height: 44px; border-radius: 12px; }

    /* =====================================================
       EMPTY STATE
    ====================================================== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      text-align: center;
      color: #9aa2b1;
      font-size: 0.88rem;
    }
    .empty-state__icon { font-size: 3rem; opacity: 0.5; }

    /* =====================================================
       ANIMATIONS & REVEAL
    ====================================================== */
    .fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .scale-in {
      animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to   { opacity: 1; transform: scale(1); }
    }

    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.visible {
      opacity: 1;
      transform: none;
    }
    .reveal-left {
      opacity: 0;
      transform: translateX(-30px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal-left.visible { opacity: 1; transform: none; }
    .reveal-right {
      opacity: 0;
      transform: translateX(30px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal-right.visible { opacity: 1; transform: none; }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  // ── Reactive state ──────────────────────────────────────────────
  formStep      = signal(1);
  isSubmitting  = signal(false);
  showSuccess   = signal(false);

  // ── API data ────────────────────────────────────────────────────
  services: Servicio[]      = [];
  vets: Veterinario[]       = [];
  heroServices: { icon: string; name: string; price: string }[] = [];
  loadingServices = true;
  loadingVets     = true;

  // ── Mock data ────────────────────────────────────────────────────
  mockServices: Servicio[] = [
    {
      idServicio: 1,
      nombre: 'Consulta Veterinaria General',
      descripcion: 'Evaluación exhaustiva del estado de salud de tu mascota con diagnóstico integral y recomendaciones personalizadas.',
      precio: 45.00,
      duracionMinutos: 30,
      estado: true
    },
    {
      idServicio: 2,
      nombre: 'Vacunación y Salud Preventiva',
      descripcion: 'Administración de vacunas esenciales (Triple Felina, Parvovirus, Rabia) con registro digital y control de dosis.',
      precio: 60.00,
      duracionMinutos: 20,
      estado: true
    },
    {
      idServicio: 3,
      nombre: 'Cirugía y Quirófano Especializado',
      descripcion: 'Procedimientos quirúrgicos generales y especializados en quirófano estéril con monitoreo anestésico avanzado.',
      precio: 350.00,
      duracionMinutos: 120,
      estado: true
    },
    {
      idServicio: 4,
      nombre: 'Ecografía y Diagnóstico Digital',
      descripcion: 'Diagnóstico por imágenes abdominales o torácicas en tiempo real para detección precoz de patologías.',
      precio: 85.00,
      duracionMinutos: 45,
      estado: true
    },
    {
      idServicio: 5,
      nombre: 'Profilaxis y Limpieza Dental',
      descripcion: 'Limpieza dental profunda por ultrasonido, pulido y tratamiento periodontal para un aliento sano.',
      precio: 120.00,
      duracionMinutos: 60,
      estado: true
    },
    {
      idServicio: 6,
      nombre: 'Grooming y Baño Medicado',
      descripcion: 'Cuidado estético e higiénico con baños dermatológicos, corte de pelo, limpieza de oídos y corte de uñas.',
      precio: 55.00,
      duracionMinutos: 90,
      estado: true
    },
    {
      idServicio: 7,
      nombre: 'Laboratorio Clínico Express',
      descripcion: 'Análisis clínicos de sangre, orina y raspados microbiológicos con resultados rápidos el mismo día.',
      precio: 75.00,
      duracionMinutos: 30,
      estado: true
    },
    {
      idServicio: 8,
      nombre: 'Hospedaje y Cuidados Médicos',
      descripcion: 'Monitoreo profesional y pensión completa con alimentación balanceada en cubículos separados y confortables.',
      precio: 90.00,
      duracionMinutos: 1440,
      estado: true
    },
    {
      idServicio: 9,
      nombre: 'Nutrición y Dietética Veterinaria',
      descripcion: 'Planes nutricionales a medida, control de obesidad, dietas especiales y asesoramiento para alimentación natural o barf.',
      precio: 65.00,
      duracionMinutos: 45,
      estado: true
    }
  ];

  mockVets: Veterinario[] = [
    {
      idVeterinario: 1,
      especialidad: 'Cirugía y Traumatología',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      nombres: 'Alejandro',
      apellidoPaterno: 'Toledo',
      apellidoMaterno: 'Mendoza',
      nombreCompleto: 'Alejandro Toledo Mendoza',
      telefono: '987654321',
      correo: 'a.toledo@vetcare.com',
      numeroColegiatura: 'CMVP 8291',
      direccion: 'Av. Larco 123, Miraflores',
      estado: true
    },
    {
      idVeterinario: 2,
      especialidad: 'Medicina Felina y Cardiología',
      tipoDocumento: 'DNI',
      numeroDocumento: '23456789',
      nombres: 'Valeria',
      apellidoPaterno: 'Espinoza',
      apellidoMaterno: 'Rojas',
      nombreCompleto: 'Valeria Espinoza Rojas',
      telefono: '987654322',
      correo: 'v.espinoza@vetcare.com',
      numeroColegiatura: 'CMVP 9142',
      direccion: 'Calle Los Pinos 456, San Isidro',
      estado: true
    },
    {
      idVeterinario: 3,
      especialidad: 'Dermatología Veterinaria',
      tipoDocumento: 'DNI',
      numeroDocumento: '34567890',
      nombres: 'Camila',
      apellidoPaterno: 'Alva',
      apellidoMaterno: 'Castillo',
      nombreCompleto: 'Camila Alva Castillo',
      telefono: '987654323',
      correo: 'c.alva@vetcare.com',
      numeroColegiatura: 'CMVP 10394',
      direccion: 'Av. Primavera 789, Surco',
      estado: true
    },
    {
      idVeterinario: 4,
      especialidad: 'Medicina Preventiva y Diagnóstico',
      tipoDocumento: 'DNI',
      numeroDocumento: '45678901',
      nombres: 'Mateo',
      apellidoPaterno: 'Rossi',
      apellidoMaterno: 'Vidal',
      nombreCompleto: 'Mateo Rossi Vidal',
      telefono: '987654324',
      correo: 'm.rossi@vetcare.com',
      numeroColegiatura: 'CMVP 7583',
      direccion: 'Av. Javier Prado 101, San Borja',
      estado: true
    }
  ];

  // ── Booking form ────────────────────────────────────────────────
  booking = this.emptyBooking();
  bookingCode = '';
  todayStr = '';

  // ── UI state ────────────────────────────────────────────────────
  scrolled    = false;
  mobileOpen  = false;
  stepLabels  = ['Datos del Dueño', 'Tu Mascota', 'Detalles Cita'];

  timeSlots = [
    '08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM',
    '11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM',
    '03:30 PM','04:00 PM','04:30 PM','05:00 PM','05:30 PM'
  ];

  aboutFeatures = [
    { icon: '🔬', title: 'Laboratorio Propio',   desc: 'Resultados en pocas horas sin envíos externos.' },
    { icon: '🩻', title: 'Imágenes Digitales',   desc: 'Radiografías y ecografías de alta definición.' },
    { icon: '💉', title: 'Vacunas Certificadas', desc: 'Lotes vigentes con registro digital inmediato.' },
    { icon: '🏥', title: 'Quirófano Estéril',    desc: 'Cirugías con estándares internacionales de asepsia.' },
    { icon: '📱', title: 'Historial Digital',    desc: 'Acceso online al historial clínico completo.' },
    { icon: '🚑', title: 'Urgencias 24/7',       desc: 'Atención inmediata sin importar la hora.' },
  ];

  testimonials = [
    {
      text: 'El Dr. Rivera operó de emergencia a mi perro Max y la recuperación fue increíble. El equipo nos mantuvo informados en todo momento.',
      name: 'Alejandro Herrera', pet: 'Dueño de Max 🐕 (Boxer)',
      initials: 'AH', color: 'rgba(141,94,229,0.5)'
    },
    {
      text: 'El servicio de vacunación es espectacular. Todo queda digitalizado y me envían recordatorios para la siguiente dosis de mi gata Luna.',
      name: 'Beatriz Ponce', pet: 'Dueña de Luna 🐈 (Siamés)',
      initials: 'BP', color: 'rgba(27,196,117,0.5)'
    },
    {
      text: 'Diagnóstico exacto y tratamiento efectivo para Toby en pocos días. La atención y los precios son justos. ¡Altamente recomendada!',
      name: 'Gustavo Ortiz', pet: 'Dueño de Toby 🐩 (Poodle)',
      initials: 'GO', color: 'rgba(243,146,39,0.5)'
    },
    {
      text: 'Excelente clínica, la mejor atención para animales exóticos. Trataron a mi conejo Tambor de manera muy dulce y profesional.',
      name: 'Daniela Flores', pet: 'Dueña de Tambor 🐇 (Conejo)',
      initials: 'DF', color: 'rgba(235,68,90,0.5)'
    },
  ];

  species = [
    { emoji: '🐕', name: 'Perros' },
    { emoji: '🐈', name: 'Gatos' },
    { emoji: '🐦', name: 'Aves' },
    { emoji: '🐇', name: 'Conejos' },
    { emoji: '🐹', name: 'Roedores' },
    { emoji: '🦎', name: 'Reptiles' },
  ];

  private observer!: IntersectionObserver;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const today = new Date();
    this.todayStr = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadData();
    this.setupRevealObserver();
    this.animateHero();
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
  }

  // ================================================================
  //  DATA LOADING
  // ================================================================
  loadData(): void {
    // Load services from mock data
    this.services = [...this.mockServices];
    this.heroServices = this.services.slice(0, 3).map(s => ({
      icon: this.getServiceEmoji(s.nombre),
      name: s.nombre,
      price: s.precio.toFixed(2)
    }));
    this.loadingServices = false;

    // Load vets from mock data
    this.vets = [...this.mockVets];
    this.loadingVets = false;
  }

  // ================================================================
  //  ANIMATIONS
  // ================================================================
  animateHero(): void {
    setTimeout(() => {
      if (typeof gsap === 'undefined') return;
      const tl = gsap.timeline();

      // Hero text elements stagger in
      tl.fromTo('.hero-text > *',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }
      );

      // Hero card
      tl.fromTo('.hero-card',
        { opacity: 0, x: 40, scale: 0.96 },
        { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power3.out' },
        '-=0.5'
      );

      // Trust bar
      tl.fromTo('.trust-bar',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      );
    }, 120);
  }

  setupRevealObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.style.animationDelay
              ? parseFloat(el.style.animationDelay) * 1000
              : 0;
            setTimeout(() => el.classList.add('visible'), delay);
            this.observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    // Observe after render
    setTimeout(() => {
      const targets = this.el.nativeElement.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      targets.forEach((t: Element) => this.observer.observe(t));
    }, 200);
  }

  // ================================================================
  //  NAVBAR
  // ================================================================
  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 30;
  }

  toggleMobileMenu(): void { this.mobileOpen = !this.mobileOpen; }
  closeMobileMenu(): void  { this.mobileOpen = false; }

  scrollTo(id: string): void {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const navbarHeight = 72; // fixed navbar height in px (matching scroll-margin-top)
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  }

  // ================================================================
  //  AUTH
  // ================================================================
  isAuthenticated(): boolean { return this.authService.isAuthenticated(); }

  // ================================================================
  //  HELPERS — EMOJI / DESC
  // ================================================================
  getServiceEmoji(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('consult') || n.includes('general')) return '🩺';
    if (n.includes('vacun'))                             return '💉';
    if (n.includes('desparasit') || n.includes('parásit')) return '🦠';
    if (n.includes('radiograf') || n.includes('imagen')) return '🩻';
    if (n.includes('ecograf') || n.includes('ultrason')) return '📡';
    if (n.includes('cirugía') || n.includes('cirugia') || n.includes('castrac')) return '🔪';
    if (n.includes('dental') || n.includes('dient'))    return '🦷';
    if (n.includes('baño') || n.includes('groomin'))    return '🛁';
    if (n.includes('hospedaje') || n.includes('pension')) return '🏨';
    if (n.includes('laboratorio') || n.includes('análisis')) return '🔬';
    if (n.includes('emergencia') || n.includes('urgencia')) return '🚑';
    if (n.includes('nutri') || n.includes('diet'))       return '🥗';
    return '🐾';
  }

  getServiceDefaultDesc(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('consult'))  return 'Evaluación completa del estado de salud de tu mascota con diagnóstico integral.';
    if (n.includes('vacun'))    return 'Administración de vacunas esenciales con registro digital de lotes y próximas dosis.';
    if (n.includes('desparasit')) return 'Tratamiento antiparasitario interno y externo ajustado al peso de tu mascota.';
    if (n.includes('radiograf')) return 'Diagnóstico por imágenes de alta definición ósea y de órganos.';
    if (n.includes('ecograf'))  return 'Ecografía abdominal o torácica en tiempo real para diagnóstico preciso.';
    if (n.includes('cirugía') || n.includes('cirugia')) return 'Procedimiento quirúrgico en quirófano estéril con anestesia monitoreada.';
    return 'Servicio veterinario especializado realizado por nuestro equipo certificado.';
  }

  getVetAvatar(nombres: string): string {
    const avatars: { [key: string]: string } = {
      'a': '👨‍⚕️', 'b': '👩‍⚕️', 'c': '👨‍⚕️', 'd': '👩‍⚕️',
      'e': '👨‍⚕️', 'f': '👩‍⚕️', 'g': '👨‍⚕️', 'h': '👩‍⚕️',
    };
    const initial = nombres?.charAt(0)?.toLowerCase() || 'a';
    // Use initials instead of emoji for cleaner look
    return nombres ? nombres.charAt(0).toUpperCase() : '👨‍⚕️';
  }

  getVetPhoto(index: number): string {
    const photos = [
      '/images/vet_doctor_1.png',
      '/images/vet_doctor_2.png',
      '/images/vet_doctor_3.png',
      '/images/vet_doctor_4.png',
    ];
    return photos[index % photos.length];
  }

  // ================================================================
  //  FORM STEPS
  // ================================================================
  goToStep(step: number): void {
    if (step === 1) this.formStep.set(1);
    else if (step === 2 && this.step1Valid()) this.formStep.set(2);
    else if (step === 3 && this.step1Valid() && this.step2Valid()) this.formStep.set(3);
  }
  nextStep(): void {
    const c = this.formStep();
    if (c === 1 && this.step1Valid()) this.formStep.set(2);
    else if (c === 2 && this.step2Valid()) this.formStep.set(3);
  }
  prevStep(): void {
    if (this.formStep() > 1) this.formStep.set(this.formStep() - 1);
  }

  step1Valid(): boolean {
    return (
      this.booking.dni.length >= 8 &&
      this.booking.nombres.trim().length > 0 &&
      this.booking.apellidos.trim().length > 0 &&
      this.booking.telefono.trim().length >= 9 &&
      this.booking.correo.includes('@')
    );
  }
  step2Valid(): boolean {
    return (
      this.booking.nombreMascota.trim().length > 0 &&
      this.booking.especie.trim().length > 0
    );
  }
  step3Valid(): boolean {
    return (
      this.booking.idServicio !== '' &&
      this.booking.fecha !== '' &&
      this.booking.hora !== ''
    );
  }

  searchDni(): void {
    if (this.booking.dni.length < 8) return;
    this.dataService.consultarDni(this.booking.dni).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.booking.nombres   = res.data.nombres || '';
          this.booking.apellidos = `${res.data.apellidoPaterno || ''} ${res.data.apellidoMaterno || ''}`.trim();
        }
      },
      error: () => {} // silently fail
    });
  }

  submitBooking(): void {
    if (!this.step1Valid() || !this.step2Valid() || !this.step3Valid()) return;
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      const prefix = this.booking.especie === 'Perro' ? 'CAN'
                   : this.booking.especie === 'Gato'  ? 'FEL' : 'VET';
      const hex = Math.floor(0x100000 + Math.random() * 0x900000).toString(16).toUpperCase();
      this.bookingCode = `${prefix}-${hex}`;
      this.showSuccess.set(true);
    }, 1600);
  }

  closeSuccess(): void {
    this.showSuccess.set(false);
    this.booking = this.emptyBooking();
    this.formStep.set(1);
  }

  getServiceName(): string {
    const id = Number(this.booking.idServicio);
    return this.services.find(s => s.idServicio === id)?.nombre || 'Consulta Médica';
  }

  private emptyBooking() {
    return {
      dni: '', nombres: '', apellidos: '',
      telefono: '', correo: '',
      nombreMascota: '', especie: 'Perro',
      raza: '', sexo: 'M', peso: '', edad: '',
      idServicio: '', idVeterinario: '',
      fecha: '', hora: '', motivo: ''
    };
  }
}
