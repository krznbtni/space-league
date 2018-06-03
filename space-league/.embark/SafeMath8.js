import web3 from 'Embark/web3';
import EmbarkJS from 'Embark/EmbarkJS';
let SafeMath8JSONConfig = {
  "contract_name": "SafeMath8",
  "address": "0xa1A6620fEde78C32c29622Bbc6c393664280dcEB",
  "code": "604c602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f30073000000000000000000000000000000000000000030146080604052600080fd00a165627a7a7230582020758bc9d1c0d91a1830efe6695646421f600da7310c15fe69d50bd3489ceff00029",
  "runtime_bytecode": "73000000000000000000000000000000000000000030146080604052600080fd00a165627a7a7230582020758bc9d1c0d91a1830efe6695646421f600da7310c15fe69d50bd3489ceff00029",
  "real_runtime_bytecode": "73000000000000000000000000000000000000000030146080604052600080fd00a165627a7a7230582020758bc9d1c0d91a1830efe6695646421f600da7310c15fe69d50bd3489ceff00029",
  "swarm_hash": "20758bc9d1c0d91a1830efe6695646421f600da7310c15fe69d50bd3489ceff0",
  "gas_estimates": {
    "creation": {
      "codeDepositCost": "15200",
      "executionCost": "116",
      "totalCost": "15316"
    },
    "internal": {
      "add(uint8,uint8)": "infinite",
      "div(uint8,uint8)": "infinite",
      "mul(uint8,uint8)": "infinite",
      "sub(uint8,uint8)": "infinite"
    }
  },
  "function_hashes": {},
  "abi": []
}
;
let SafeMath8 = new EmbarkJS.Contract(SafeMath8JSONConfig);

__embarkContext.execWhenReady(function() {

SafeMath8.setProvider(web3.currentProvider);

SafeMath8.options.from = web3.eth.defaultAccount;

});
export default SafeMath8;
