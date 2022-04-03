import { Block } from "./Block";
class ProofOfWork {
    public static generateProof = (block : Block) => new Promise( (res,rej) => {
        let loop = setInterval(() => {
            block.setNonce(Math.random() * 10000000001);
            ProofOfWork.currentHash = block.hashValue();
            if((ProofOfWork.foundByAnother == true)){
                clearInterval(loop)
                res(false)
                ProofOfWork.foundByAnother = false;
            }
            if(ProofOfWork.isProofValid(block)){
                clearInterval(loop);
                res(true)
            }
        }, 10);
    });
    
    public static isProofValid = (block : Block) => {
      return block.getHash().startsWith('000');
    };

    public static foundByAnother = false;

    public static currentHash = '';

}


export { ProofOfWork };