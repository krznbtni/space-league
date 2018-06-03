import web3 from 'Embark/web3';
import EmbarkJS from 'Embark/EmbarkJS';
let SafeMathJSONConfig = {
  "contract_name": "SafeMath",
  "address": "0xdB8e7B94D159662883651f1A8436B1B2d569c909",
  "code": "604c602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f30073000000000000000000000000000000000000000030146080604052600080fd00a165627a7a72305820b0ce6d31d0d0e8c3281041179ed7360566edbe67d388f6bb001287bb1addae7f0029",
  "runtime_bytecode": "73000000000000000000000000000000000000000030146080604052600080fd00a165627a7a72305820b0ce6d31d0d0e8c3281041179ed7360566edbe67d388f6bb001287bb1addae7f0029",
  "real_runtime_bytecode": "73000000000000000000000000000000000000000030146080604052600080fd00a165627a7a72305820b0ce6d31d0d0e8c3281041179ed7360566edbe67d388f6bb001287bb1addae7f0029",
  "swarm_hash": "b0ce6d31d0d0e8c3281041179ed7360566edbe67d388f6bb001287bb1addae7f",
  "gas_estimates": {
    "creation": {
      "codeDepositCost": "15200",
      "executionCost": "116",
      "totalCost": "15316"
    },
    "internal": {
      "add(uint256,uint256)": "infinite",
      "div(uint256,uint256)": "infinite",
      "mul(uint256,uint256)": "infinite",
      "sub(uint256,uint256)": "infinite"
    }
  },
  "function_hashes": {},
  "abi": []
}
;
let SafeMath = new EmbarkJS.Contract(SafeMathJSONConfig);

__embarkContext.execWhenReady(function() {

SafeMath.setProvider(web3.currentProvider);

SafeMath.options.from = web3.eth.defaultAccount;

});
export default SafeMath;
