import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../services/device.service';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { EventService } from '../services/event.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Reference to the chart container in the template
    @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  constructor(private deviceService: DeviceService, private eventService: EventService) { 
    this.loadDevices();
  }
devices: any[] = [];
  chartData: any[] = [];

  svg: any;

selectedDevice: any;


  ngOnInit(): void {
    this.createChart();
    this.drawChart();
  }

  ngOnChanges(): void {
    if (this.svg) {
      this.drawChart();
    }
  }
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
  this.createChart()
  this.startMonitoring(this.selectedDevice);
}
  startMonitoring(deviceId: string) {

    this.chartData = [];

  this.eventService
    .connect(deviceId)
    .subscribe((data: any) => {

      if (data.status !== 'running') {
        return;
      }

      this.chartData.push({
        timestamp: data.timestamp,
        partsPerMinute: data.partsPerMinute,
        status: data.status,
        deviceId: data.deviceId,
        order: data.order
      });

      if (this.chartData.length > 20) {
        this.chartData.shift();
      }

      this.drawChart();
    });
  }

createChart(): void {
    this.svg = d3.select(this.chartContainer.nativeElement);
}

private drawChart(): void {
  // Clear previous chart
  d3.select(this.chartContainer.nativeElement).html('');

  // Exit if no data
  if (!this.chartData?.length) return;

  // DIMENSIONS 
  const width    = 700;
  const height   = 200;
  const margin   = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW   = width  - margin.left - margin.right;
  const innerH   = height - margin.top  - margin.bottom;

  // CREATE SVG 
  const svg = d3.select(this.chartContainer.nativeElement)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('width', '100%')
    .style('height', 'auto')
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  //X SCALE time scale
  const x = d3.scaleTime()
    .range([0, innerW])
    .domain(d3.extent(this.chartData, d => new Date(d.timestamp)) as [Date, Date]);

  //Y SCALE (Parts Per Minute)
  const yMin = d3.min(this.chartData, d => d.partsPerMinute) - 5;
  const yMax = d3.max(this.chartData, d => d.partsPerMinute) + 5;

  const y = d3.scaleLinear()
    .range([innerH, 0])
    .domain([yMin, yMax]);

  //X AXIS (hh:mm:ss)
  svg.append('g')
    .attr('transform', `translate(0, ${innerH})`)
    .call(
      d3.axisBottom(x)
        .ticks(6)
        .tickFormat(d3.timeFormat('%H:%M:%S') as any)
    )
    .selectAll('text')
    .attr('fill', '#6b7280')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle');

  //Y AXIS 
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .attr('fill', '#6b7280')
    .attr('font-size', '10px');

  // GRID LINES (horizontal) 
  svg.append('g')
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(-innerW)
        .tickFormat('' as any)
    )
    .selectAll('line')
    .attr('stroke', '#e5e7eb')
    .attr('stroke-dasharray', '3,3');

  // remove grid border
  svg.selectAll('.domain').attr('stroke', 'none');

  //AREA FILL 
  const area = d3.area<any>()
    .x(d => x(new Date(d.timestamp)))
    .y0(innerH)
    .y1(d => y(d.partsPerMinute));

  svg.append('path')
    .datum(this.chartData)
    .attr('fill', '#eff6ff')
    .attr('fill-opacity', 0.9)
    .attr('d', area);

  // LINE
  const line = d3.line<any>()
    .x(d => x(new Date(d.timestamp)))
    .y(d => y(d.partsPerMinute));

  svg.append('path')
    .datum(this.chartData)
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 1.5)
    .attr('d', line);

  //LAST DATA POINT DOT 
  const last = this.chartData[this.chartData.length - 1];

  svg.append('circle')
    .attr('cx', x(new Date(last.timestamp)))
    .attr('cy', y(last.partsPerMinute))
    .attr('r', 4)
    .attr('fill', '#3b82f6')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5);
}
  
  
}



