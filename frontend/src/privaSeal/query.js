import { ethers } from "ethers";
import privaSealContractData from '../config/contractData.json'

export const recipientStatusMap = {
  0: "Action Pending",
  1: "Accepted",
  2: "Rejected",
  3: "Revoked"
}

export const termTypeMap = {
  0: "NONE",
  1: "BASIC",
  2: "TOKEN_SPENDING",
  3: "ESCROW"
}


export const getUserData = async (signer) => {
    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    )
    const address = await signer.data.getAddress()
    let privaSealData = {}

    await contract.getUserCreatedTerms(address).then((data) => {
        console.log("CreatedTerms",data)
        privaSealData.createdTerms = data
    })
  
    await contract.getUserAcceptedTerms(address).then((data) => {
        console.log("AcceptedTerms ",data)
        privaSealData.acceptedTerms = data
      })
  
    await contract.getUserRejectedTerms(address).then((data) => {
        console.log("RejectedTerms",data)
        privaSealData.rejectedTerms = data
      })
  
    await contract.getUserRevokedTerms(address).then((data) => {
        console.log("RevokedTerms",data)
        privaSealData.revokedTerms =data
    })

    await contract.getUserPrivateTerms(address).then((data) => {
      console.log("Inbox Private Terms",data)
      privaSealData.privateTerms = data
    })

    await getCreatedEscrowTermsData(signer).then((data) => {
      console.log("Created Escrow Terms",data)
      privaSealData.escrowTerms = data
     });

    await getCreatedTokenSpendingTermsData(signer).then((data) => {
      console.log("Created Token Spending Terms",data)
      privaSealData.tokenSpendingTerms = data
     })

    return privaSealData  
}



export const getTermDataById = async (signer, termId) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  ) 
  const termData = await  contract.terms(termId);

  const extractedTermData = {
    contractAddress: termData.contractAddress,
    owner: termData.owner,
    website: termData.website,
    updatable: termData.updatable,
    revocable: termData.revocable,
    termsUrl: termData.termsUrl,
    easSchemaId: termData.easSchemaId,
    createdOn: termData.createdOn.toString(), // Convert BigNumber to string
    updatedOn: termData.updatedOn.toString(), // Convert BigNumber to string
    isPrivate: termData.isPrivate,
    termType: termTypeMap[termData.termType]
  };

  if(termData.isPrivate){
    let recipientAndStatus = {}
    const recipients = await contract.getPrivateTermRecipients(termId)
    for(const recipient of recipients){
      const termDetails  = await contract.userTerms(recipient, termId)
      recipientAndStatus[recipient] = {status: termDetails.status,  statusString: recipientStatusMap[termDetails.status]}
    }
    extractedTermData.recipientAndStatus = recipientAndStatus
  }

  if(termData.termType == 2){
    const tokenSpendingTermData = await contract.tokenSpendingTermInfos(termId)
    extractedTermData.tokenSpendingTermData = tokenSpendingTermData
  }
  else if(termData.termType == 3){
    const escrowTermData = {...(await contract.escrowTermInfos(termId))}
    const {lockedAmount, recipientAddress, releaseTime} = escrowTermData
    const cleanEscrowTermData = {lockedAmount, recipientAddress, releaseTime}
    cleanEscrowTermData.lockedAmount = cleanEscrowTermData.lockedAmount.toString()
    cleanEscrowTermData.releaseTime = cleanEscrowTermData.releaseTime.toString()
    extractedTermData.escrowTermData = cleanEscrowTermData
  }

return extractedTermData

};

export const getCreatedTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const createdTermsIds = await contract.getUserCreatedTerms(address)
  const createdTermsData = [];

  for (const termId of createdTermsIds) {
      let termData = await getTermDataById(signer, termId);
      termData.termId = termId.toString()
      createdTermsData.push(termData);
  }
  console.log("CreatedTermsData",createdTermsData)
  return createdTermsData;
};

