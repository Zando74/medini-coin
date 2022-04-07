import { Injectable } from '@angular/core';
import Peer, { DataConnection } from 'peerjs'
import { Blockchain } from '../Models/Chain';
import { ProofOfWork } from '../Models/ProofOfWork';
import { Transaction } from '../Models/Transaction';
import { BlockchainService } from './blockchain.service';

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  peer! : Peer;
  conn! : Peer.DataConnection;
  otherPeers : string[] = [];

  eventAchieved : number[] = [];

  networkStatus : string = "";

  

  

  start = async () => {
    this.peer = new Peer();
    this.peer.on('open', async () => {
      this.peer.on('connection', (dt) => {
        this.blockchainService.connectedPeer.push(dt);
        dt.on('data', (data) => {
          data = JSON.parse(data)

          if(data.header == "blockchain:request"){
            let id = Math.random() * 1000000000;
            dt.send(JSON.stringify({ id: id,  header: 'blockchain:fetch', data: {blocks: this.blockchainService.blockchain.getChain(), currentTransactions : this.blockchainService.blockchain.getCurrentTransactions() }}));
            this.eventAchieved.push(id);
          }
          if(data.header == "blockchain:fetch"){
            this.networkStatus = 'Récupération de la blockchain'
            this.blockchainService.loadBlockchainFetched(data.data);
          }
          if(data.header == 'blockchain:transaction'){
            if(!this.eventAchieved.includes(data.id)){
              this.eventAchieved.push(data.id)
              this.networkStatus = "Réception d'une transaction émise par un pair"

              let res = this.blockchainService.blockchain.newTransaction(new Transaction(data.data.from,data.data.to,data.data.amount,data.data.signature),this.blockchainService.keyPairService.exportPublicKey(),this.blockchainService.connectedPeer)
              if(res == false){
                console.log("transaction frauduleuse")
              }else{
                for(let dt of this.blockchainService.connectedPeer){
                  dt.send(JSON.stringify(data));
                  
                }
              } 
            }
            
          }
          if(data.header == "blockchain:mining"){
            if(!this.eventAchieved.includes(data.id)){
              this.networkStatus = "Réception d'un bloc miné par un pair"
              ProofOfWork.foundByAnother = true;
              this.eventAchieved.push(data.id);

              this.blockchainService.blockchain.newMinedBlock(data.data);
              for(let dt of this.blockchainService.connectedPeer){
                dt.send(JSON.stringify(data));
              }
            }
          }
        });
      })
      let alive = setInterval(async () => {
        let header = new Headers()
        header.append("Content-Type", "application/json");
        let requestOptions = {
          method: 'POST',
          headers: header,
          body : JSON.stringify({ peerId : this.peer.id })
        }
        let response = await fetch('https://crocovoit.com/peer',requestOptions);
        if(response.status != 200){
          console.log("une erreur c'est produite")
        }
      },5000)
      
      await this.getRandomPeer();
      
    })

    
  }

  getRandomPeer = async () => {
    let response = await fetch('https://crocovoit.com/peers');

    if(response.status == 200){
      this.otherPeers = await response.json()
    }

    this.otherPeers = this.otherPeers.filter( id => id != this.peer.id );

    if(this.otherPeers.length > 0){
      let randomPeer = Math.floor(Math.random() * this.otherPeers.length);
      this.conn = this.peer.connect(this.otherPeers[randomPeer]);
      this.networkStatus = `Tentative de connexion au peer : ${this.otherPeers[randomPeer]}`
      

      let checkliveness = setTimeout( async () => {

        let header = new Headers()
        header.append("Content-Type", "application/json");
        let requestOptions = {
          method: 'DELETE',
          headers: header,
          body : JSON.stringify({ peerId : this.otherPeers[randomPeer] })
        }
        let response = await fetch('https://crocovoit.com/peer',requestOptions);
        if(response.status != 200){
          console.log("une erreur c'est produite")
        }
        await this.getRandomPeer();
      }, 3000);
      
      

      this.conn.on('open', () => {
        this.blockchainService.connectedPeer.push(this.conn);
        this.setSocket(); 
        clearTimeout(checkliveness);

        this.networkStatus = `Connecté au Peer : ${this.conn.peer}`
        this.conn.send(JSON.stringify({ header: 'blockchain:request'}))
        
      })
    }else{
      this.networkStatus = `Aucun autre peer trouvé ;(`

      let searchForApeer = setTimeout(() => {
        this.getRandomPeer();
      },3000);
    }
  }

  setSocket = async () => {



    
    this.conn.on("data", (data) => {
      data = JSON.parse(data);
      if(data.header == "blockchain:fetch"){
        this.networkStatus = 'Récupération de la blockchain'
        this.blockchainService.loadBlockchainFetched(data.data);
      }
      if(data.header == 'blockchain:transaction'){
        if(!this.eventAchieved.includes(data.id)){
          this.eventAchieved.push(data.id)
          this.networkStatus = "Réception d'une transaction émise par un pair"
          let res = this.blockchainService.blockchain.newTransaction(new Transaction(data.data.from,data.data.to,data.data.amount,data.data.signature),this.blockchainService.keyPairService.exportPublicKey(),this.blockchainService.connectedPeer)
          if(res == false){
            console.log("transaction frauduleuse")
          }else{
            for(let dt of this.blockchainService.connectedPeer){
              dt.send(JSON.stringify(data));
              
            }
          } 
        }
        
      }
      if(data.header == "blockchain:mining"){
        if(!this.eventAchieved.includes(data.id)){
          ProofOfWork.foundByAnother = true;
          this.eventAchieved.push(data.id);

          this.networkStatus = "Réception d'un bloc miné par un pair"
          this.blockchainService.blockchain.newMinedBlock(data.data);
          for(let dt of this.blockchainService.connectedPeer){
            dt.send(JSON.stringify(data));
          }
        }
      }
    })

    

    this.conn.on('close', async () => {
      await this.getRandomPeer();
    })
    this.conn.on('error', async () => {
      await this.getRandomPeer();
    })
    
  }



  constructor(private blockchainService : BlockchainService) {
    setInterval(async () => {
      if(this.blockchainService.securityCompromised == true){
        this.networkStatus = "La sécurité sur cette blockchain semble compromise, connexion sur un autre réseau";
        this.blockchainService.securityCompromised = false;
        let header = new Headers();
        header.append("Content-Type", "application/json");
        let requestOptions = {
          method: 'DELETE',
          headers: header,
          body : JSON.stringify({ peerId : this.conn.peer })
        }
        let response = await fetch('https://crocovoit.com/peer',requestOptions);
        if(response.status == 200){
          this.networkStatus = "Peer frauduleux supprimée du réseau";
        }
        
        requestOptions = {
          method: 'DELETE',
          headers: header,
          body : JSON.stringify({ peerId : this.peer.id })
        }
        response = await fetch('https://crocovoit.com/peer',requestOptions);
        if(response.status == 200){
          this.networkStatus = "Reinitialisation de la connexion";
        }
        this.peer.disconnect();
        await this.start()
      }
    },5000)
   }
}
