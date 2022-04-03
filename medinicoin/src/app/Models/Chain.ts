import JSEncrypt from "jsencrypt";
import { KeypairService } from "../services/keypair.service";
import * as CryptoJS from 'crypto-js'
import { Block } from "./Block";

import { ProofOfWork } from "./ProofOfWork";
import { Transaction } from "./Transaction";
import Peer from "peerjs";

class Blockchain {

    private blocks : Block[]; // the blockchain
    private currentTransactions : Transaction[] // transaction waiting for mining;

    constructor(keyPairService : KeypairService) {
        let from ="GENESIS"
        let to = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCD1ayIk32ManS5X0+CnAy5gEpC
68lDM7xUwdbTzfHvD1753WILVCT1thNNVV8EwbHx8qLdZ7cYlwznzCvbo9LNTY1p
mnTH3sHDp8AKPQArTERhbyWmBKTs5zXc6NTVay9QD5g+mCUPWDxrUuw9PVbTKt8G
zuBPHNaRf5MuFUczeQIDAQAB
-----END PUBLIC KEY-----`;
        let amount = 1000;
        let signature = CryptoJS.SHA256(`${from}-${to}-${amount}`).toString(CryptoJS.enc.Hex);
        let firstTransaction = new Transaction(from,to,amount,signature);
        let hash = CryptoJS.SHA256(`${amount}-${firstTransaction}-${from}-${to}`).toString(CryptoJS.enc.Hex);
        this.blocks = [new Block(0, [firstTransaction], hash)];
        this.blocks[0].setMiner('GENESIS');
        this.blocks[0].hashValue();
        this.currentTransactions = [];

    }

    newTransaction(transaction : Transaction, publicKey :string, peerConnections : Peer.DataConnection[]) : boolean | any {
        if(!transaction.verifyTransaction()||!transaction.validTransaction(this.blocks)){
            return false;
        }else{
            this.currentTransactions.push(transaction);
            if (this.currentTransactions.length >= 2) {
              const previousBlock = this.lastBlock();
              const block = new Block(previousBlock.getIndex() + 1, this.currentTransactions, previousBlock.getHash() );
              block.setMiner(publicKey);
              ProofOfWork.foundByAnother = false;
              ProofOfWork.generateProof(block).then(res => {
                  if(res == true){
                      // emit it's me
                      let id = Math.random() * 1000000000;
                      for(let dt of peerConnections){
                          dt.send(JSON.stringify({ id: id, header : 'blockchain:mining', data : block }));
                      }
                    //this.currentTransactions = [];
                    //this.blocks.push(block);
                  }else{
                      ProofOfWork.foundByAnother = false;
                      // fetch the block mined
                  }
              });
            }
            return true;
        }
    }

    lastBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    getChain() {
        return this.blocks;
    }

    getCurrentTransactions() {
        return this.currentTransactions;
    }


    fundsOf(public_key : string){
        let funds = 0;
        for(let block of this.blocks){
            if(block.getMiner() == public_key){
                funds += 10;
            }
            for(let transaction of block.getTransactions()){
                if(transaction.getFrom() == public_key){
                    funds -= transaction.getAmount();
                }
                if(transaction.getTo() == public_key){
                    funds += transaction.getAmount();
                }
            }
        }
        return funds;
    }

    setChain(blocks : any[], currentTransactions : any[]){
        let chain = [];
        for(let block of blocks){
            let transactions = [];
            for(let transaction of block.transactions){
                transactions.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))
            }
            let newBlock = new Block(block.index,transactions,block.prev)
            newBlock.setMiner(block.miner)
            newBlock.setNonce(block.nonce);
            newBlock.hashValue();
            chain.push(newBlock)
        }
        this.blocks = chain;

        let currentTrans = []
        for(let transaction of currentTransactions){
            currentTrans.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))
        }

        this.currentTransactions = currentTrans

    }

    setCurrentTransaction(currentTransactions : any[]) {
        let currentTrans = []
        for(let transaction of currentTransactions){
            currentTrans.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))
        }

        this.currentTransactions = currentTrans
    }

    newMinedBlock(block : any) {
        if(block.index == this.lastBlock().getIndex()){
            this.currentTransactions = [];
            return;
        }
        let transactions = [];
        for(let transaction of block.transactions){
            transactions.push(new Transaction(transaction.from,transaction.to,transaction.amount,transaction.signature))
        }
        let newBlock = new Block(block.index,transactions,block.prev)
        newBlock.setMiner(block.miner)
        newBlock.setNonce(block.nonce);
        if(newBlock.hashValue().startsWith('000'))
            this.blocks.push(newBlock)
        this.currentTransactions = [];
    }


}

export { Blockchain };