export const getAcceptedTermsData = async (signer) => {

  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const acceptedTermsIds = await contract.getUserAcceptedTerms(address)
  const acceptedTermsData = [];

  for (const termId of acceptedTermsIds) {
    const termData = await getTermDataById(signer, termId);
    const userData = await contract.userTerms(address, termId);

    termData.termId = termId.toString();
    termData.attestId = userData.attestId;
    termData.deadline = userData.deadline.toString();

    acceptedTermsData.push(termData);
  }
  console.log(acceptedTermsData, acceptedTermsData)
  return acceptedTermsData;
};

export const getRejectedTermsData = async (signer) => {

  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const rejectedTermsIds = await contract.getUserRejectedTerms(address)
  const rejectedTermsData = [];

  for (const termId of rejectedTermsIds) {
    const termData = await getTermDataById(signer, termId);
    termData.termId = termId.toString()
    rejectedTermsData.push(termData);
  }
  console.log(rejectedTermsData, rejectedTermsData)
  return rejectedTermsData;
};

export const getRevokedTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const revokedTermsIds = await contract.getUserRevokedTerms(address)
  const revokedTermsData = [];

  for (const termId of revokedTermsIds) {
    const termData = await getTermDataById(signer, termId);
    const userData = await contract.userTerms(address, termId);

    termData.termId = termId.toString()
    termData.attestId = userData.attestId;
    termData.revokedOn = userData.revokedOn.toString();
    termData.isPrivate = termData.isPrivate;
    revokedTermsData.push(termData);
  }
  console.log(revokedTermsData, revokedTermsData)
  return revokedTermsData;
};



export const getInboxPrivateTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const privateTermsIds = await contract.getUserPrivateTerms(address)
  const privateTermsData = [];

  for (const termId of privateTermsIds) {
      let termData = await getTermDataById(signer, termId);
      termData.termId = termId.toString()
      termData.userStatus = termData.recipientAndStatus[address]
      delete termData.recipientAndStatus[address]
      privateTermsData.push(termData);
  }
  console.log("Inbox Private Terms Data",privateTermsData)
  return privateTermsData;
};



export const getCreatedPrivateTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const createdTermsIds = await contract.getUserCreatedTerms(address)
  const createdTermsData = [];

  for (const termId of createdTermsIds) {
      let termData = await getTermDataById(signer, termId);
      if(termData.isPrivate){
        termData.termId = termId.toString()
        createdTermsData.push(termData);
      }
  }
  console.log("CreatedPrivateTermsData",createdTermsData)
  return createdTermsData;
};


export const getCreatedEscrowTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const createdTermsIds = await contract.getUserCreatedTerms(address)
  const createdEscrowTermsData = [];

  for (const termId of createdTermsIds) {
      let termData = await getTermDataById(signer, termId);
      console.log(termData.termType)
      if(termData.termType === "ESCROW"){
        termData.termId = termId.toString()
        createdEscrowTermsData.push(termData);
      }
  }
  console.log("CreatedEscrowTermsData",createdEscrowTermsData)
  return createdEscrowTermsData;
};


export const getCreatedTokenSpendingTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const createdTermsIds = await contract.getUserCreatedTerms(address)
  const createdTokenSpendingTermsData = [];

  for (const termId of createdTermsIds) {
      let termData = await getTermDataById(signer, termId);
      if(termData.termType == "TOKEN_SPENDING") {
        termData.termId = termId.toString()
        createdTokenSpendingTermsData.push(termData);
      }
  }
  console.log("CreatedTokenSpendingTermsData",createdTokenSpendingTermsData)
  return createdTokenSpendingTermsData;
};

export const getInboxEscrowTermsData = async (signer) => {
  const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
    signer.data
  )
  const address = await signer.data.getAddress()

  const privateTermsIds = await contract.getUserPrivateTerms(address)
  const escrowTermsData = [];

  for (const termId of privateTermsIds) {
      let termData = await getTermDataById(signer, termId);
      if(termData.termType === "ESCROW"){
        termData.termId = termId.toString()
        termData.userStatus = termData.recipientAndStatus[address]
        delete termData.recipientAndStatus[address]
        escrowTermsData.push(termData);
      }
  }
  console.log("Inbox Escrow Terms Data",escrowTermsData)
  return escrowTermsData;
};