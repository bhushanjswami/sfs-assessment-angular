import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dashboard';
  environment = '';

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    const config = this.configService.getConfig();
    this.environment = config.environment;
  }
}
