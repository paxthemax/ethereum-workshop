(async () => {
  const Web3 = require('web3')
  const Tx = require('ethereumjs-tx')
  const ganache = require('ganache-cli')

  const INFURA = 'wss://ropsten.infura.io/ws/v3/ac7be83dc8734085b4eaa3fd8ee876fb'
  // const GANACHE = ganache.provider()
  const GANACHE = 'ws://127.0.0.1:8545'

  // privateKey = Buffer.from('58162349851bb4da14a33d1e45f9571ac91eabbbd64b6a8caa0e1892f13384cd', 'hex')

  const client = new Web3(GANACHE)


  client.eth.getBlockNumber().then(data => console.log(data))

  let sub = client.eth.subscribe('pendingTransactions', (err, res) => {
    console.log(err, res)
  })

  sub.on('data', async data => {
    // console.log('DATA', data)
    console.log('DATA', await client.eth.getTransaction(data))
  })

  // sub.on('changed', data => {
  //   if (data.removed) {
  //     console.log("STETA")
  //   }
  //   console.log('Changed', data)
  // })

  sub.on('error', data => {
    console.log('Error', data)
  })

  const account = client.eth.accounts.privateKeyToAccount('0x58162349851bb4da14a33d1e45f9571ac91eabbbd64b6a8caa0e1892f13384cd');

  const rawTransaction = {
    from: '0x0997e2c066497df26b87c8c00b7638541260efdd',
    to: '0x297b6af350a691a662bdcbfca7f24b146822cc81',
    value: client.utils.toHex(client.utils.toWei("0.003", "ether")),
    gas: 220000,
    chainId: 3
  };

  try {
    const transaction = await client.eth.accounts.signTransaction(rawTransaction, '0x58162349851bb4da14a33d1e45f9571ac91eabbbd64b6a8caa0e1892f13384cd');
    console.log(transaction)
    client.eth.sendSignedTransaction(transaction.rawTransaction)
  } catch (error) {
    console.log("ERROR", error)
  }
})()

