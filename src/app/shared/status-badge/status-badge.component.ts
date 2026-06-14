import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="getBadgeClass()">
      {{ status || 'Unknown' }}
    </span>
  `,
  styles: [`
    .badge-base {
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      border: 1px solid transparent;
    }
    .status-running { background-color: white; color: green; }
    .status-maintenance { background-color: white; color: orange;  }
    .status-stopped { background-color: white; color: red;  }
    .status-default { background-color: white; color: brown;}
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  getBadgeClass(): string {
    const text = this.status?.toLowerCase().trim();
    if (text === 'running') return 'badge-base status-running';
    if (text === 'maintenance') return 'badge-base status-maintenance';
    if (text === 'stopped') return 'badge-base status-stopped';
    return 'badge-base status-default';
  }
}