
// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  UncontrolledTooltip,
  Button,
  Input,
  FormGroup,
  Label,Form
} from "reactstrap";
// core components

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccount, useDisconnect, useSigner } from "wagmi";
import { getCreatedTermsData } from "privaSeal/query";
import PrivateTermsHeader from "components/Headers/PrivateTermsHeader";
import { createTerm } from "privaSeal/transaction";
import axios from "axios";
import lighthouse from '@lighthouse-web3/sdk';
import config from '../../config'
import { getPrivateTermsData } from "privaSeal/query";
import { getInboxPrivateTermsData } from "privaSeal/query";
import { getCreatedPrivateTermsData } from "privaSeal/query";
import WaitModal from "components/Modals/WaitModal";
import { acceptTerm } from "privaSeal/transaction";
import { rejectTerm } from "privaSeal/transaction";
import { useMagic } from "magic/magicContext";
import EscrowTermHeader from "components/Headers/EscrowTermHeader";
import { getCreatedEscrowTermsData } from "privaSeal/query";
import { getInboxEscrowTermsData } from "privaSeal/query";
import { createEscrowAgreement } from "privaSeal/transaction";
import { utils } from "ethers";
import { acceptEscrowAgreement } from "privaSeal/transaction";
import { rejectEscrowAgreement } from "privaSeal/transaction";


