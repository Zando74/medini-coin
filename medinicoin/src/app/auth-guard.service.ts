import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeypairService } from './services/keypair.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private keyPairService: KeypairService, public router: Router) { }
  async canActivate() {
    if(this.keyPairService.loaded == true)
      return true
    this.router.navigate([''])
    return false;
  }
}
