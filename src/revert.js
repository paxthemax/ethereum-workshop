const Web3 = require('web3')

const INFURA = 'wss://ropsten.infura.io/ws/v3/ac7be83dc8734085b4eaa3fd8ee876fb'
const GANACHE = 'ws://127.0.0.1:8545'

const client = new Web3(GANACHE)

const promisedCall = async (method, params) => {
  return new Promise((resolve, reject) => {
    client.currentProvider.send({
      method: method,
      params: params,
      jsonrpc: "2.0",
      id: new Date().getTime()
    }, (err, data) => {
      if (err) return reject(err)
      
      return resolve(data)
    })
  })
}

const snapshotChain = async () => {
  let data = await promisedCall('evm_snapshot', [])
  let id = parseInt(data.result)
  console.log('Snapshot created with id', id)
  return id
}

const revertChain = async (snapId) => {
  let data = await promisedCall('evm_revert', [snapId])
  console.log('EVM reverted to snapshot with id', snapId)
  return data.result
}

let lastNum = 0
const postTransaction = async (privateKey) => {
  const account = client.eth.accounts.privateKeyToAccount(privateKey)
  
  const transaction = {
    from: account.address,
    to: '0x297b6af350a691a662bdcbfca7f24b146822cc8' + lastNum++,
    value: client.utils.toHex(client.utils.toWei("0.003", "ether")),
    gas: 220000,
    chainId: 3
  };
  
  const signedTransaction = await client.eth.accounts.signTransaction(transaction, privateKey);

  const result = await client.eth.sendSignedTransaction(signedTransaction.rawTransaction)
  console.log('Sent transaction', result.transactionHash, result.blockNumber)

  return result.transactionHash
}

(async () => {
  const PRIVATE_KEY = '0x4423f714b8661cfd330636955510b33a53be01c3f9cdc8b2f90695e514c76c86'

  await postTransaction(PRIVATE_KEY) // 1
  await postTransaction(PRIVATE_KEY) // 2

  const snap1 = await snapshotChain()

  await postTransaction(PRIVATE_KEY) // 3
  const txHash = await postTransaction(PRIVATE_KEY) // 4 Magic
  // console.log('TX', txHash)
  await postTransaction(PRIVATE_KEY) // 5

  await revertChain(snap1)

  await postTransaction(PRIVATE_KEY) // 3

  //currentBlock - tx.block 

  console.log('Tx after revert', await client.eth.getTransaction(txHash))
})()