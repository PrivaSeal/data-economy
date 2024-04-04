import React, { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"
import { magic } from "./config"


// Create the context with default values
const Web3Context = createContext()

// Custom hook to use the Web3 context
export const useMagic = () => useContext(Web3Context)

// Provider component to wrap around components that need access to the context
export const MagicWeb3Provider = ({children}) => {
  // State variable to hold an instance of Web3
  const [provider, setProvider] = useState(null)
  const [address, setAddress] = useState(null)
  const [signer, setSigner] = useState(null)
  const [isMagicConnected, setIsMagicConnected] = useState(false)

  // Initialize Web3
  const initializeWeb3 = async () => {
    
 try {
     // Get the provider from the Magic instance
     const magicProvider = await magic.wallet.getProvider()
 
     // Create a new instance of Web3 with the provider
     const provider = new ethers.providers.Web3Provider(magicProvider)
     const signer = provider.getSigner()
     const address = await signer.getAddress()
     console.log("Network",(await provider.getNetwork()).chainId)
     // Save the instance to state
     setProvider(provider)
     setAddress(address)
     setSigner(signer)
     setIsMagicConnected(true)
 } catch (error) {
  console.log(error)
  setIsMagicConnected(false)
  setProvider(null)
  setAddress(null)
  setSigner(null)
 }
  }

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3()
  }, [])

  return (
    <Web3Context.Provider
      value={{
        provider,
        initializeWeb3,
        magicAddress: address,
        signer,
        isMagicConnected
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}