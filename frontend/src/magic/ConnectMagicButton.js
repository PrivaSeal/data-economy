import { Button } from "reactstrap"
import { magic } from "./config"
import { useMagic } from "./magicContext"

const ConnectMagicButton = () => {
  // Get the initializeWeb3 function from the Web3 context
  const { initializeWeb3 } = useMagic()

  // Define the event handler for the button click
  const handleConnect = async () => {
    try {
      // Try to connect to the wallet using Magic's user interface
      await magic.wallet.connectWithUI()

      // If connection to the wallet was successful, initialize new Web3 instance
      initializeWeb3()
    } catch (error) {
      // Log any errors that occur during the connection process
      console.error("handleConnect:", error)
    }
  }

  // Render the button component with the click event handler
 
  return  <Button
  className="btn-neutral btn-icon"
  color="default"
  href="#pablo"
  onClick={handleConnect}
>
  <span className="btn-inner--icon">
    <img
      alt="..."
      src={
        require("../assets/img/icons/common/magic.svg")
          .default
      }
    />
  </span>
  <span className="btn-inner--text">Magic</span>
</Button>
}

export default ConnectMagicButton