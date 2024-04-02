const { ethers, upgrades } = require('hardhat')
const saveToConfig = require('../utils/saveToConfig')
const readFromConfig = require('../utils/readFromConfig')
const deploySettings = require('./deploySettings')

async function main () {

  const chainId = await hre.getChainId()
  console.log("STARTING PRIVASEAL UPGRADE ON ", chainId)
  const CHAIN_NAME = deploySettings[chainId].CHAIN_NAME

  const PrivaSealV2 = await ethers.getContractFactory('PrivaSeal')

  const privaSealABI = (await artifacts.readArtifact('PrivaSeal')).abi
  await saveToConfig(`PRIVASEAL_${CHAIN_NAME}`, 'ABI', privaSealABI)

  const privaSealAddress = await readFromConfig(`PRIVASEAL_${CHAIN_NAME}`, 'ADDRESS')

  console.log('Upgrading PrivaSeal Contract...')
  const tx = await upgrades.upgradeProxy(privaSealAddress, PrivaSealV2)
  await new Promise((resolve) => setTimeout(resolve, 25000)) // 25 seconds
  console.log('PrivaSeal upgraded')

  console.log('Verifying PrivaSeal Implementation Contract...')
  try {
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress(privaSealAddress)
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
