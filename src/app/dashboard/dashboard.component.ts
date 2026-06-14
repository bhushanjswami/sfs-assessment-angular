
// import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import * as d3 from 'd3';
// import { DeviceService } from '../services/device.service';
// import { EventService } from '../services/event.service';
// import { OrderService } from '../services/order.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent implements OnInit {
//   // Use static: false to ensure elements are fetched reliably during life cycles
//   @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
//   @ViewChild('partsProducedContainer', { static: false }) partsProducedContainer!: ElementRef;

//   devices: any[] = [];
//   chartData: any[] = [];
//   order: any = null;
//   selectedDevice: string = "";
//   orderVal: number | null = null;
//   private lastOrderId: string | null = null;

//   constructor(
//     private deviceService: DeviceService,
//     private eventService: EventService,
//     private orderService: OrderService,
//     private cdr: ChangeDetectorRef
//   ) {
//     this.loadDevices();
//   }

//   ngOnInit(): void {}

//   loadDevices() {
//     this.deviceService.getDevices().subscribe({
//       next: (res: any) => {
//         this.devices = res;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   selectDevice(device: string) {
//     if (!device) return;

//     // Clear graphs instantly on switch
//     if (this.chartContainer?.nativeElement) d3.select(this.chartContainer.nativeElement).html('');
//     if (this.partsProducedContainer?.nativeElement) d3.select(this.partsProducedContainer.nativeElement).html('');

//     this.chartData = [];
//     this.order = null;
//     this.orderVal = null;
//     this.lastOrderId = null;

//     this.startMonitoring(device);
//   }

//   startMonitoring(deviceId: string) {
//     this.eventService.connect(deviceId).subscribe((data: any) => {
//       if (!data || data.status !== 'running') return;

//       const lastParts = this.chartData.length > 0 ? this.chartData[this.chartData.length - 1].partsProduced : 0;
      
//       this.chartData.push({
//         timestamp: data.timestamp,
//         partsPerMinute: data.partsPerMinute,
//         partsProduced: this.order ? this.order.productionState : lastParts
//       });

//       if (this.chartData.length > 20) {
//         this.chartData.shift();
//       }

//       if (data.order && data.order !== this.lastOrderId) {
//         this.lastOrderId = data.order;
//         this.orderService.getOrder(data.order).subscribe((order: any) => {
//           this.order = order;
//           this.updateProgress();
//         });
//       } else if (this.order) {
//         // Update live progressive target counters if order matches current payload tracking
//         this.updateProgress();
//       }
      
//       // Draw charts on every incoming data tick
//    //   this.updateProgress();
//       this.drawPartsPerMinuteChart();
//       this.drawPartsProducedChart();
//     });
//   }

//   updateProgress() {
//     if (this.order && this.order.productionTarget > 0) {
//       this.orderVal = Math.min((this.order.productionState / this.order.productionTarget) * 100, 100);
//     } else {
//       this.orderVal = null;
//     }
//     this.cdr.detectChanges(); // Force UI engine layout update pass
//   }

//   private drawPartsPerMinuteChart(): void {
//     if (!this.chartContainer?.nativeElement || !this.chartData?.length) return;
    
//     d3.select(this.chartContainer.nativeElement).html('');

//     const width    = 700;
//     const height   = 200;
//     const margin   = { top: 20, right: 20, bottom: 40, left: 50 };
//     const innerW   = width  - margin.left - margin.right;
//     const innerH   = height - margin.top  - margin.bottom;

//     const svg = d3.select(this.chartContainer.nativeElement)
//       .append('svg')
//       .attr('viewBox', `0 0 ${width} ${height}`)
//       .style('width', '100%')
//       .style('height', 'auto')
//       .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//     const x = d3.scaleTime()
//       .range([0, innerW])
//       .domain(d3.extent(this.chartData, d => new Date(d.timestamp)) as [Date, Date]);

//     const yMin = d3.min(this.chartData, d => d.partsPerMinute) - 5;
//     const yMax = d3.max(this.chartData, d => d.partsPerMinute) + 5;
//     const y = d3.scaleLinear().range([innerH, 0]).domain([yMin, yMax]);

