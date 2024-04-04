

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col
} from "reactstrap";

import { useAccount, useDisconnect } from 'wagmi'
import { Web3Button } from '@web3modal/react'
import { Web3NetworkSwitch } from '@web3modal/react'
import { Navigate } from "react-router-dom";
import ConnectMagicButton from "../../magic/ConnectMagicButton";
import { useMagic } from "../../magic/magicContext";

const Login = () => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { magicAddress, isMagicConnected } = useMagic()


  function loginWithGithub(){
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`)
  }


  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-5">
            <div className="text-muted text-center mt-2 mb-3">
              <small>Sign in with</small>
            </div>
            <div className="btn-wrapper text-center">
              <Button
                className="btn-neutral btn-icon"
                color="default"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  loginWithGithub()
                
                }}
              >
                <span className="btn-inner--icon">
                  <img
                    alt="..."
                    src={
                      require("../../assets/img/icons/common/github.svg")
                        .default
                    }
                  />
                </span>
                <span className="btn-inner--text"> Github</span>
              </Button>
              <Button
                className="btn-neutral btn-icon"
                color="default"
                href="#pablo"
                onClick={(e) => e.preventDefault()}
              >
                <span className="btn-inner--icon">
                  <img
                    alt="..."
                    src={
                      require("../../assets/img/icons/common/google.svg")
                        .default
                    }
                  />
                </span>
                <span className="btn-inner--text">Google</span>
              </Button>

             {isMagicConnected?(<Navigate to="/admin/" replace={true} />): (<ConnectMagicButton></ConnectMagicButton>) }
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Or sign in with wallet</small>
            </div>
            <div className="text-center">
            {
              isConnected ?
              (
                <div>
                  <Navigate to="/admin/" replace={true} />
                    Connected to {address}
                    <Web3NetworkSwitch />
                  <Button onClick={() => disconnect()}>Disconnect</Button>
                </div>
              ):           
              (<Web3Button></Web3Button>)
            }
            </div>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Forgot password?</small>
            </a>
          </Col>
          <Col className="text-right" xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Create new account</small>
            </a>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Login;
