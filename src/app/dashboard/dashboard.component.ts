import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { DeviceService } from '../services/device.service';
import { EventService } from '../services/event.service';
import { OrderService } from '../services/order.service';
import { StatusBadgeComponent } from '../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('partsProducedContainer') partsProducedContainer!: ElementRef;

  devices: any = [];
  chartData: any[] = [];
  interrupts: any[] = [];
  order: any = null;
  selectedDevice = '';
  orderVal: number | null = null;
  
  private lastOrderId: string | null = null;
  private lastStatus: string | null = null;

  constructor(
    private deviceService: DeviceService,
    private eventService: EventService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  // Life cycle hook 
  ngOnInit(): void {
    this.loadDevices();
  }

  // Method to load initial devices in dropdown
  loadDevices() {
    this.deviceService.getDevices().subscribe(res => {
      this.devices = res;
      this.cdr.detectChanges();
    });
  }

  // Method called on submit button
  selectDevice(device: string) {
    if (!device) return;

    this.selectedDevice = device;
    this.chartData = [];
    this.interrupts = [];
    this.order = null;
    this.orderVal = null;
    this.lastOrderId = null;
    this.lastStatus = null;

    if (this.chartContainer?.nativeElement) this.chartContainer.nativeElement.innerHTML = '';
    if (this.partsProducedContainer?.nativeElement) this.partsProducedContainer.nativeElement.innerHTML = '';

    this.cdr.detectChanges();
    this.startMonitoring(device);
  }

  // Method to update data for charts
  startMonitoring(deviceId: string) {
    this.eventService.connect(deviceId).subscribe(data => {
      if (!data) return;

      const currentStatus = data.status;
      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

      if (this.lastStatus && this.lastStatus !== currentStatus && currentStatus !== 'running') {
        this.interrupts = [
          { time: timestamp, device: data.deviceId, status: currentStatus },
          ...this.interrupts
        ].slice(0, 10);
      }
      this.lastStatus = currentStatus;

      if (currentStatus !== 'running') {
        this.cdr.detectChanges();
        return;
      }

      const history = this.chartData;
      const fallbackParts = history.length > 0 ? history[history.length - 1].partsProduced : 0;
      
      this.chartData.push({
        timestamp: data.timestamp,
        partsPerMinute: data.partsPerMinute,
        partsProduced: this.order ? this.order.productionState : fallbackParts
      });

      if (this.chartData.length > 20) {
        this.chartData.shift();
      }

      if (data.order && data.order !== this.lastOrderId) {
        this.lastOrderId = data.order;
        this.orderService.getOrder(data.order).subscribe(orderData => {
          this.order = orderData;
          this.updateProgress();
        });
      } else {
        this.updateProgress();
      }

      this.renderCharts();
    });
  }

  // Method to get data for progress bar
  updateProgress() {
    if (this.order && this.order.productionTarget > 0) {
      this.orderVal = Math.min((this.order.productionState / this.order.productionTarget) * 100, 100);
    } else {
      this.orderVal = null;
    }
    this.cdr.detectChanges();
  }

  // Method to render charts
  private renderCharts() {
    if (!this.chartData.length) return;

    // Parameters passed for Parts Per Minute Chart 
    this.createD3Chart(
      this.chartContainer?.nativeElement,
      'partsPerMinute',
      'blue', 
      'aliceblue', 
      5
    );

    // Parameters passed for Parts Produced Chart 
    this.createD3Chart(
      this.partsProducedContainer?.nativeElement,
      'partsProduced',
      'green', 
      'honeydew',
      10
    );
  }

  // Method to create chart 
   createD3Chart(container: HTMLElement, dataKey: string, strokeColor: string, fillColor: string, paddingOffset: number) {
    if (!container) return;
    container.innerHTML = '';

    const width = 700;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleTime()
      .range([0, w])
      .domain(d3.extent(this.chartData, d => new Date(d.timestamp)) as [Date, Date]);

    const valMin = d3.min(this.chartData, d => d[dataKey]) - paddingOffset;
    const valMax = d3.max(this.chartData, d => d[dataKey]) + paddingOffset;
    const y = d3.scaleLinear()
      .range([h, 0])
      .domain([Math.max(0, valMin), valMax]);

    svg.append('g')
      .attr('transform', `translate(0, ${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%H:%M:%S') as any))
      .selectAll('text')
      .attr('fill', 'gray')
      .style('font-size', '10px');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', 'gray');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat('' as any))
      .selectAll('line')
      .attr('stroke', 'lightgray')
      .attr('stroke-dasharray', '3,3');

    svg.selectAll('.domain').attr('stroke', 'none');

    const area = d3.area<any>()
      .x(d => x(new Date(d.timestamp)))
      .y0(h)
      .y1(d => y(d[dataKey]));

    const line = d3.line<any>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d[dataKey]));

    svg.append('path').datum(this.chartData).attr('fill', fillColor).attr('fill-opacity', 0.85).attr('d', area);
    svg.append('path').datum(this.chartData).attr('fill', 'none').attr('stroke', strokeColor).attr('stroke-width', 1.5).attr('d', line);

    const lastNode = this.chartData[this.chartData.length - 1];
    svg.append('circle')
      .attr('cx', x(new Date(lastNode.timestamp)))
      .attr('cy', y(lastNode[dataKey]))
      .attr('r', 4)
      .attr('fill', strokeColor)
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);

    this.cdr.detectChanges();
  }
}