import { lambda } from '../../shared/const';

export interface AppEvent {
  source: string;
  time: number;
  availability: boolean;
  localRequests: number;
  rejectNumber: string;
  requestNumber: string;
}

export class ComputingSystem {
  sources: Source[] = [];
  devices: Device[] = [];
  requests: Requestt[] = [];
  bufferList: BufferList | undefined;
  bufferQueue: BufferrQueue | undefined;
  requestSize = 0;
  reject = 0;
  systemTime = 0;

  events: AppEvent[] = [];

  onProcessStop: Function | undefined;

  resolve: Function | undefined;

  constructor() {}

  start(
    sourceSize: number,
    bufferSize: number,
    deviceSize: number,
    requestSize: number,
    onProcessStop: Function
  ) {
    this.systemTime = Date.now();

    return new Promise<ComputingSystem>((resolve) => {
      console.log('COMPUTING SYSTEM START');
      this.resolve = resolve;
      this.requestSize = requestSize;

      this.devices = Array.from(Array(deviceSize).keys()).map(
        (i) => new Device(i + 1, this.onDeviceAvailable.bind(this))
      );

      this.sources = Array.from(Array(sourceSize).keys()).map(
        (i) => new Source(i + 1, (-1 / lambda) * Math.log(Math.random()), this.onRequest.bind(this))
      );

      this.bufferList = new BufferList(bufferSize);
      this.bufferQueue = new BufferrQueue([]);
      this.sources.forEach((s) => s.start(s.delta));

      this.onProcessStop = onProcessStop;
    });
  }

  onDeviceAvailable(device: Device) {
    this.events.push({
      source: `device ${device!.number}`,
      time: Date.now(),
      availability: device!.available,
      localRequests: device!.requests.length,
      rejectNumber: `${this.reject}`,
      requestNumber: '',
    });

    const buffer = this.bufferQueue!.dequeue();

    if (buffer) {
      buffer.timeInBuffer = Date.now() - buffer.timeInBuffer;
      buffer.request!.timeInSystem += buffer.timeInBuffer;

      device.process(buffer.request!).then(() => {
        buffer.available = true;
        buffer.request = undefined;

        this.events.push({
          source: `buffer ${buffer.number}`,
          time: Date.now(),
          availability: buffer.available,
          localRequests: buffer.localRequests,
          rejectNumber: `${this.reject}`,
          requestNumber: `${buffer.request!.source!.number}.${buffer.request!.number}`,
        });
      });
    } else {
      const sourcesStopped = this.sources.every((s) => s.stopped);
      const devicesAvailable = this.devices.every((s) => s.available);

      if (sourcesStopped && devicesAvailable && this.onProcessStop) {
        this.onProcessStop(this.events);

        this.systemTime = Date.now() - this.systemTime;
        console.log(`Time of program ${this.systemTime}`);
        console.log(`Time of device in system ${device.workTime}`);
        console.log(
          `Rejection probability ${this.rejectionProbability(this.reject, this.requests.length)}`
        );
        console.log(
          `Average time in system of request ${this.averageTimeOfRequest(this.requests)}`
        );
        console.log(
          `Average usage of device ${this.averageUsageOfDevice(this.devices, this.systemTime)}`
        );

        console.log('COMPUTING SYSTEM STOP');
        if (this.resolve) this.resolve(this);
      }
    }
  }

  onRequest(request: Requestt) {
    this.events.push({
      source: `source ${request.source.number}`,
      time: Date.now(),
      availability: true,
      localRequests: request.source.localRequests,
      rejectNumber: `${this.reject}`,
      requestNumber: `${request.source!.number}.${request.number}`,
    });

    this.requests.push(request);
    request.timeInSystem = Date.now() - request.timeInSystem;

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
          rejectNumber: `${this.reject}`,
          requestNumber: `${request.source.number}.${request.number}`,
        });
      });
      this.events.push({
        source: `device ${device!.number}`,
        time: Date.now(),
        availability: device!.available,
        localRequests: device!.requests.length,
        rejectNumber: `${this.reject}`,
        requestNumber: `${request.source.number}.${request.number}`,
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
          rejectNumber: `${this.reject}`,
          requestNumber: `${request.source.number}.${request.number}`,
        });
      } else {
        let availableBuffer = this.bufferList!.findAvailable(curBuffer);

        if (!availableBuffer) {
          availableBuffer = this.bufferList!.findAvailable();

          if (!availableBuffer && curBuffer) {
            let rejectedRequest = curBuffer.request;
            curBuffer!.current = false;
            curBuffer.request = request;
            curBuffer.timeInBuffer = Date.now();
            curBuffer.next!.current = true;
            this.reject = this.reject + 1;

            console.log(`REJECT LENGTH ${this.reject}`);

            this.events.push({
              source: `buffer ${curBuffer.number}`,
              time: Date.now(),
              availability: curBuffer.available,
              localRequests: curBuffer.localRequests,
              rejectNumber: `${this.reject} ${rejectedRequest!.source.number}.${
                rejectedRequest!.number
              }`,
              requestNumber: `${request.source.number}.${request.number}`,
            });
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
            rejectNumber: `${this.reject}`,
            requestNumber: `${request.source.number}.${request.number}`,
          });
        }
      }
    }
  }

  rejectionProbability(rejectedNum: number, allRequestsNum: number): number {
    return rejectedNum / allRequestsNum;
  }

  averageTimeOfRequest(requests: any[]): number {
    let timeSum = 0;
    requests.forEach((req) => (timeSum += req.timeInSystem));
    return timeSum / requests.length;
  }

  averageUsageOfDevice(devices: Device[], systemTime: number) {
    let commonK = devices.reduce((acc, val) => acc + val.workTime, 0) / devices.length;

    return commonK / systemTime;
  }
}

class Source {
  localRequests = 0;
  intervalId: any;
  stopped = false;

  constructor(public number: string | number, public delta: number, public onRequest: Function) {}

  start(delta: number) {
    delta *= 0.00001;
    if (this.stopped) return;

    this.intervalId = setInterval(() => {
      this.generate();

      clearInterval(this.intervalId);

      this.start(delta);
    }, delta);
  }

  stop() {
    this.stopped = true;
    clearInterval(this.intervalId);
    console.log(`source ${this.number} stopped`);
  }

  generate() {
    const req = new Requestt(this.localRequests + 1, this);
    req.timeInSystem = Date.now();
    this.localRequests++;
    this.onRequest(req);
  }
}

class Device {
  available = true;
  workTime = 0;
  prevTime = 0;
  requests: Requestt[] = [];

  constructor(public number: number, private onDeviceAvailable: Function) {}

  async process(request: Requestt) {
    this.available = false;
    const delta = (-1 / 0.2) * Math.log(Math.random()) * this.number;

    console.log(delta);
    console.log(`process delta ${delta}`);

    const t1 = Date.now();

    return new Promise((resolve) => {
      setTimeout(() => {
        request.timeInSystem += delta;
        this.requests.push(request);

        this.available = true;

        this.onDeviceAvailable(this);

        resolve(this);

        this.workTime += Date.now() - t1;
      }, delta / 100);
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