const EscrowTerms = () => {

  const { address, isConnected } = useAccount()
  const wagmiSigner = useSigner()
  const { signer: magicSigner, isMagicConnected} = useMagic()
  const signer = isConnected? wagmiSigner:{data: magicSigner}
  console.log("Signer : ->", signer)

  const [termsData, settermsData] = useState([]);
  const [search, setSearch] = useSearchParams();

  const fetchUserPrivaSealData = async () =>{
  }

  const fetchtermsData = async () =>{
    const userData = await getCreatedEscrowTermsData(signer)
    const inboxPrivateTerms = await getInboxEscrowTermsData(signer)
    settermsData({createdPrivateTerms: userData, inboxPrivateTerms: inboxPrivateTerms})
  }



  useEffect(() => {
    fetchUserPrivaSealData()
    fetchtermsData()

  }, [signer.data])


  const [termId, setTermId] = useState(0);
  const [contractAddress, setContractAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [updatable, setUpdatable] = useState(true);
  const [revocable, setRevocable] = useState(true);
  const [terms, setTerms] = useState({});
  const [recipientAddress, setRecipientAddress] = useState("");
  const [txMsg, setTxMsg] = useState("");
  const [lockAmount, setLockAmount] = useState(0);
  const [releaseTime, setReleaseTime] = useState("");

  const [waitModal, setWaitModal] = useState(false);

  const waitModalToggle = () => setWaitModal(!waitModal);


  const encryptionSignature = async(signer) =>{
      const address = await signer.getAddress();
      const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
      const signedMessage = await signer.signMessage(messageRequested);

      return({
        signedMessage: signedMessage,
        publicKey: address
      });
    }


  const sendFileToIPFS = async (e) => {
    if (terms) {
        try {
          console.log(config.LIGHTHOUSE_API_KEY)
          let sig = await encryptionSignature(signer.data);
          const response = await lighthouse.uploadEncrypted(
            terms,
            config.LIGHTHOUSE_API_KEY,
            sig.publicKey,
            sig.signedMessage,
            null
          );
           console.log(response.data);
           const {Hash}=response.data[0]
            const fileHash = `ipfs://${Hash}`;
            console.log(response.data[0]); 
            let publicKeyUserB = recipientAddress.split(",")
            sig = await encryptionSignature(signer.data);
            const res = await lighthouse.shareFile(
              sig.publicKey,
              publicKeyUserB,
              Hash,
              sig.signedMessage
            );
            console.log(res)
            return fileHash;



        } catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
        }
    }
}

  const handleCreateEscrowTerm = async (e) => {
    e.preventDefault();
    waitModalToggle()
    console.log("TermId", termId)
    console.log("ContractAddress", contractAddress)
    console.log("Website", website)
    console.log("Updatable", updatable)
    console.log("Revocable", revocable)
    console.log("Terms", terms)
    const imgHash = await sendFileToIPFS()

    const tx = await createEscrowAgreement(
      termId,
      recipientAddress,
      website,
      updatable,
      revocable,
      imgHash,
      lockAmount,
      Date.parse(releaseTime),
      signer,
    )
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


  const getDecryptedFileUrl = async (ipfsUrl) =>{
    const openInNewTab = (url) => {
      window.open(url, "_blank", "noreferrer");
    };
    const cid = ipfsUrl.replace("ipfs://", "")
    const {publicKey, signedMessage} = await encryptionSignature(signer.data);
    const keyObject = await lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    );
    const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key);
    const url = URL.createObjectURL(decrypted);
    openInNewTab(url)
  }



  return (
    <>
      <WaitModal modal={waitModal} toggle={waitModalToggle} />

      {/* Page content */}
      <EscrowTermHeader terms={termsData}/>

      <Container className="mt-8" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow" >
              <CardHeader className="border-0">
                <h3 className="mb-0">Created Escrow Terms</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Term ID</th>
                    <th scope="col">Contract Address</th>
                    <th scope="col">Term Type </th>
                    <th scope="col">Website </th>
                    <th scope="col">EAS Schema</th>
                    <th scope="col">Updatable</th>
                    <th scope="col">Revocable</th>
                    <th scope="col">Terms URL</th>
                    <th scope="col">Recipient And Status</th>
                    <th scope="col">Lock Amount</th>
                    <th scope="col">Release Date</th>

                    <th scope="col"> Action</th>
                  </tr>
                </thead>
                <tbody>
                {termsData && termsData?.createdPrivateTerms?.map((term) =>{
                      return(
                        <>
                        <tr>
                    <th scope="row">
                      <Media className="align-items-center">
                      
                        <Media>
                          <span className="mb-0 text-sm">
                          {term.termId}
                          </span>
                        </Media>
                      </Media>
                    </th>
                    <td>{term.contractAddress}</td>
                    <td>{term.termType}</td>
                    <td>
                        {term.website}
                    </td>
                    <td>
                        <a href={"https://base-goerli.easscan.org/schema/view/"+term.easSchemaId} target="_blank" rel="noreferrer">View on EAS</a>
                    </td>
                    <td>
                        {term.updatable?"Yes":"No"}
                    </td>    
                    <td>
                        {term.revocable?"Yes":"No"} 
                    </td>  

                    <td>
                        <Button className="btn-sm btn-success" onClick={()=> getDecryptedFileUrl(term.termsUrl)} >View Encrypted Terms File</Button> 
                    </td> 

                    
                    <td>
                      <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Recipient Address</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(term.recipientAndStatus).length === 0 ? (
                                <tr>
                                  <td colSpan="2">No Other Recipients</td>
                                </tr>
                              ) : (
                                Object.keys(term.recipientAndStatus).map(function (element) {
                                  return (
                                    <tr key={element}>
                                      <td>{element}</td>
                                      <td>
                                        <table className="table">
                                          <tbody>
                                            <tr>
                                              <td className="border">{term.recipientAndStatus[element].statusString}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                      </table>          
                    </td>  

                    <td>
                        {utils.formatEther(term.escrowTermData.lockedAmount.toString())} 
                    </td> 

                    <td>
                        {new Date(Number(term.escrowTermData.releaseTime.toString())).toISOString().split('T')[0]} 
                    </td>  
                    <td className="text-left">
                      <UncontrolledDropdown>
                        <DropdownToggle
                          className="btn-icon-only text-light"
                          href="#pablo"
                          role="button"
                          size="sm"
                          color=""
                          onClick={(e) => e.preventDefault()}
                        >
                        <i className="fas fa-ellipsis-v" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-arrow" right>
                          <DropdownItem
                            href="#pablo"
                            onClick={(e) => {
                              e.preventDefault()
                            }}
                          >
                            Update
                          </DropdownItem>
                          <DropdownItem
                            href="#pablo"
                            onClick={(e) => e.preventDefault()}
                          >
                            Cancel
                          </DropdownItem>
                          
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                  </tr>
                        </>
                      )
                    })}

                  
                  
                </tbody>
              </Table>
            </Card>
          </div>
        </Row>
      </Container>


      <Container className="mt-8" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow" >
              <CardHeader className="border-0">
                <h3 className="mb-0">Inbox Escrow Terms</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Term ID</th>
                    <th scope="col">Contract Address</th>
                    <th scope="col">Website </th>
                    <th scope="col">EAS Schema</th>
                    <th scope="col">Updatable</th>
                    <th scope="col">Revocable</th>
                    <th scope="col">Terms URL</th>
                    <th scope="col">Lock Amount</th>
                    <th scope="col">Release Date</th>
                    <th scope="col">Your Status</th>
                    <th scope="col"> Action</th>
                  </tr>
                </thead>
                <tbody>
                {termsData && termsData?.inboxPrivateTerms?.map((term) =>{
                      return(
                        <>
                        <tr>
                    <th scope="row">
                      <Media className="align-items-center">
                      
                        <Media>
                          <span className="mb-0 text-sm">
                          {term.termId}
                          </span>
                        </Media>
                      </Media>
                    </th>
                    <td>{term.contractAddress}</td>
                    <td>
                        {term.website}
                    </td>
                    <td>
                        <a href={"https://base-goerli.easscan.org/schema/view/"+term.easSchemaId} target="_blank" rel="noreferrer">View on EAS</a>
                    </td>
                    <td>
                        {term.updatable?"Yes":"No"}
                    </td>    
                    <td>
                        {term.revocable?"Yes":"No"} 
                    </td>  

                    <td>
                        <Button className="btn-sm btn-success" onClick={()=> getDecryptedFileUrl(term.termsUrl)} >View Encrypted Terms File</Button> 
                    </td>  

                    <td>
                        {utils.formatEther(term.escrowTermData.lockedAmount.toString())} 
                    </td> 

                    <td>
                        {new Date(Number(term.escrowTermData.releaseTime.toString())).toISOString().split('T')[0]} 
                    </td>
                    
                    <td>{term.userStatus.statusString}</td>
                   
                    <td className="text-left">
                      <UncontrolledDropdown>
                        <DropdownToggle
                          className="btn-icon-only text-light"
                          href="#pablo"
                          role="button"
                          size="sm"
                          color=""
                          onClick={(e) => e.preventDefault()}
                        >
                        <i className="fas fa-ellipsis-v" />
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-arrow" right>
                          <DropdownItem
                            href="#pablo"
                            onClick={(e) => {
                              e.preventDefault()
                              acceptEscrowAgreement(term.termId, signer)
                            }}
                          >
                            Accept
                          </DropdownItem>
                          <DropdownItem
                            href="#pablo"
                            onClick={(e) => {
                              e.preventDefault()
                              rejectEscrowAgreement(term.termId, signer)
                            }
                            }
                          >
                            Reject
                          </DropdownItem>
                          
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                  </tr>
                        </>
                      )
                    })}

                  
                  
                </tbody>
              </Table>
            </Card>
          </div>
        </Row>
      </Container>

      <Container className="mt-7" fluid>
        <h1 className="text-center">Create a Escrow Term</h1>
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
                  setTerms(e.target.files)
                }}
              />
            </FormGroup>  

            <FormGroup>
                <Label for="recipientAddress">
                  Recipient Address

                </Label>
                <Input
                id="recipientAddress"
                placeholder="Enter Recipients Address's to share with in comma seperated format eg: 0x123,0x456,0x789"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
                <Label for="lockAmount">
                  Lock Amount

                </Label>
                <Input
                id="lockAmount"
                placeholder="Enter Amount to Lock which will be released at release time"
                type="number"
                value={lockAmount}
                onChange={(e) => setLockAmount(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
                <Label for="releaseTime">
                  Release Date

                </Label>
                <Input
                id="releaseTime"
                placeholder="Enter release time"
                type="date"
                value={releaseTime}
                onChange={(e) => {setReleaseTime(e.target.value)
              console.log(Date.parse(e.target.value))}}
              />
            </FormGroup>
            
            <Button type='submit' onClick={handleCreateEscrowTerm}>Create Privaseal Escrow Term</Button>

            <h5>{txMsg}</h5>

        </Form>
      </Container>
    </>
  );
};

export default EscrowTerms;
