import { Injectable } from '@angular/core';
import { ComputingSystem } from './computing-system.service';

@Injectable({ providedIn: 'root' })
export class AutomodeService {
  async run(chartData: any[], onProcessStop: Function) {
    let sourceSize = 15;
    let bufferSize = 15;
    let devicesSize = 15;
    let requestsSize = 1000;

    let deviceData: any = [];
    let deviceLabels: number[] = [];
    let deviceDataset1: number[] = [];
    let deviceDataset2: number[] = [];
    let deviceDataset3: number[] = [];

    const promises1 = [];

    for (let i = 5; i <= 50; i += 5) {
      const promise = new Promise<ComputingSystem>((resolve) => {
        console.log(`device loop ${i}`);
        const system = new ComputingSystem();
        resolve(system.start(sourceSize, bufferSize, i, requestsSize, onProcessStop));
      });

      deviceLabels.push(i);

      promises1.push(promise);
    }

    const result1 = await Promise.all(promises1);

    result1.forEach((res, i) => {
      let rejectNum = this.rejectionProbability(res.reject, res.requests.length);
      let reqTime = this.averageTimeOfRequest(res.requests);
      let deviceTime = this.averageUsageOfDevice(res.devices, res.systemTime);

      deviceDataset1.push(rejectNum);
      deviceDataset2.push(reqTime);
      deviceDataset3.push(deviceTime);
    });

    deviceData[0] = {
      labels: deviceLabels,
      datasets: [
        {
          label: 'вероятность отказа',
          data: deviceDataset1,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
      ],
    };

    deviceData[1] = {
      labels: deviceLabels,
      datasets: [
        {
          label: 'среднее время заявки в системе',
          data: deviceDataset2,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
      ],
    };

    deviceData[2] = {
      labels: deviceLabels,
      datasets: [
        {
          label: 'средняя загруженность приборов',
          data: deviceDataset3,
          fill: false,
          borderColor: '#00bb7e',
          tension: 0.4,
        },
      ],
    };

    console.log('STOP FIRST LOOP');

    let bufferData: any = [];
    let bufferLabels: any = [];
    let bufferDataset1: any = [];
    let bufferDataset2: any = [];
    let bufferDataset3: any = [];

    const promises2 = [];

    for (let i = 5; i <= 50; i += 5) {
      const promise = new Promise<ComputingSystem>((resolve) => {
        console.log(`buffer loop ${i}`);
        const system = new ComputingSystem();
        resolve(system.start(sourceSize, i, devicesSize, requestsSize, onProcessStop));
      });

      bufferLabels.push(i);
      promises2.push(promise);
    }

    const result2 = await Promise.all(promises2);

    result2.forEach((res, i) => {
      let rejectNum = this.rejectionProbability(res.reject, res.requests.length);
      let reqTime = this.averageTimeOfRequest(res.requests);
      let deviceTime = this.averageUsageOfDevice(res.devices, res.systemTime);

      bufferDataset1.push(rejectNum);
      bufferDataset2.push(reqTime);
      bufferDataset3.push(deviceTime);
    });

    bufferData[0] = {
      labels: bufferLabels,
      datasets: [
        {
          label: 'вероятность отказа',
          data: bufferDataset1,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
      ],
    };

    bufferData[1] = {
      labels: bufferLabels,
      datasets: [
        {
          label: 'среднее время заявки в системе',
          data: bufferDataset2,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
      ],
    };

    bufferData[2] = {
      labels: bufferLabels,
      datasets: [
        {
          label: 'средняя загруженность приборов',
          data: bufferDataset3,
          fill: false,
          borderColor: '#00bb7e',
          tension: 0.4,
        },
      ],
    };

    let sourceData: any = [];
    let sourceLabels: any = [];
    let sourceDataset1: any = [];
    let sourceDataset2: any = [];
    let sourceDataset3: any = [];

    const promises3 = [];

    for (let i = 5; i <= 50; i += 5) {
      const promise = new Promise<ComputingSystem>((resolve) => {
        console.log(`source loop ${i}`);
        const system = new ComputingSystem();
        resolve(system.start(i, bufferSize, devicesSize, requestsSize, onProcessStop));
      });
      sourceLabels.push(i);
      promises3.push(promise);
    }

    const result3 = await Promise.all(promises3);

    result3.forEach((res, i) => {
      let rejectNum = this.rejectionProbability(res.reject, res.requests.length);
      let reqTime = this.averageTimeOfRequest(res.requests);
      let deviceTime = this.averageUsageOfDevice(res.devices, res.systemTime);

      sourceDataset1.push(rejectNum);
      sourceDataset2.push(reqTime);
      sourceDataset3.push(deviceTime);
    });

    sourceData[0] = {
      labels: sourceLabels,
      datasets: [
        {
          label: 'вероятность отказа',
          data: sourceDataset1,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
      ],
    };

    sourceData[1] = {
      labels: sourceLabels,
      datasets: [
        {
          label: 'среднее время заявки в системе',
          data: sourceDataset2,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
      ],
    };

    sourceData[2] = {
      labels: sourceLabels,
      datasets: [
        {
          label: 'средняя загруженность приборов',
          data: sourceDataset3,
          fill: false,
          borderColor: '#00bb7e',
          tension: 0.4,
        },
      ],
    };

    chartData = [
      deviceData[0],
      deviceData[1],
      deviceData[2],
      bufferData[0],
      bufferData[1],
      bufferData[2],
      sourceData[0],
      sourceData[1],
      sourceData[2],
    ];
    return chartData;
  }

  public rejectionProbability(rejectedNum: number, allRequestsNum: number): number {
    return rejectedNum / allRequestsNum;
  }

  public averageTimeOfRequest(requests: any[]): number {
    let timeSum = 0;
    requests.forEach((req) => (timeSum += req.timeInSystem));
    return timeSum / requests.length;
  }

  public averageUsageOfDevice(devices: any[], systemTime: number) {
    let timeSum = 0;
    devices.forEach((device) => (timeSum += device.workTime));
    return timeSum / systemTime;
  }
}