//     svg.append('g')
//       .attr('transform', `translate(0, ${innerH})`)
//       .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%H:%M:%S') as any))
//       .selectAll('text')
//       .attr('fill', '#6b7280')
//       .attr('font-size', '10px');

//     svg.append('g')
//       .call(d3.axisLeft(y).ticks(5))
//       .selectAll('text')
//       .attr('fill', '#6b7280');

//     svg.append('g')
//       .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat('' as any))
//       .selectAll('line')
//       .attr('stroke', '#e5e7eb')
//       .attr('stroke-dasharray', '3,3');

//     svg.selectAll('.domain').attr('stroke', 'none');

//     svg.append('text')
//       .attr('x', innerW / 2)
//       .attr('y', innerH + 35)
//       .attr('text-anchor', 'middle')
//       .attr('fill', '#6b7280')
//       .attr('font-size', '11px')
//       .text('Parts Per Minute');

//     const area = d3.area<any>()
//       .x(d => x(new Date(d.timestamp)))
//       .y0(innerH)
//       .y1(d => y(d.partsPerMinute));

//     svg.append('path')
//       .datum(this.chartData)
//       .attr('fill', '#eff6ff')
//       .attr('fill-opacity', 0.9)
//       .attr('d', area);

//     const line = d3.line<any>()
//       .x(d => x(new Date(d.timestamp)))
//       .y(d => y(d.partsPerMinute));

//     svg.append('path')
//       .datum(this.chartData)
//       .attr('fill', 'none')
//       .attr('stroke', '#3b82f6')
//       .attr('stroke-width', 1.5)
//       .attr('d', line);

//     const last = this.chartData[this.chartData.length - 1];
//     svg.append('circle')
//       .attr('cx', x(new Date(last.timestamp)))
//       .attr('cy', y(last.partsPerMinute))
//       .attr('r', 4)
//       .attr('fill', '#3b82f6')
//       .attr('stroke', '#fff')
//       .attr('stroke-width', 1.5);
//     this.cdr.detectChanges();
//   }

//   private drawPartsProducedChart(): void {
//     if (!this.partsProducedContainer?.nativeElement || !this.chartData?.length) return;
    
//     d3.select(this.partsProducedContainer.nativeElement).html('');

//     const width    = 700;
//     const height   = 200;
//     const margin   = { top: 20, right: 20, bottom: 40, left: 50 };
//     const innerW   = width  - margin.left - margin.right;
//     const innerH   = height - margin.top  - margin.bottom;

//     const svg = d3.select(this.partsProducedContainer.nativeElement)
//       .append('svg')
//       .attr('viewBox', `0 0 ${width} ${height}`)
//       .style('width', '100%')
//       .style('height', 'auto')
//       .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//     const x = d3.scaleTime()
//       .range([0, innerW])
//       .domain(d3.extent(this.chartData, d => new Date(d.timestamp)) as [Date, Date]);

//     const yMin = d3.min(this.chartData, d => d.partsProduced) - 10;
//     const yMax = d3.max(this.chartData, d => d.partsProduced) + 10;
//     const y = d3.scaleLinear().range([innerH, 0]).domain([Math.max(0, yMin), yMax]);

//     svg.append('g')
//       .attr('transform', `translate(0, ${innerH})`)
//       .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%H:%M:%S') as any))
//       .selectAll('text')
//       .attr('fill', '#6b7280')
//       .attr('font-size', '10px');

//     svg.append('g')
//       .call(d3.axisLeft(y).ticks(5))
//       .selectAll('text')
//       .attr('fill', '#6b7280');

//     svg.append('g')
//       .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat('' as any))
//       .selectAll('line')
//       .attr('stroke', '#e5e7eb')
//       .attr('stroke-dasharray', '3,3');

//     svg.selectAll('.domain').attr('stroke', 'none');

//     svg.append('text')
//       .attr('x', innerW / 2)
//       .attr('y', innerH + 35)
//       .attr('text-anchor', 'middle')
//       .attr('fill', '#6b7280')
//       .attr('font-size', '11px')
//       .text('Parts Produced');

