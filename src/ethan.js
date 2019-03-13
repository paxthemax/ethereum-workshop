(async () => {
  const Web3 = require('web3')

  const INFURA = 'wss://ropsten.infura.io/ws/v3/ac7be83dc8734085b4eaa3fd8ee876fb'
  const GANACHE = 'ws://127.0.0.1:8545'

  const client = new Web3(INFURA)

  //Show me that the connection is ok
  let blockNum = await client.eth.getBlockNumber()
  console.log('Block number:', blockNum)

  let sub = client.eth.subscribe('newBlockHeaders');
  sub.on('data', async data => {
    console.log(`block ${data.number}: ${data.hash}`);
    if (data.number <= blockNum) {
      console.log("**********REORG**********")
    }
    blockNum = data.number;
  })

  sub.on('error', err => {
    console.error('ERROR', err)
  })
})()

