import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../services/device.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private deviceService: DeviceService) { 
    this.loadDevices();
  }
devices: any[] = [];

selectedDevice: any;

// Method to load devices from the API
loadDevices() {

  if (this.devices.length) {
    return;
  }

  this.deviceService.getDevices()
    .subscribe({
      next: (response: any) => {
        this.devices = response;
        console.log('Devices loaded successfully:', this.devices);
      }
    });
}

// Method to handle device selection
selectDevice(device: any) {
  this.selectedDevice = device;
  console.log('Selected device:', this.selectedDevice);
}
}
