import { Component } from '@angular/core';
import { AppEvent, MainService } from './services/main.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  form = new FormGroup({
    sourceSize: new FormControl(3),
    bufferSize: new FormControl(3),
    devicesSize: new FormControl(3),
    requestsSize: new FormControl(12),
  });

  events: AppEvent[] = [];
  showEvents: AppEvent[] = [];

  constructor(private mainService: MainService) {}

  run() {
    this.events = [];

    const sourceSize = this.form.get('sourceSize')?.value;
    const devicesSize = this.form.get('devicesSize')?.value;
    const bufferSize = this.form.get('bufferSize')?.value;
    const requestsSize = this.form.get('requestsSize')?.value;

    this.mainService.start(
      sourceSize,
      bufferSize,
      devicesSize,
      requestsSize,
      this.onProcessStop.bind(this)
    );

    // console.log(this.mainService.events);
  }

  stop() {
    // this.mainService.stop()
  }

  showEvent() {
    const number = this.showEvents.length;
    this.showEvents.push(this.events[number]);
  }

  onProcessStop(events: AppEvent[]) {
    console.log(events);

    this.events = events;
  }
}
