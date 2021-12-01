import { Injectable } from '@angular/core';
import { ComputingSystem } from '../app/services/computing-system.service';

@Injectable({ providedIn: 'root' })
export class AutomodeService {
  run(chartData: any[], onProcessStop: Function) {
    let sourceSize = 2;
    let bufferSize = 2;
    let devicesSize = 2;
    let requestsSize = 5;

    let deviceData = {};
    let deviceLabels = [];
    let deviceDataset1 = [];
    let deviceDataset2 = [];
    let deviceDataset3 = [];

    for (let i = 5; i <= 10; i += 5) {
      console.log(`device loop ${i}`);

      const system = new ComputingSystem();
      system.start(sourceSize, bufferSize, i, requestsSize, onProcessStop);

      console.log(`leave mainService loop ${i}`);
      let rejectNum = this.rejectionProbability(system.reject, system.requests.length);
      let reqTime = this.averageTimeOfRequest(system.requests);
      let deviceTime = this.averageUsageOfDevice(system.devices, system.systemTime);

      deviceLabels.push(i);
      deviceDataset1.push(rejectNum);
      deviceDataset2.push(reqTime);
      deviceDataset3.push(deviceTime);
    }

    deviceData = {
      labels: deviceLabels,
      datasets: [
        {
          label: 'вероятность отказа',
          data: deviceDataset1,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
        {
          label: 'среднее время заявки в системе',
          data: deviceDataset2,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
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

    let bufferData = {};
    let bufferLabels = [];
    let bufferDataset1 = [];
    let bufferDataset2 = [];
    let bufferDataset3 = [];
    for (let i = 5; i <= 10; i += 5) {
      console.log('START SECOND LOOP');
      const system = new ComputingSystem();
      system.start(sourceSize, bufferSize, i, requestsSize, onProcessStop);

      let rejectNum = this.rejectionProbability(system.reject, system.requests.length);
      let reqTime = this.averageTimeOfRequest(system.requests);
      let deviceTime = this.averageUsageOfDevice(system.devices, system.systemTime);

      bufferLabels.push(i);
      bufferDataset1.push(rejectNum);
      bufferDataset2.push(reqTime);
      bufferDataset3.push(deviceTime);
    }
    bufferData = {
      labels: bufferLabels,
      datasets: [
        {
          label: 'вероятность отказа',
          data: bufferDataset1,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
        {
          label: 'среднее время заявки в системе',
          data: bufferDataset2,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
        {
          label: 'средняя загруженность приборов',
          data: bufferDataset3,
          fill: false,
          borderColor: '#00bb7e',
          tension: 0.4,
        },
      ],
    };

    console.log('STOP SECOND LOOP');

    let sourceData = {};
    let sourceLabels = [];
    let sourceDataset1 = [];
    let sourceDataset2 = [];
    let sourceDataset3 = [];
    for (let i = 5; i <= 10; i += 5) {
      console.log('START THIRD LOOP');
      const system = new ComputingSystem();
      system.start(sourceSize, bufferSize, i, requestsSize, onProcessStop);

      let rejectNum = this.rejectionProbability(system.reject, system.requests.length);
      let reqTime = this.averageTimeOfRequest(system.requests);
      let deviceTime = this.averageUsageOfDevice(system.devices, system.systemTime);
      sourceLabels.push(i);
      sourceDataset1.push(rejectNum);
      sourceDataset2.push(reqTime);
      sourceDataset3.push(deviceTime);
    }
    console.log('STOP THIRD LOOP');
    sourceData = {
      labels: sourceLabels,
      datasets: [
        {
          label: 'вероятность отказа',
          data: sourceDataset1,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        },
        {
          label: 'среднее время заявки в системе',
          data: sourceDataset2,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
        {
          label: 'средняя загруженность приборов',
          data: sourceDataset3,
          fill: false,
          borderColor: '#00bb7e',
          tension: 0.4,
        },
      ],
    };

    chartData = [deviceData, bufferData, sourceData];
    return chartData;
  }

  rejectionProbability(rejectedNum: number, allRequestsNum: number): number {
    return rejectedNum / allRequestsNum;
  }

  averageTimeOfRequest(requests: any[]): number {
    let timeSum = 0;
    requests.forEach((req) => (timeSum += req.timeInSystem));
    return timeSum / requests.length;
  }

  averageUsageOfDevice(devices: any[], systemTime: number) {
    let timeSum = 0;
    devices.forEach((device) => (timeSum += device.workTime));
    return timeSum / systemTime;
  }
}
