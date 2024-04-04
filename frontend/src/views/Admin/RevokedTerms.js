
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
  UncontrolledTooltip
} from "reactstrap";
// core components

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccount, useDisconnect, useSigner } from "wagmi";
import { getRevokedTermsData } from "privaSeal/query";
import RevokedTermsHeader from "components/Headers/RevokedTermsHeader";
import { useMagic } from "magic/magicContext";


const RevokedTerms = () => {

  const { address, isConnected } = useAccount()
  const wagmiSigner = useSigner()
  const { signer: magicSigner, isMagicConnected} = useMagic()
  const signer = isConnected? wagmiSigner:{data: magicSigner}
  console.log("Signer : ->", signer)

  const [termsData, settermsData] = useState([]);
  const [search, setSearch] = useSearchParams();

  const fetchtermsData = async () =>{
    const userData = await getRevokedTermsData(signer)
    settermsData(userData)
  }

  useEffect(() => {

    fetchtermsData()

  }, [signer.data])



  return (
    <>
      {/* Page content */}
      <RevokedTermsHeader terms={termsData}/>

      <Container className="mt-8" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow" >
              <CardHeader className="border-0">
                <h3 className="mb-0">Revoked Terms</h3>
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
                    <th scope="col">Is Private</th>
                    <th scope="col">Terms URL</th>
                    <th scope="col">Attestaion</th>
                    <th scope="col">Revoked On</th>

                    <th scope="col"> Action</th>
                  </tr>
                </thead>
                <tbody>
                {termsData && termsData.map((term) =>{
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
                        {term.isPrivate?"Yes":"No"} 
                    </td>  
                    <td>
                        {term.isPrivate?"Check In Private Terms Tab": <a href={term.termsUrl.replace("ipfs://", "https://ipfs.io/ipfs/" )} target="_blank" rel="noreferrer">{term.termsUrl.replace("ipfs://", "https://ipfs.io/ipfs/" )}</a> }
                    </td>  
                    <td>
                        <a href={"https://base-goerli.easscan.org/attestation/view/"+term.attestId} target="_blank" rel="noreferrer">View on EAS</a>
                    </td>

                    <td>
                        {Date(term.revokedOn)} 
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
    </>
  );
};

export default RevokedTerms;
