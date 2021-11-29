import { Injectable } from '@angular/core';
import { alpha, beta, lambda } from '../../shared/const';

export interface AppEvent {
  source: string;
  time: number;
  availability: boolean;
  localRequests: number;
  rejectNumber: number;
}

@Injectable({ providedIn: 'root' })
export class MainService {
  sources: Source[] = [];
  devices: Device[] = [];
  requests: Requestt[] = [];
  bufferList: BufferList | undefined;
  bufferQueue: BufferrQueue | undefined;
  requestSize = 0;
  reject = 0;

  events: AppEvent[] = [];

  onProcessStop: Function | undefined;

  start(
    sourceSize: number,
    bufferSize: number,
    deviceSize: number,
    requestSize: number,
    onProcessStop: Function
  ) {
    this.requestSize = requestSize;

    this.sources = Array.from(Array(sourceSize).keys()).map(
      (i) =>
        new Source(
          i + 1,
          1000,
          ((beta - alpha) * Math.random() + alpha) * 10,
          this.onRequest.bind(this)
        )
    );
    this.devices = Array.from(Array(deviceSize).keys()).map(
      (i) => new Device(i + 1, this.onDeviceAvailable.bind(this))
    );
    this.bufferList = new BufferList(bufferSize);
    this.bufferQueue = new BufferrQueue([]);
    this.sources.forEach((s) => s.start(s.delta));

    this.onProcessStop = onProcessStop;
  }

  onDeviceAvailable(device: Device) {
    const buffer = this.bufferQueue!.dequeue();

    if (buffer) {
      buffer.timeInBuffer = Date.now() - buffer.timeInBuffer;
      buffer.request!.timeInSystem += buffer.timeInBuffer;

      device.process(buffer.request!).then(() => {
        buffer.available = true;
        buffer.request = undefined;

        this.events.push({
          source: `device ${device.number}`,
          time: Date.now(),
          availability: device.available,
          localRequests: device.requests.length,
          rejectNumber: this.reject,
        });

        this.events.push({
          source: `buffer ${buffer.number}`,
          time: Date.now(),
          availability: buffer.available,
          localRequests: buffer.localRequests,
          rejectNumber: this.reject,
        });
      });
    } else {
      const sourcesStopped = this.sources.every((s) => s.stopped);
      const devicesAvailable = this.devices.every((s) => s.available);

      console.log(sourcesStopped, devicesAvailable);

      if (sourcesStopped && devicesAvailable && this.onProcessStop) {
        this.onProcessStop(this.events);
      }
    }
  }

  onRequest(request: Requestt) {
    this.events.push({
      source: `source ${request.source.number}`,
      time: Date.now(),
      availability: true,
      localRequests: request.source.localRequests,
      rejectNumber: this.reject,
    });

    this.requests.push(request);

    console.log(`REQUEST LENGTH: ${this.requests.length}`);

    if (this.requests.length >= this.requestSize) {
      this.sources.forEach((source) => {
        source.stop();
      });
    }

    // Available device
    let device = this.devices.find((d) => d.available);

    if (device) {
      device.process(request).then(() => {
        this.events.push({
          source: `device ${device!.number}`,
          time: Date.now(),
          availability: device!.available,
          localRequests: device!.requests.length,
          rejectNumber: this.reject,
        });
      });
    } else {
      const curBuffer = this.bufferList!.current();

      if (curBuffer && curBuffer.available) {
        curBuffer.request = request;
        curBuffer.timeInBuffer = Date.now();

        curBuffer.current = false;
        curBuffer.available = false;
        curBuffer.next!.current = true;

        this.bufferQueue!.enqueue(curBuffer!);
        curBuffer.localRequests++;

        this.events.push({
          source: `buffer ${curBuffer.number}`,
          time: Date.now(),
          availability: curBuffer.available,
          localRequests: curBuffer.localRequests,
          rejectNumber: this.reject,
        });
      } else {
        let availableBuffer = this.bufferList!.findAvailable(curBuffer);

        if (!availableBuffer) {
          availableBuffer = this.bufferList!.findAvailable();

          if (!availableBuffer && curBuffer) {
            curBuffer.request = request;
            curBuffer.timeInBuffer = Date.now();
            console.log(`REJECT LENGTH ${this.reject++}`);

            this.events.push({
              source: `buffer ${curBuffer.number}`,
              time: Date.now(),
              availability: curBuffer.available,
              localRequests: curBuffer.localRequests,
              rejectNumber: this.reject,
            });

            console.log(this.devices.filter((d) => !d.available));
          }
        } else {
          curBuffer!.current = false;
          availableBuffer.request = request;
          availableBuffer.timeInBuffer = Date.now();
          availableBuffer.available = false;
          availableBuffer.next!.current = true;

          this.bufferQueue!.enqueue(availableBuffer);
          availableBuffer.localRequests++;

          this.events.push({
            source: `buffer ${availableBuffer.number}`,
            time: Date.now(),
            availability: availableBuffer.available,
            localRequests: availableBuffer.localRequests,
            rejectNumber: this.reject,
          });
        }
      }
    }
  }
}

