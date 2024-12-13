import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule

import { AppComponent } from './app.component';
import { SafePipe } from './safe.pipe';
import { LOAD_WASM, NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';

LOAD_WASM().subscribe((res: any) => {
  console.log('LOAD_WASM', res);
});

@NgModule({
  declarations: [
    AppComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxScannerQrcodeModule,
    HttpClientModule  // Add HttpClientModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
