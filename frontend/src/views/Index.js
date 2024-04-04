
import { useEffect, useState } from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import {  Link, Navigate } from "react-router-dom";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Form
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "variables/charts.js";

import Header from "components/Headers/Header.js";
import { useAccount, useDisconnect, useSwitchNetwork } from 'wagmi'
import { useContract, useSigner } from 'wagmi'

import privaSealContractData from '../config/contractData.json'
import { ethers } from "ethers";
import { getUserData } from "privaSeal/query";
import axios from "axios";
import { createTerm } from "privaSeal/transaction";
import WaitModal from "components/Modals/WaitModal";
import { Web3Storage } from 'web3.storage'
import config from '../config'
import { useMagic } from "magic/magicContext";


const Index = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  // FLow Data Query 
  const {switchNetwork} = useSwitchNetwork({
    chainId: 84531,
  })
  
  const { address, isConnected } = useAccount()
  const wagmiSigner = useSigner()
  const { signer: magicSigner, isMagicConnected} = useMagic()
  const signer = isConnected? wagmiSigner:{data: magicSigner}
  console.log("Signer : ->", signer)

  const [privaSealData, setPrivaSealData] = useState({});

  const [termId, setTermId] = useState(0)
  const [contractAddress, setContractAddress] = useState("")
  const [website, setWebsite] = useState("")
  const [updatable, setUpdatable] = useState(true)
  const [revocable, setRevocable] = useState(true)
  const [terms, setTerms] = useState({})

  const [txMsg, setTxMsg] = useState("")
  const [waitModal, setWaitModal] = useState(false);
  const waitModalToggle = () => setWaitModal(!waitModal);

  const fetchUserPrivaSealData = async () =>{
    const userData = await getUserData(signer)
    setPrivaSealData(userData)
  }

  useEffect(() => {
    fetchUserPrivaSealData()
  }, [signer.data])


  const sendFileToIPFS = async (e) => {
    if (terms) {
        try {

          const client = new Web3Storage({ token: config.WEB3STORAGE_TOKEN })
            const cid = await client.put(terms)
            const fileHashUrl = `ipfs://${cid}`;
            console.log('stored files with cid:', cid)
            return fileHashUrl;

        } catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
        }
    }
}

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    waitModalToggle()
    console.log("TermId", termId)
    console.log("ContractAddress", contractAddress)
    console.log("Website", website)
    console.log("Updatable", updatable)
    console.log("Revocable", revocable)
    console.log("Terms", terms)
    const imgHash = await sendFileToIPFS()

    const tx = await createTerm(termId, contractAddress, website, updatable, revocable, imgHash, signer, false, "")
    console.log(tx) 
    if(tx.status){
      setWaitModal(false)
      alert("Tx Successfull, Term Created!!")
      setTxMsg(`Term Created Successfully! Tx: https://calibration.filscan.io/tx/${tx.transactionHash}`)
    }else{
      setWaitModal(false)
      alert("Tx Failed, Term Not Created!!")
      setTxMsg("Transaction Failed")
    }
  }


  return (
    <>
      <Header privaSealData={privaSealData}/>
      {/* Page content */}
      <WaitModal modal={waitModal} toggle={waitModalToggle} />
      <Container className="mt-7" fluid>
        <h1 className="text-center">Create a Term</h1>
      <Form role="form">

          <FormGroup>
                <Label for="termId">
                  TermId
                </Label>
                <Input
                id="termId"
                placeholder="Enter TermId(A Unique Number)"
                type="text"
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                />
            </FormGroup>


          <FormGroup>
                <Label for="contractAddress">
                  Contract Address

                </Label>
                <Input
                id="contractAddress"
                placeholder="Enter Contract Address"
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </FormGroup>

          

            <FormGroup>
                <Label for="website">
                  Website

                </Label>
                <Input
                id="website"
                placeholder="Enter Website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </FormGroup>  


          <FormGroup>
                <Label for="updatableId">
                    Is Term Updatable
                </Label>
                <Input
                value={updatable}
                id="updatableId"
                name="updatable"
                type="select"
                onChange={(e) => {
                    console.log(e.target.value)
                    setUpdatable(e.target.value)}}
                >
                <option value={true}>
                true
                </option>
                <option value={false}>
                false
                </option>
                
                </Input>
            </FormGroup>
            <FormGroup>
                <Label for="revocableId">
                   Is Term Revocable
                </Label>
                <Input
                value={revocable}
                id="revocableId"
                name="revocable"
                type="select"
                onChange={(e) => {
                    console.log(e.target.value)
                    setRevocable(e.target.value)
                }}
                >
                <option value={true}>
                true
                </option>
                <option value={false}>
                false
                </option>
                
                </Input>
            </FormGroup>

            <FormGroup>
                <Label for="terms">
                  Terms 

                </Label>
                <Input
                id="terms"
                placeholder="Select a File"
                type="file"
                onChange={(e) => {
                  console.log(e.target.files)
                  setTerms(e.target.files)}}
              />
            </FormGroup>  
            <Button type='submit' onClick={handleCreateTerm}>Create Privaseal Term</Button>

            <h5>{txMsg}</h5>

</Form>
      </Container>
    </>
  );
};

export default Index;
