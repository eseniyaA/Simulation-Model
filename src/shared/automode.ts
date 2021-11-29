import {Injectable} from "@angular/core";
import {Main} from "../app/app.component";

@Injectable({providedIn: "root"})
export class Automode {
  constructor(private main: Main) {
  }

  run() {
    this.main.start(3, 3, 3, 30);
  }



  printRejectDeviceStatistics() {

  }

}

