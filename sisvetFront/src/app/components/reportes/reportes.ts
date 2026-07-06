import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Cita, Cliente, Mascota } from '../../services/data';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-lg">
      
      <!-- Page Header -->
      <div>
        <h2 class="text-headline-lg font-headline-lg text-on-surface font-bold">Generación de Reportes</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mt-1">
          Genere reportes detallados en formatos PDF y Excel mediante el motor de JasperReports.
        </p>
      </div>

      <!-- Main Config Card -->
      <div class="card max-w-2xl flex flex-col gap-lg">
        <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-xs border-b border-outline-variant/30 pb-sm">Configuración del Reporte</h3>
        
        <div class="flex flex-col gap-md">
          <!-- Report Type -->
          <div class="form-group">
            <label for="tipoReporte">Tipo de Reporte</label>
            <select 
              id="tipoReporte" 
              [(ngModel)]="selectedType" 
              class="form-control">
              <option value="citas_dia">Citas del Día</option>
              <option value="citas_fechas">Citas por Rango de Fechas</option>
              <option value="clientes">Clientes Registrados</option>
              <option value="mascotas">Mascotas Registradas</option>
              <option value="vacunas">Vacunas Próximas a Vencer</option>
            </select>
          </div>

          <!-- Date Filters (Only shown if dates are relevant) -->
          <div class="grid-2" *ngIf="selectedType() === 'citas_fechas'">
            <div class="form-group">
              <label for="fechaInicio">Fecha Inicio</label>
              <input 
                type="date" 
                id="fechaInicio" 
                [(ngModel)]="fechaInicio" 
                class="form-control">
            </div>
            <div class="form-group">
              <label for="fechaFin">Fecha Fin</label>
              <input 
                type="date" 
                id="fechaFin" 
                [(ngModel)]="fechaFin" 
                class="form-control">
            </div>
          </div>

          <!-- Export Format -->
          <div class="form-group">
            <label>Formato de Salida</label>
            <div class="flex gap-md mt-sm">
              <label class="flex items-center gap-sm cursor-pointer text-body-sm text-on-surface font-medium">
                <input 
                  type="radio" 
                  name="formato" 
                  value="PDF" 
                  [(ngModel)]="selectedFormat" 
                  class="w-4 h-4 bg-surface text-primary border-outline-variant focus:ring-primary">
                <span class="flex items-center gap-xs">
                  <span class="material-symbols-outlined text-red-500 text-[18px]">picture_as_pdf</span>
                  Documento PDF (.pdf)
                </span>
              </label>
              <label class="flex items-center gap-sm cursor-pointer text-body-sm text-on-surface font-medium">
                <input 
                  type="radio" 
                  name="formato" 
                  value="EXCEL" 
                  [(ngModel)]="selectedFormat" 
                  class="w-4 h-4 bg-surface text-primary border-outline-variant focus:ring-primary">
                <span class="flex items-center gap-xs">
                  <span class="material-symbols-outlined text-green-500 text-[18px]">table_view</span>
                  Hoja de Excel (.csv/.xlsx)
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-sm border-t border-outline-variant/30 pt-md mt-sm">
          <button 
            (click)="generateReport()" 
            [disabled]="isGenerating()"
            class="btn btn-primary min-w-[160px]">
            <span class="material-symbols-outlined text-[20px]" *ngIf="!isGenerating()">download</span>
            <span class="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4 mr-2" *ngIf="isGenerating()"></span>
            {{ isGenerating() ? 'Generando...' : 'Generar Reporte' }}
          </button>
        </div>
      </div>

      <!-- Feedback / Logs (Jasper Sim) -->
      <div *ngIf="isGenerating() || logMessage()" class="card bg-surface-container/30 border border-outline-variant border-dashed max-w-2xl p-md flex flex-col gap-xs font-mono text-xs text-on-surface-variant">
        <p class="text-primary font-semibold">⚡ JasperReports Server v8.2.0 - Connection Status: OK</p>
        <p class="text-on-surface-variant">{{ logMessage() }}</p>
      </div>

    </div>
  `
})
export class ReportesComponent {
  private dataService = inject(DataService);

  selectedType = signal<string>('citas_dia');
  fechaInicio = signal<string>(new Date().toISOString().substring(0, 10));
  fechaFin = signal<string>(new Date().toISOString().substring(0, 10));
  selectedFormat = signal<'PDF' | 'EXCEL'>('PDF');

  isGenerating = signal<boolean>(false);
  logMessage = signal<string>('');

  generateReport(): void {
    this.isGenerating.set(true);
    this.logMessage.set('Compilando plantilla jrxml en el servidor JasperReports...');
    
    setTimeout(() => {
      this.logMessage.set('Conectando con la base de datos SQL Server y ejecutando query...');
      
      setTimeout(() => {
        this.logMessage.set('Llenando el reporte con los parámetros provistos...');
        
        setTimeout(() => {
          this.logMessage.set('Exportando datos al formato ' + this.selectedFormat() + '...');
          
          setTimeout(() => {
            this.exportData();
          }, 600);
        }, 500);
      }, 500);
    }, 600);
  }

  private exportData(): void {
    const type = this.selectedType();
    const format = this.selectedFormat();

    if (type === 'citas_dia') {
      this.dataService.getCitas(0, 100).subscribe(res => {
        if (res.success && res.data && res.data.content) {
          const todayStr = new Date().toDateString();
          const list = res.data.content.filter(c => c.fechaHora && new Date(c.fechaHora).toDateString() === todayStr);
          this.download(list, 'Reporte_Citas_Del_Dia', format);
        }
      });
    } else if (type === 'citas_fechas') {
      this.dataService.getCitas(0, 100).subscribe(res => {
        if (res.success && res.data && res.data.content) {
          const start = new Date(this.fechaInicio() + 'T00:00:00');
          const end = new Date(this.fechaFin() + 'T23:59:59');
          const list = res.data.content.filter(c => {
            if (!c.fechaHora) return false;
            const d = new Date(c.fechaHora);
            return d >= start && d <= end;
          });
          this.download(list, 'Reporte_Citas_Rango_Fechas', format);
        }
      });
    } else if (type === 'clientes') {
      this.dataService.getClientes(0, 100).subscribe(res => {
        if (res.success && res.data && res.data.content) {
          this.download(res.data.content, 'Reporte_Clientes_Registrados', format);
        }
      });
    } else if (type === 'mascotas') {
      this.dataService.getMascotas(0, 100).subscribe(res => {
        if (res.success && res.data && res.data.content) {
          this.download(res.data.content, 'Reporte_Mascotas_Registradas', format);
        }
      });
    } else if (type === 'vacunas') {
      this.dataService.getMascotaVacunas(0, 100).subscribe(res => {
        if (res.success && res.data && res.data.content) {
          const today = new Date();
          const list = res.data.content.filter(mv => {
            if (!mv.proximaDosis) return false;
            const proximaDate = new Date(mv.proximaDosis);
            const diffTime = proximaDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 15; // Within 15 days
          });
          this.download(list, 'Reporte_Vacunas_Proximas', format);
        }
      });
    }
  }

  private download(data: any[], filename: string, format: 'PDF' | 'EXCEL'): void {
    this.isGenerating.set(false);
    this.logMessage.set('Reporte generado exitosamente.');

    if (format === 'EXCEL') {
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF print window helper
      this.printPDFWindow(data, filename);
    }
  }

  private convertToCSV(objArray: any[]): string {
    if (objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    
    // Header
    const keys = Object.keys(array[0]).filter(k => typeof array[0][k] !== 'object');
    str += keys.join(',') + '\r\n';

    // Rows
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index = 0; index < keys.length; index++) {
        if (line !== '') line += ',';
        const val = array[i][keys[index]];
        line += val !== null && val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : '""';
      }
      str += line + '\r\n';
    }
    return str;
  }

  private printPDFWindow(data: any[], reportName: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let headersHTML = '';
    let rowsHTML = '';
    let title = reportName.replace(/_/g, ' ');

    if (data.length > 0) {
      const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object' && k !== 'id' && !k.toLowerCase().includes('id'));
      
      headersHTML = keys.map(k => `<th>${k.toUpperCase()}</th>`).join('');
      
      rowsHTML = data.map(row => {
        return `<tr>${keys.map(k => `<td>${row[k] !== undefined && row[k] !== null ? row[k] : ''}</td>`).join('')}</tr>`;
      }).join('');
    } else {
      headersHTML = '<th>Mensaje</th>';
      rowsHTML = '<tr><td>No se encontraron registros para este reporte.</td></tr>';
    }

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .logo-cell { font-size: 24px; font-weight: bold; color: #6200ee; }
            .title-cell { text-align: right; font-size: 18px; font-weight: bold; color: #555; }
            .subtitle { font-size: 12px; color: #888; text-align: right; margin-top: 5px; }
            .divider { height: 2px; bg-color: #6200ee; background: #6200ee; margin-bottom: 30px; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            .report-table th { background-color: #f5f5f5; color: #555; border: 1px solid #ddd; padding: 10px; font-weight: bold; text-align: left; }
            .report-table td { border: 1px solid #ddd; padding: 10px; }
            .report-table tr:nth-child(even) { background-color: #fafafa; }
            .footer { margin-top: 50px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="logo-cell">VetCare Clínica Veterinaria</td>
              <td class="title-cell">
                <div>${title}</div>
                <div class="subtitle">Generado el: ${new Date().toLocaleString('es-PE')}</div>
              </td>
            </tr>
          </table>
          <div class="divider"></div>
          
          <table class="report-table">
            <thead>
              <tr>${headersHTML}</tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>

          <div class="footer">
            <span>Reportes e Indicadores SisVet v1.0.0</span>
            <span>Tecnología de Reportes JasperReports Engine (Simulated)</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
