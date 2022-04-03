import { Component, OnInit } from '@angular/core';
import { KeypairService } from '../services/keypair.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  stringPbk = "";
  stringPvk = "";

  stringPbkImport!  : string;
  stringPvkImport! : string;

  firstTime = false;

  error = "";

  keyloaded = false;

  constructor(private keyPairService : KeypairService) { }

  generateKey = () => {
    this.keyPairService.generateKeys();
    this.stringPvk = this.keyPairService.exportPrivateKey();
    this.stringPbk = this.keyPairService.exportPublicKey();
    this.keyloaded = true;
  }

  loadKey = () => {
    if((!this.stringPbkImport.startsWith('-----BEGIN PUBLIC KEY-----'))||(!this.stringPvkImport.startsWith('-----BEGIN RSA PRIVATE KEY-----'))){
      this.error = "Veuillez entrer des clés valides"
    }else{
      this.error = "";
      this.keyPairService.importKeys(this.stringPbkImport,this.stringPvkImport);
      this.keyloaded = true;
      this.stringPbk = this.keyPairService.exportPublicKey();
      this.stringPvk = this.keyPairService.exportPrivateKey();
    }
    
  }

  ngOnInit(): void {
  }

}
