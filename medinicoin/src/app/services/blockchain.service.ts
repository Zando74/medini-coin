import { Injectable } from '@angular/core';
import { Block } from '../Models/Block';
import { Blockchain } from '../Models/Chain';
import { Transaction } from '../Models/Transaction';
import { KeypairService } from './keypair.service';
import { PeerService } from './peer.service';
import * as CryptoJS from 'crypto-js'
import Peer from 'peerjs';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  blockchain = new Blockchain(this.keyPairService);

  connectedPeer : Peer.DataConnection[] = [];

  updatedFunds! : number;

  securityCompromised = false;

  buildNewTransaction = (from : string, amountToSend : number, pbkToSend : string) => {
    if((amountToSend != undefined) && (amountToSend > 0)){
      let signature = this.keyPairService.jsEncrypt.sign(`${from}-${pbkToSend}-${amountToSend}`,CryptoJS.SHA256 as unknown as (str: string) => string,"sha256")
      let newTransaction = new Transaction(from,pbkToSend,amountToSend,signature as string);
      return this.blockchain.newTransaction(newTransaction,this.keyPairService.exportPublicKey(),this.connectedPeer);
    }
  }

  loadBlockchainFetched(data : { blocks: Block[], currentTransactions: Transaction[] }) {
    if(this.blockchain.getChain().length > data.blocks.length){
      this.recomputeFunds()
      return;
    }
    if(this.CheckBlockchainValidity(data.blocks,data.currentTransactions)&&this.checkCurrentTransactionValidity(data.blocks,data.currentTransactions)){
      if((this.blockchain.getChain().length == data.blocks.length)&&(this.blockchain.getCurrentTransactions().length < data.currentTransactions.length)){
        this.blockchain.setCurrentTransaction(data.currentTransactions);
        this.recomputeFunds();
        return;
      }
      this.blockchain.setChain(data.blocks,data.currentTransactions);
      this.recomputeFunds()
    }else{
      this.securityCompromised = true;
    }
  }

  checkCurrentTransactionValidity(blocks: any[], currentTransactions : any[]) {
    try{

      let chain = [];
      for(let block of blocks){
          let transactions = [];
          for(let transaction of block.transactions){
              transactions.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))

          }
          let newBlock = new Block(block.index,transactions,block.prev)
          newBlock.setNonce(block.nonce)
          newBlock.setMiner(block.miner);
          newBlock.hashValue();
          chain.push(newBlock)
      }

      let currTrans = [];
      for(let transaction of currentTransactions){
        currTrans.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))
      }

      for(let i=0;i<currentTransactions.length;i++){
        let newTransaction = new Transaction(currentTransactions[i].from,currentTransactions[i].to,currentTransactions[i].amount,currentTransactions[i].signature as string)
        if(!newTransaction.validTransaction(chain,currTrans)||!newTransaction.verifyTransaction()){

          return false;
        }
      }
      return true;
    }catch(error){

      return false;
    }
  }



  CheckBlockchainValidity(blocks : any,currentTransactions : any){
    try{
      let chain = [];
      for(let block of blocks){
          let transactions = [];
          for(let transaction of block.transactions){
              transactions.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))

          }
          let newBlock = new Block(block.index,transactions,block.prev)
          newBlock.setNonce(block.nonce)
          newBlock.setMiner(block.miner);
          newBlock.hashValue();
          chain.push(newBlock)
      }

      let currTrans = [];
      for(let transaction of currentTransactions){
        currTrans.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))
      }
      
      
      if(chain[0].getHash() != this.blockchain.getChain()[0].getHash()){
        console.log("first block error")
        return false;
      }
      if(chain[0].getPrev() != this.blockchain.getChain()[0].getPrev()){
        console.log("first block error")
        return false;
      }
      if(chain[0].getNonce() != this.blockchain.getChain()[0].getNonce()){
        console.log("first block error")
        return false;
      }
      for(let transaction of chain[0].getTransactions()){
        if(transaction.getFrom() != this.blockchain.getChain()[0].getTransactions()[0].getFrom()){
          console.log("first block error")
          return false;
        }
        if(transaction.getTo() != this.blockchain.getChain()[0].getTransactions()[0].getTo()){
          console.log("first block error")
          return false;
        }
        if(transaction.getAmount() != this.blockchain.getChain()[0].getTransactions()[0].getAmount()){
          console.log("first block error")
          return false;
        }
      }
      for(let i=1;i<chain.length;i++){
        // check transactions validity
        for(let j=0;j<chain[i].getTransactions().length;j++){
          let newTransaction : Transaction = new Transaction(chain[i].getTransactions()[j].getFrom(),chain[i].getTransactions()[j].getTo(),chain[i].getTransactions()[j].getAmount(),chain[i].getTransactions()[j].getSignature() as string)
          if(!newTransaction.verifyTransaction()){
            return false;
          }
        }
        //check block hash validity
        if(chain[i].getPrev() != chain[i-1].getHash()){
          console.log("hash precedent pas bon")
          return false;
        }
        if(!chain[i].hashValue().startsWith('000')){


          return false;
        }
      }
      return true;
    }catch(error){

      return false;
    }
  }

  recomputeFunds() {
    this.updatedFunds = this.blockchain.fundsOf(this.keyPairService.exportPublicKey())
  }

  constructor(public keyPairService : KeypairService) { 
    let refreshFunds = setInterval(() => {
      this.recomputeFunds();
    },7000)
    
  }
}