class Source {
  localRequests = 0;
  intervalId: any;
  stopped = false;

  constructor(
    public number: string | number,
    public time: number,
    public delta: number,
    public onRequest: Function
  ) {}

  start(delta: number) {
    if (this.stopped) return;

    this.intervalId = setInterval(() => {
      console.log(`from source: ${this.number}`);
      console.log(`generating time ${delta}`);

      this.generate();

      clearInterval(this.intervalId);

      this.start(delta);
    }, this.time + delta);
  }

  stop() {
    this.stopped = true;
    clearInterval(this.intervalId);
    console.log(`source ${this.number} stopped`);
  }

  generate() {
    const req = new Requestt(this.localRequests + 1, this);
    this.localRequests++;
    this.onRequest(req);
  }
}

class Device {
  available = true;
  requests: Requestt[] = [];

  constructor(public number: number, private onDeviceAvailable: Function) {}

  async process(request: Requestt) {
    this.available = false;
    const delta = (-1 / lambda) * Math.log(Math.random());
    request.timeInSystem += delta;
    console.log(delta);
    console.log(`time in system of curReq ${request.timeInSystem}`);

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`device processing request ${request.source.number}.${request.number}`);
        request.timeInSystem += delta;
        this.requests.push(request);

        this.available = true;

        this.onDeviceAvailable(this);

        resolve(null);
      }, delta);
    });
  }
}

class Requestt {
  timeInSystem: number;
  constructor(public number: number, public source: Source) {
    this.timeInSystem = 0;
  }
}

class BufferrQueue {
  constructor(public buffers: Bufferr[]) {}

  enqueue(buf: Bufferr) {
    this.buffers.push(buf);
  }

  dequeue() {
    return this.buffers.shift();
  }
}

class BufferList {
  head: Bufferr | undefined;
  tail: Bufferr | undefined;
  length = 0;

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.add(i + 1);
    }

    if (this.length === 1) {
      this.tail = this.head;
    }

    this.tail!.next = this.head;
  }

  add(number: number) {
    let node = new Bufferr(number);

    if (this.length === 0) {
      this.head = node;
      node.current = true;
    } else {
      let current = this.head;

      while (current!.next) {
        current = current!.next;
      }

      current!.next = node;

      this.tail = current!.next;
    }

    this.length++;
  }

  current() {
    let current = this.head;

    while (!current!.current) {
      current = current!.next!;
    }

    return current;
  }

  findAvailable(after?: Bufferr) {
    let from = after?.next || this.head;

    while (!from!.available && from !== this.tail) {
      from = from!.next!;
    }

    return from!.available ? from : null;
  }
}

class Bufferr {
  available = true;
  request: Requestt | undefined;
  current = false;
  next: Bufferr | undefined;
  localRequests = 0;
  timeInBuffer = 0;

  constructor(public number: number) {}
}
