import { Injectable } from '@angular/core';
import JSEncrypt from 'jsencrypt';


@Injectable({
  providedIn: 'root'
})
export class KeypairService {

  jsEncrypt;
  loaded = false;

  generateKeys = () => {
    this.jsEncrypt.getKey();
    this.loaded = true;
  }

  importKeys = (pbk : string, pvk: string) => {
    this.jsEncrypt.setPublicKey(pbk);
    this.jsEncrypt.setPrivateKey(pvk);
    this.loaded = true;
  }

  exportPublicKey = () => {
    return this.jsEncrypt.getPublicKey();
  }

  exportPrivateKey = () => {
    return this.jsEncrypt.getPrivateKey();
  }

  constructor() {
    this.jsEncrypt = new JSEncrypt();
   }
}
