import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ScannerQRCodeConfig, NgxScannerQrcodeService, ScannerQRCodeSelectedFiles, ScannerQRCodeResult, NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  public config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: window.innerWidth
      },
    },
  };

  public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
  public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];
  public percentage = 80;
  public quality = 100;
  private isZoomed = false;

  public batchNumber: string = '';  // Property to capture batch number from the input

  @ViewChild('action') action!: NgxScannerQrcodeComponent;

  constructor(
    private qrcode: NgxScannerQrcodeService,
    private dataService: DataService
  ) { }

  ngAfterViewInit(): void {
    this.action.isReady.subscribe(() => {
      this.handle(this.action, 'start');
    });
  }

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    console.log(e);
    if (e && e.length > 0 && e[0].value) {
      const scannedText = e[0].value;

      this.zoomToQRCode();

      const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
      if (urlPattern.test(scannedText)) {
        window.open(scannedText, '_blank');
      }

      const payload = {
        batch_number: this.batchNumber,  // Capture batch number from the input field
        qr_data: scannedText,
        scan_timestamp: new Date().toISOString(),
        image_path: '',
      };

      this.sendScanDataToBackend(payload);
    }
  }

  private sendScanDataToBackend(payload: any): void {
    this.dataService.saveScan(payload).subscribe({
      next: (response: any) => {
        console.log('Scan data sent successfully:', response);
      },
      error: (error: any) => {
        console.error('Error sending scan data:', error);
      }
    });
  }

  public handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label)));
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe(
        (r: any) => console.log(fn, r),
        (error: any) => alert(error)
      );
    } else {
      action[fn]().subscribe(
        (r: any) => console.log(fn, r),
        (error: any) => alert(error)
      );
    }
  }

  public onDownload(action: NgxScannerQrcodeComponent) {
    action.download().subscribe(console.log, alert);
  }

  public onSelects(files: any) {
    this.qrcode.loadFiles(files, this.percentage, this.quality).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
      this.qrCodeResult = res;
    });
  }

  public onSelects2(files: any) {
    this.qrcode.loadFilesToScan(files, this.config, this.percentage, this.quality).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
      console.log(res);
      this.qrCodeResult2 = res;
    });
  }

  public onGetConstraints() {
    const constraints = this.action.getConstraints();
    console.log(constraints);
  }

  public applyConstraints() {
    const constraints = this.action.applyConstraints({
      ...this.action.getConstraints(),
      width: 510
    });
    console.log(constraints);
  }

  private zoomToQRCode() {
    if (!this.isZoomed) {
      const videoConstraints = this.config.constraints?.video ?? {};

      const constraints = this.action.applyConstraints({
        ...this.action.getConstraints(),
        video: {
          ...(typeof videoConstraints === 'object' ? videoConstraints : {}),
          width: 320,
          height: 320,
        }
      });

      this.isZoomed = true;
      console.log('Zoom applied:', constraints);
    }
  }
}