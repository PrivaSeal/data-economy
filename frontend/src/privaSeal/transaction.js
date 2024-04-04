import { ethers, utils} from "ethers";
import privaSealContractData from '../config/contractData.json'


export const createTerm = async (termId, contractAddress, website, updatable, revocable, termsUrl ,signer, isPrivate, recipientAddressString) => {
    
    console.log('termId:', termId);
    console.log('contractAddress:', contractAddress);
    console.log('website:', website);
    console.log('updatable:', updatable);
    console.log('revocable:', revocable);
    console.log('termsUrl:', termsUrl);
    console.log('signer:', signer);
    console.log('isPrivate:', isPrivate);
    console.log('recipientAddressString:', recipientAddressString);


    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    )
    const address = await signer.data.getAddress()
    let recipientAddress = []
    if(isPrivate){
        recipientAddress = recipientAddressString.split(",")
        console.log(recipientAddress)
    }
    const txw = await contract.createTerm(termId, contractAddress, website, updatable, revocable, termsUrl, isPrivate, recipientAddress)
    const tx = await txw.wait()
    return tx

}

export const revokeTerm = async (termId,signer) => {
    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    )
    const address = await signer.data.getAddress()
    const txw = await contract.revokeTerm(termId)
    const tx = await txw.wait()
    return tx

}


export const removeTermRecipient = async (termId,signer, recipientAddress) => {
    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    )
    const address = await signer.data.getAddress()
    const txw = await contract.removeTermRecipient(termId, recipientAddress)
    const tx = await txw.wait()
    return tx

}


export const acceptTerm = async (termId,signer) => {
    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    )
    const address = await signer.data.getAddress()
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 5);
    const futureTimestamp = currentDate.getTime();
    const txw = await contract.acceptTerm(termId, futureTimestamp.toString())
    const tx = await txw.wait()
    return tx

}


export const rejectTerm = async (termId,signer) => {
    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    )
    const address = await signer.data.getAddress()
    const txw = await contract.rejectTerm(termId)
    const tx = await txw.wait()
    return tx

}


export const createTokenSpendingAgreement = async (
    termId,
    spenderAddress,
    website,
    updatable,
    revocable,
    termsUrl,
    isPrivate,
    recipients,
    approvalAmount,
    approvalTokenAddress,
    deadline,
    signer
  ) => {
    const contract = new ethers.Contract(
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
    privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
      signer.data
    );

    let recipientAddress = []
    if(isPrivate){
        recipientAddress = recipients.split(",")
        console.log(recipientAddress)
    }
  
    const txw = await contract.createTokenSpendingAgreement(
      termId,
      spenderAddress,
      website,
      updatable,
      revocable,
      termsUrl,
      isPrivate,
      recipientAddress,
      approvalAmount,
      approvalTokenAddress,
      deadline
    );
  
    const tx = await txw.wait();
    return tx;
  };
  
  export const createEscrowAgreement = async (
    termId,
    recipientAddress,
    website,
    updatable,
    revocable,
    termsUrl,
    lockAmount,
    releaseTime,
    signer
  ) => {
    const contract = new ethers.Contract(
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
        privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
        signer.data
    );
  
    const txw = await contract.createEscrowAggrement(
      termId,
      recipientAddress,
      website,
      updatable,
      revocable,
      termsUrl,
      utils.parseEther(lockAmount),
      releaseTime.toString(),
      {
        value: utils.parseEther(lockAmount),
      }
    );
  
    const tx = await txw.wait();
    return tx;
  };



  export const acceptTokenSpendingAgreement = async (termId, signer) => {
    const contract = new ethers.Contract(
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
      signer.data
    );
  
    const txw = await contract.acceptTokenSpendingAgreement(termId);
    const tx = await txw.wait();
    return tx;
  };
  
  export const acceptEscrowAgreement = async (termId, signer) => {
    const contract = new ethers.Contract(
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
      signer.data
    );
  
    const txw = await contract.acceptEscrowAgrrement(termId);
    const tx = await txw.wait();
    return tx;
  };
  
  export const rejectTokenSpendingAgreement = async (termId, signer) => {
    const contract = new ethers.Contract(
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
      signer.data
    );
  
    const txw = await contract.rejectTokenSpendingAgreement(termId);
    const tx = await txw.wait();
    return tx;
  };
  
  export const rejectEscrowAgreement = async (termId, signer) => {
    const contract = new ethers.Contract(
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ADDRESS,
      privaSealContractData.PRIVASEAL_FILECOIN_TESTNET_ABI,
      signer.data
    );
  
    const txw = await contract.rejectEscrowAggrement(termId);
    const tx = await txw.wait();
    return tx;
  };