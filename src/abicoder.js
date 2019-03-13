const { Keccak256 }  = require("@iov/crypto");
const { Encoding }  = require("@iov/encoding");

const { AbiCoder } = require("web3x/ethers/abi-coder");

const addrToParam = addr => '0'.repeat(24) + addr.slice(2).toLowerCase();

const numToParam = num => {
  const val = num.toString(16);
  padding = 64 - val.length;
  return '0'.repeat(padding) + val;
}

const calcMethodId = signature => Encoding.toHex(new Keccak256(signature).digest()).slice(0, 8);

const newAbiCoder = () => new AbiCoder((type, value) => {
  if (type.match(/^u?int/) && !isArray(value) && (!isObject(value) || value.constructor.name !== 'BN')) {
    return value.toString();
  }
  return value;
});


const buildSignature = json => {
  if (typeof json === "object" && json.name && json.name.indexOf('(') !== -1) {
    return json.name;
  }
  return json.name + '(' + flattenTypes(false, json.inputs).join(',') + ')';
};

const encodeParameters = (abiCoder, inputs, params) => abiCoder.encode(inputs, params);

/**
 * Should be used to flatten json abi inputs/outputs into an array of type-representing-strings
 *
 * @method flattenTypes
 * @param {bool} includeTuple
 * @param {Object} puts
 * @return {Array} parameters as strings
 */
function flattenTypes(includeTuple, puts) {
  // console.log("entered _flattenTypes. inputs/outputs: " + puts)
  const types = [];

  puts.forEach(param => {
    if (typeof param.components === 'object') {
      if (param.type.substring(0, 5) !== 'tuple') {
        throw new Error('components found but type is not tuple; report on GitHub');
      }
      let suffix = '';
      const arrayBracket = param.type.indexOf('[');
      if (arrayBracket >= 0) {
        suffix = param.type.substring(arrayBracket);
      }
      const result = flattenTypes(includeTuple, param.components);
      // console.log("result should have things: " + result)
      if (isArray(result) && includeTuple) {
        // console.log("include tuple word, and its an array. joining...: " + result.types)
        types.push('tuple(' + result.join(',') + ')' + suffix);
      } else if (!includeTuple) {
        // console.log("don't include tuple, but its an array. joining...: " + result)
        types.push('(' + result.join(',') + ')' + suffix);
      } else {
        // console.log("its a single type within a tuple: " + result.types)
        types.push('(' + result + ')');
      }
    } else {
      // console.log("its a type and not directly in a tuple: " + param.type)
      types.push(param.type);
    }
  });

  return types;
}

module.exports = {
  addrToParam,
  buildSignature,
  numToParam,
  calcMethodId,
  newAbiCoder,
  encodeParameters,
}
