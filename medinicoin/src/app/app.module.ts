import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';

import {InputTextareaModule} from 'primeng/inputtextarea';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {PanelModule} from 'primeng/panel';
import {AccordionModule} from 'primeng/accordion';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ToastModule} from 'primeng/toast';
import {InputNumberModule} from 'primeng/inputnumber';

import { BlockchainComponent } from './blockchain/blockchain.component';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    BlockchainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    InputTextareaModule,
    ButtonModule,
    CardModule,
    FormsModule,
    PanelModule,
    BrowserAnimationsModule,
    AccordionModule,
    ScrollPanelModule,
    ToastModule,
    InputNumberModule
  ],
  providers: [{ provide: Window, useValue: window },MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
