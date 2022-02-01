import { Component } from '@angular/core';
import { AppEvent, ComputingSystem } from './services/computing-system.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PrimeNGConfig } from 'primeng/api';
import { AutomodeService } from './services/automode.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  form = new FormGroup({
    sourceSize: new FormControl(13),
    bufferSize: new FormControl(5),
    devicesSize: new FormControl(3),
    requestsSize: new FormControl(2500),
  });

  events: AppEvent[] = [];
  stepEvents: AppEvent[] = [];
  statisticData: any[] = [];
  statisticOptions: any;

  constructor(private primengConfig: PrimeNGConfig, private automodeService: AutomodeService) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  run() {
    this.events = [];
    this.stepEvents = [];

    const sourceSize = this.form.get('sourceSize')?.value;
    const devicesSize = this.form.get('devicesSize')?.value;
    const bufferSize = this.form.get('bufferSize')?.value;
    const requestsSize = this.form.get('requestsSize')?.value;

    const system = new ComputingSystem();

    system.start(
      Number(sourceSize),
      Number(bufferSize),
      Number(devicesSize),
      Number(requestsSize),
      this.onProcessStop.bind(this)
    );
  }

  async runAuto() {
    this.statisticData = await this.automodeService.run(this.statisticData, this.onProcessStop);
    this.applyLightTheme();
  }

  showStep() {
    if (this.stepEvents.length === this.events.length) return;

    this.stepEvents.push(this.events[this.stepEvents.length]);
  }

  onProcessStop(events: AppEvent[]) {
    this.events = events;
  }

  applyLightTheme() {
    this.statisticOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#495057',
          },
          grid: {
            color: '#ebedef',
          },
        },
        y: {
          ticks: {
            color: '#495057',
          },
          grid: {
            color: '#ebedef',
          },
        },
      },
    };
  }
}
