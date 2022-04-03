import { Transaction } from "./Transaction";
import * as CryptoJS from "crypto-js";

class Block {

    private index: number; // block indice
    private transactions: Array<Transaction>; // transactions to validate
    private prev: string; // ref to previous block hash
    private nonce : number; // random number used for proof of work algorithm
    private hash : string; // hash of the block
    private miner : string;

    constructor(index : number, transactions : Transaction[], prev : string) {
        this.index = index;
        this.transactions = transactions;
        this.prev = prev;
        this.hash = "";
        this.nonce = 0;
        this.miner = "";
    }

    hashValue() {
        const { index, nonce, transactions, prev, miner } = this;
        const blockString= `${index}-${JSON.stringify(transactions)}-${prev}-${nonce}-${miner}`;
        this.hash = CryptoJS.SHA256(blockString).toString(CryptoJS.enc.Hex);
        return this.hash;
    }

    setNonce(nonce : number) {
        this.nonce = nonce;
    }

    getIndex() {
        return this.index;
    }

    getHash() {
        return this.hash;
    }

    getTransactions() {
        return this.transactions;
    }

    getPrev() {
        return this.prev;
    }

    getNonce() {
        return this.nonce;
    }

    setMiner(pbk : string) {
        this.miner = pbk;
    }

    getMiner() {
        return this.miner;
    }
}

export { Block };