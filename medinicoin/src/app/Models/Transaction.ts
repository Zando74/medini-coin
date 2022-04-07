import JSEncrypt from 'jsencrypt';

import * as CryptoJS from 'crypto-js';
import { Block } from './Block';

class Transaction {

    private from : string;
    private to : string;
    private amount : number;
    private signature: string;

    constructor(from : string, to : string, amount : number, signature : string) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.signature = signature
    }

    public verifyTransaction = () => {
        let jsencrypt = new JSEncrypt();
        jsencrypt.setPublicKey(this.from);

       return jsencrypt.verify(`${this.from}-${this.to}-${this.amount}`,this.signature,CryptoJS.SHA256 as unknown as (str: string) => string)
    }

    public validTransaction = (blocks: Block[], currentTransactions : Transaction[],blockchainCheck = false) => {
        let funds = 0;
        for(let block of blocks){
            if(block.getMiner() == this.from){
                funds+=10;
            }
            for(let transaction of block.getTransactions()){
                if(transaction.getFrom() == this.from){
                    funds -= transaction.getAmount();
                }
                if(transaction.getTo() == this.from){
                    funds += transaction.getAmount();
                }
            }
        }
        for(let transaction of currentTransactions){
            if((transaction.getFrom() == this.from)&&(!blockchainCheck)){
                funds -= transaction.getAmount();
            }
        }
        if(funds < this.amount){
            return false;
        }else{
            return true;
        }
    }

    getFrom() {
        return this.from;
    }

    getTo() {
        return this.to;
    }

    getAmount() {
        return this.amount;
    }

    getSignature() {
        return this.signature;
    }
}

export { Transaction };