//     const area = d3.area<any>()
//       .x(d => x(new Date(d.timestamp)))
//       .y0(innerH)
//       .y1(d => y(d.partsProduced));

//     svg.append('path')
//       .datum(this.chartData)
//       .attr('fill', '#f0fdf4')
//       .attr('fill-opacity', 0.8)
//       .attr('d', area);

//     const line = d3.line<any>()
//       .x(d => x(new Date(d.timestamp)))
//       .y(d => y(d.partsProduced));

//     svg.append('path')
//       .datum(this.chartData)
//       .attr('fill', 'none')
//       .attr('stroke', '#22c55e')
//       .attr('stroke-width', 1.5)
//       .attr('d', line);

//     const last = this.chartData[this.chartData.length - 1];
//     svg.append('circle')
//       .attr('cx', x(new Date(last.timestamp)))
//       .attr('cy', y(last.partsProduced))
//       .attr('r', 4)
//       .attr('fill', '#22c55e')
//       .attr('stroke', '#fff')
//       .attr('stroke-width', 1.5);
//     this.cdr.detectChanges();
//   }
// }

import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { DeviceService } from '../services/device.service';
import { EventService } from '../services/event.service';
import { OrderService } from '../services/order.service';
import { StatusBadgeComponent } from '../shared/status-badge/status-badge.component'; // Ensure correct relative path

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @ViewChild('partsProducedContainer', { static: false }) partsProducedContainer!: ElementRef;

  devices: any[] = [];
  chartData: any[] = [];
  interrupts: any[] = [];
  order: any = null;
  selectedDevice: string = "";
  orderVal: number | null = null;
  
  private lastOrderId: string | null = null;
  private lastStatus: string | null = null;

  constructor(
    private deviceService: DeviceService,
    private eventService: EventService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadDevices();
  }

  ngOnInit(): void {}

  // Method called when page is initialized
  loadDevices() {
    this.deviceService.getDevices().subscribe({
      next: (res: any) => {
        this.devices = res;
        this.cdr.detectChanges();
      }
    });
  }

  // Method called after click on submit button
  selectDevice(device: string) {
    if (!device) return;

    if (this.chartContainer?.nativeElement) d3.select(this.chartContainer.nativeElement).html('');
    if (this.partsProducedContainer?.nativeElement) d3.select(this.partsProducedContainer.nativeElement).html('');

    this.chartData = [];
    this.interrupts = [];
    this.order = null;
    this.orderVal = null;
    this.lastOrderId = null;
    this.lastStatus = null;

    this.startMonitoring(device);
  }

  startMonitoring(deviceId: string) {
    this.eventService.connect(deviceId).subscribe((data: any) => {
      if (!data) return;
      const currentStatus = data.status;
      const interuppt_time = data.timestamp ? new Date(data.timestamp) : new Date();
      // 1. Interrupt State Change Tracking Logic
      if (this.lastStatus !== null && this.lastStatus !== currentStatus) {
        console.log('dataaaaa',data)
        if (currentStatus !== 'running') {
          this.interrupts = [
            { 
              time: interuppt_time, 
              device: data.deviceId,
              status: currentStatus 
            },
            ...this.interrupts
          ].slice(0, 10); // it is to keep 10 records only
        }
      }
      this.lastStatus = currentStatus;

      // 2. Data processing guard for Charts and Progress metrics
      if (currentStatus !== 'running') {
        this.cdr.detectChanges();
        return; 
      }

      // 3. Process Metrics and Active Graphs
      const lastParts = this.chartData.length > 0 ? this.chartData[this.chartData.length - 1].partsProduced : 0;
      
      this.chartData.push({
        timestamp: data.timestamp,
        partsPerMinute: data.partsPerMinute,
        partsProduced: this.order ? this.order.productionState : lastParts
      });

      if (this.chartData.length > 20) {
        this.chartData.shift();
      }

      if (data.order && data.order !== this.lastOrderId) {
        this.lastOrderId = data.order;
        this.orderService.getOrder(data.order).subscribe((order: any) => {
          this.order = order;
          this.updateProgress();
        });
      } else if (this.order) {
        this.updateProgress();
      }
      
      this.drawPartsPerMinuteChart();
      this.drawPartsProducedChart();
    });
  }


  // Method for progress bar
  updateProgress() {
    if (this.order && this.order.productionTarget > 0) {
      this.orderVal = Math.min((this.order.productionState / this.order.productionTarget) * 100, 100);
    } else {
      this.orderVal = null;
    }
    this.cdr.detectChanges(); 
  }

  // method for parts per min
  private drawPartsPerMinuteChart(): void {
    if (!this.chartContainer?.nativeElement || !this.chartData?.length) return;
    d3.select(this.chartContainer.nativeElement).html('');

    const width = 700;
    const height = 200;
    const margin = {top: 20, right: 20, bottom: 40, left: 50};
    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleTime()
      .range([0, innerW])
      .domain(d3.extent(this.chartData, d => new Date(d.timestamp)) as [Date, Date]);

    const yMin = d3.min(this.chartData, d => d.partsPerMinute) - 5;
    const yMax = d3.max(this.chartData, d => d.partsPerMinute) + 5;
    const y = d3.scaleLinear().range([innerH, 0]).domain([yMin, yMax]);

    svg.append('g')
      .attr('transform', `translate(0, ${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%H:%M:%S') as any))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px');

    svg.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', '#6b7280');
    svg.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat('' as any)).selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3');
    svg.selectAll('.domain').attr('stroke', 'none');

    const area = d3.area<any>().x(d => x(new Date(d.timestamp))).y0(innerH).y1(d => y(d.partsPerMinute));
    svg.append('path').datum(this.chartData).attr('fill', '#eff6ff').attr('fill-opacity', 0.9).attr('d', area);

    const line = d3.line<any>().x(d => x(new Date(d.timestamp))).y(d => y(d.partsPerMinute));
    svg.append('path').datum(this.chartData).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('d', line);

    const last = this.chartData[this.chartData.length - 1];
    svg.append('circle').attr('cx', x(new Date(last.timestamp))).attr('cy', y(last.partsPerMinute)).attr('r', 4).attr('fill', '#3b82f6').attr('stroke', '#fff').attr('stroke-width', 1.5);
    this.cdr.detectChanges();
  }

  //method for parts produced
  private drawPartsProducedChart(): void {
    if (!this.partsProducedContainer?.nativeElement || !this.chartData?.length) return;
    d3.select(this.partsProducedContainer.nativeElement).html('');

    const width = 700;
    const height= 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const svg = d3.select(this.partsProducedContainer.nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleTime()
      .range([0, innerW])
      .domain(d3.extent(this.chartData, d => new Date(d.timestamp)) as [Date, Date]);

    const yMin = d3.min(this.chartData, d => d.partsProduced) - 10;
    const yMax = d3.max(this.chartData, d => d.partsProduced) + 10;
    const y = d3.scaleLinear().range([innerH, 0]).domain([Math.max(0, yMin), yMax]);

    svg.append('g')
      .attr('transform', `translate(0, ${innerH})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%H:%M:%S') as any))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px');

    svg.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('fill', '#6b7280');
    svg.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat('' as any)).selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3');
    svg.selectAll('.domain').attr('stroke', 'none');

    const area = d3.area<any>().x(d => x(new Date(d.timestamp))).y0(innerH).y1(d => y(d.partsProduced));
    svg.append('path').datum(this.chartData).attr('fill', '#f0fdf4').attr('fill-opacity', 0.8).attr('d', area);

    const line = d3.line<any>().x(d => x(new Date(d.timestamp))).y(d => y(d.partsProduced));
    svg.append('path').datum(this.chartData).attr('fill', 'none').attr('stroke', '#22c55e').attr('stroke-width', 1.5).attr('d', line);

    const last = this.chartData[this.chartData.length - 1];
    svg.append('circle').attr('cx', x(new Date(last.timestamp))).attr('cy', y(last.partsProduced)).attr('r', 4).attr('fill', '#22c55e').attr('stroke', '#fff').attr('stroke-width', 1.5);
    this.cdr.detectChanges();
  }
}