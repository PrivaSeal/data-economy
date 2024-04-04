import { Button } from "reactstrap"
import { magic } from "./config"
import { useMagic } from "./magicContext"
import { useNavigate } from "react-router-dom"

const DisconnectMagicButton = () => {
  // Get the initializeWeb3 function from the Web3 context
  const { initializeWeb3 } = useMagic()
  const navigate = useNavigate();

  // Define the event handler for the button click
  const handleDisconnect = async (e) => {
    e.preventDefault();
    console.log("Magic Disconnect Called")
    try {
      // Try to disconnect the user's wallet using Magic's logout method
      await magic.user.logout()

      // After successful disconnection, re-initialize the Web3 instance
      initializeWeb3()

    } catch (error) {
      // Log any errors that occur during the disconnection process
      console.log("handleDisconnect:", error)
    }
  }

  // Render the button component with the click event handler
  return <Button onClick={handleDisconnect}>Disconnect</Button>
}

export default DisconnectMagicButton