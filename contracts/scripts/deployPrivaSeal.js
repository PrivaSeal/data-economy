const { artifacts, ethers, upgrades } = require('hardhat')
const getNamedSigners = require('../utils/getNamedSigners')
const saveToConfig = require('../utils/saveToConfig')
const readFromConfig = require('../utils/readFromConfig')
const deploySettings = require('./deploySettings')

async function main () {

  const chainId = await hre.getChainId()
  console.log("STARTING PRIVASEAL DEPLOYMENT ON ", chainId)

  const CHAIN_NAME = deploySettings[chainId].CHAIN_NAME
  // const EIP712_NAME = deploySettings[chainId].EIP712_NAME
  // const EIP712_VERSION = deploySettings[chainId].EIP712_VERSION
  const EAS_ADDRESS = deploySettings[chainId].EAS_ADDRESS
  const EAS_SCHEMA_REGISTRY_ADDRESS = deploySettings[chainId].EAS_SCHEMA_REGISTRY_ADDRESS

  console.log('Deploying PrivaSeal Smart Contract')
  const {payDeployer} =  await getNamedSigners();

  const PRIVASEAL_CONTRACT = await ethers.getContractFactory('PrivaSeal')
  PRIVASEAL_CONTRACT.connect(payDeployer)


  const payABI = (await artifacts.readArtifact('PrivaSeal')).abi
  await saveToConfig(`PRIVASEAL_${CHAIN_NAME}`, 'ABI', payABI)

  const privaSealContract = await upgrades.deployProxy(PRIVASEAL_CONTRACT, [EAS_ADDRESS, EAS_SCHEMA_REGISTRY_ADDRESS], { initializer: 'initialize' })
  await privaSealContract.deployed()

  await saveToConfig(`PRIVASEAL_${CHAIN_NAME}`, 'ADDRESS', privaSealContract.address)
  console.log('PrivaSeal contract deployed to:', privaSealContract.address, ` on ${CHAIN_NAME}`)



  console.log('Verifying PrivaSeal Implementation Contract...')
  try {
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress(privaSealContract.address)
    console.log('current implementation address: ', currentImplAddress)
    await run('verify:verify', {
      address: currentImplAddress,
      contract: 'contracts/PrivaSeal.sol:PrivaSeal', // Filename.sol:ClassName
      constructorArguments: [],
      network: deploySettings[chainId].NETWORK_NAME
    })
  } catch (error) {
    console.log(error)
  }

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
