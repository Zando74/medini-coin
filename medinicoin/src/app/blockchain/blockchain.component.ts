import { Component, OnInit } from '@angular/core';
import { Transaction } from '../Models/Transaction';
import { KeypairService } from '../services/keypair.service';
import { PeerService } from '../services/peer.service';
import * as CryptoJS from 'crypto-js'
import { Blockchain } from '../Models/Chain';
import { MessageService } from 'primeng/api';
import Peer from 'peerjs';
import { BlockchainService } from '../services/blockchain.service';
import JSEncrypt from 'jsencrypt';
import { ProofOfWork } from '../Models/ProofOfWork';

@Component({
  selector: 'app-blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.scss']
})
export class BlockchainComponent implements OnInit {

  constructor(private keyPairService: KeypairService, public peerService : PeerService, private messageService: MessageService, public blockchainService : BlockchainService) { }

  publicKey! : string;
  privateKey! : string;
  funds! : number;

  amountToSend! : number;
  pbkToSend! : string;

  isMining = false;

  proof = ProofOfWork;




  async ngOnInit(): Promise<void> {
    this.publicKey = this.keyPairService.exportPublicKey();
    this.privateKey = this.keyPairService.exportPrivateKey();
    //this.funds = this.blockchainService.blockchain.fundsOf(this.publicKey);


    await this.peerService.start();


    
  
  }


  buildNewTransaction = () => {
    if((this.amountToSend != undefined) && (this.amountToSend > 0)){
      let toSend;
      try{
        // cast public key to send
        let genkey = new JSEncrypt();
        genkey.setPublicKey(this.pbkToSend)
        toSend = genkey.getPublicKey().toString()
      }catch(error){
        this.messageService.add({severity:'error', summary: "Une erreur c'est produite", detail: 'Véfifiez la clé renseigné'});
        return;
      }
      let res = this.blockchainService.buildNewTransaction(this.publicKey,this.amountToSend,toSend as string);
      if(res) {
        let id = Math.random() * 1000000000;
        for(let dt of this.blockchainService.connectedPeer){
          this.peerService.eventAchieved.push(id);
          dt.send(JSON.stringify({ id : id, header : 'blockchain:transaction', data : this.blockchainService.blockchain.getCurrentTransactions()[this.blockchainService.blockchain.getCurrentTransactions().length-1] }));
          
        }
        this.amountToSend = 0;
        this.pbkToSend = "";
        this.messageService.add({severity:'success', summary: 'Transaction émise', detail: 'La transaction sera miné une fois que la poule de transactions sera pleine !'});
      }else{
        this.messageService.add({severity:'error', summary: "Une erreur c'est produite", detail: 'Véfifiez votre solde'});
      } 
    }
  }

}
