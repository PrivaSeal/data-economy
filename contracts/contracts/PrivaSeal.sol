// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./eas/IEAS.sol";
import "./eas/ISchemaRegistry.sol";
import "./eas/resolver/SchemaResolver.sol";

contract PrivaSeal is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, PausableUpgradeable, AccessControlUpgradeable, ERC20PermitUpgradeable{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    IEAS public eas;
    ISchemaRegistry public easSchemaRegistry;

    bytes32 public revocableSchemaUID;
    bytes32 public nonRevocableSchemaUID;

    enum TermType {NONE, BASIC, TOKEN_SPENDING,ESCROW}
    struct Terms {
        address contractAddress;
        address owner;
        string website;
        bool updatable;
        bool revocable;
        string termsUrl;
        bytes32 easSchemaId;
        uint256 createdOn;
        uint256 updatedOn;
        bytes32[] pastSchemaIds;
        string[] pastTermsUrl;
        bool isPrivate;
        TermType termType;
    }

    enum TermStatus {NONE, ACCEPTED, REJECTED, REVOKED}

    struct TermState {
        TermStatus status;
        uint64 deadline;
        bytes32 attestId;
        uint256 revokedOn;
        uint256 allowance;
    }

    struct TokenSpendingTermInfo {
        uint256 approvalAmount;
        uint64 deadline;
        address spenderAddress;
        address tokenAddress;
    }

    struct EscrowTermInfo {
        uint256 lockedAmount;
        uint256 releaseTime;
        address recipientAddress;
    }

    mapping(uint256 => Terms) public terms;
    mapping(address => uint256) public contractTerm;

    mapping(address => mapping(uint256 => TermState )) public userTerms;

    mapping(address => uint256[]) private userAcceptedTerms;
    mapping(address => uint256[]) private userCreatedTerms;
    mapping(address => uint256[]) private userRejectedTerms;
    mapping(address => uint256[]) private userRevokedTerms;
    mapping(uint256 => address[]) private privateTermRecipients;
    mapping(address => uint256[]) private userPrivateTerms;

    mapping(uint256 => TokenSpendingTermInfo) public tokenSpendingTermInfos;
    mapping(uint256 => EscrowTermInfo) public escrowTermInfos;

    mapping(address => mapping(address => uint256)) public tokenSpendingTermId;
    

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(){
        _disableInitializers();
    }

    function initialize(address _eas, address _easSchemaRegistry) initializer public {
        __ERC20_init("PrivaSeal", "PRS");
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init("PrivaSeal");

        eas = IEAS(_eas);
        easSchemaRegistry = ISchemaRegistry(_easSchemaRegistry);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        string memory schema = "uint256 termId,address contract,string termsUrl,address acceptor,bool private";
        // revocableSchemaUID = easSchemaRegistry.register(schema, ISchemaResolver(address(0)), true);
        // nonRevocableSchemaUID = easSchemaRegistry.register(schema, ISchemaResolver(address(0)), false);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {        
        super._beforeTokenTransfer(from, to, amount);
    }

/*
******************************************* TERM CRUD FUNCTIONS ************************************************
*/


    function createTerm(
        uint256 _termId,
        address _contractAddress,
        string memory _website,
        bool _updatable,
        bool _revocable,
        string memory _termsUrl,
        bool _isPrivate,
        address[] memory _recipients
    ) public {
        require(terms[_termId].contractAddress == address(0), "Term already exists with this Term ID");
        terms[_termId] = Terms({
            contractAddress: _contractAddress,
            owner: msg.sender,
            website: _website,
            updatable: _updatable,
            revocable: _revocable,
            termsUrl: _termsUrl,
            easSchemaId: _revocable ? revocableSchemaUID : nonRevocableSchemaUID,
            createdOn: block.timestamp,
            updatedOn: block.timestamp,
            pastSchemaIds: new bytes32[](0),
            pastTermsUrl: new string[](0),
            isPrivate: _isPrivate,
            termType: TermType.BASIC
        });

        userCreatedTerms[msg.sender].push(_termId);

        if(_isPrivate) {
            for(uint i = 0; i < _recipients.length; i++) {
                privateTermRecipients[_termId].push(_recipients[i]);
                userPrivateTerms[_recipients[i]].push(_termId);
            }
        }
        
    }

    function updateTerm(
        uint256 _termId,
        bool _updatable,
        bool _revocable,
        string memory _termsUrl
    ) public {
        require(terms[_termId].contractAddress != address(0), "Term does not exist");
        require(terms[_termId].updatable, "This Term Is not Updatable");
        require(terms[_termId].owner == msg.sender, "Only Term Owner Can Update");

        terms[_termId].updatable = _updatable;
        terms[_termId].revocable = _revocable;
        
        terms[_termId].pastTermsUrl.push(terms[_termId].termsUrl);
        terms[_termId].termsUrl = _termsUrl;

        terms[_termId].easSchemaId = _revocable ? revocableSchemaUID : nonRevocableSchemaUID;

        terms[_termId].updatedOn = block.timestamp;
    }

    function removeTermRecipient(
        uint256 _termId,
        address _recipient
    ) public {
        require(terms[_termId].contractAddress != address(0), "Term does not exist");
        require(terms[_termId].updatable, "This Term Is not Updatable");
        require(terms[_termId].owner == msg.sender, "Only Term Owner Can Update");

        for(uint i = 0; i < privateTermRecipients[_termId].length; i++) {
            if(privateTermRecipients[_termId][i] == _recipient) {
                privateTermRecipients[_termId][i] = privateTermRecipients[_termId][privateTermRecipients[_termId].length - 1];
                privateTermRecipients[_termId].pop();
                break;
            }
        }

        for(uint i = 0; i < userPrivateTerms[_recipient].length; i++) {
            if(userPrivateTerms[_recipient][i] == _termId) {
                userPrivateTerms[_recipient][i] = userPrivateTerms[_recipient][userPrivateTerms[_recipient].length - 1];
                userPrivateTerms[_recipient].pop();
                break;
            }
        }

        terms[_termId].updatedOn = block.timestamp;
    }

    function getTermInfo(uint256 _termId)
        public
        view
        returns (
            address contractAddress,
            address owner,
            string memory website,
            bool updatable,
            bool revocable,
            string memory termsUrl,
            bytes32 easSchemaId,
            uint256 createdOn,
            uint256 updatedOn,
            bytes32[] memory pastSchemaIds,
            string[] memory pastTermsUrl,
            TermType termType
        )
    {
        Terms storage term = terms[_termId];
        contractAddress = term.contractAddress;
        owner = term.owner;
        website = term.website;
        updatable = term.updatable;
        revocable = term.revocable;
        termsUrl = term.termsUrl;
        easSchemaId = term.easSchemaId;
        createdOn = term.createdOn;
        updatedOn = term.updatedOn;
        pastSchemaIds = term.pastSchemaIds;
        pastTermsUrl = term.pastTermsUrl;
        termType = term.termType;
    }


/*
******************************************* USER ACTION FUNCTIONS ************************************************
*/

    event TermAccepted(uint256 termId, string termUrl, address termInitiator, address termAccepter);
    event TermRejected(uint256 termId, string termUrl, address termInitiator, address termRejecter);
    event TermRevoked(uint256 termId, string termUrl, address termInitiator, address termRevoker);


    function acceptTerm(uint256 _termId, uint64 _deadline) public {
        require(userTerms[msg.sender][_termId].status == TermStatus.NONE, "Term already accepted or rejected");

        userTerms[msg.sender][_termId].status = TermStatus.ACCEPTED;
        userTerms[msg.sender][_termId].deadline = _deadline;
        userAcceptedTerms[msg.sender].push(_termId);
        // AttestationRequest memory request = AttestationRequest({
        //     schema: terms[_termId].easSchemaId,
        //     data: AttestationRequestData({
        //         recipient: address(terms[_termId].contractAddress),
        //         expirationTime: _deadline,
        //         revocable: terms[_termId].revocable,
        //         refUID: bytes32(0),
        //         data: abi.encode(_termId, terms[_termId].contractAddress, terms[_termId].termsUrl, msg.sender, terms[_termId].isPrivate),
        //         value: 0
        //     })
        // });

        // bytes32 attestationUid = eas.attest(request);
        // userTerms[msg.sender][_termId].attestId = attestationUid;
        emit TermAccepted(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
        _mint(terms[_termId].owner, 1);
    }

    function rejectTerm(uint256 _termId) public {
        require(userTerms[msg.sender][_termId].status == TermStatus.NONE, "Term already accepted or rejected");

        userTerms[msg.sender][_termId].status = TermStatus.REJECTED;
        userRejectedTerms[msg.sender].push(_termId);
        emit TermRejected(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
    }

    function revokeTerm(uint256 _termId) public {
        require(terms[_termId].revocable, "Term is not revocable");
        require(userTerms[msg.sender][_termId].status == TermStatus.ACCEPTED, "Term not accepted");

        userTerms[msg.sender][_termId].status = TermStatus.REVOKED;
        userTerms[msg.sender][_termId].deadline = 0;
        userTerms[msg.sender][_termId].revokedOn = block.timestamp;

        // RevocationRequestData memory revocationData = RevocationRequestData({
        //     uid: userTerms[msg.sender][_termId].attestId,
        //     value: 0
        // });

        // RevocationRequest memory request = RevocationRequest(
        //     {
        //         schema: terms[_termId].easSchemaId,
        //         data : revocationData
        //     }
        // );

        // eas.revoke(request);

        userRevokedTerms[msg.sender].push(_termId);

        for(uint i = 0; i < userAcceptedTerms[msg.sender].length; i++) {
            if(userAcceptedTerms[msg.sender][i] == _termId) {
                userAcceptedTerms[msg.sender][i] = userAcceptedTerms[msg.sender][userAcceptedTerms[msg.sender].length - 1];
                userAcceptedTerms[msg.sender].pop();
                break;
            }
        }

        emit TermRevoked(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
        _burn(terms[_termId].owner, 1);

    }    

    function getUserTermState(address _user, uint256 _termId) public view returns (TermState memory) {
        return userTerms[_user][_termId];
    }

    function isContractTermAccepted(address _user) external view returns (bool) {
        uint256 termId = contractTerm[msg.sender];
        return userTerms[_user][termId].status == TermStatus.ACCEPTED;
    }

    function isContractTermAcceptedByTermId(address _user, uint256 _termId) external view returns (bool) {
        return userTerms[_user][_termId].status == TermStatus.ACCEPTED;
    }


    function onAttest(Attestation calldata /*attestation)*/, uint256 /*value*/) internal pure  returns (bool) {
        return true;
    }

    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal view returns (bool) {
        return true;
    }

     function getUserAcceptedTerms(address user) external view returns (uint256[] memory) {
        return userAcceptedTerms[user];
    }

    function getUserCreatedTerms(address user) external view returns (uint256[] memory) {
        return userCreatedTerms[user];
    }

    function getUserRejectedTerms(address user) external view returns (uint256[] memory) {
        return userRejectedTerms[user];
    }

    function getUserRevokedTerms(address user) external view returns (uint256[] memory) {
        return userRevokedTerms[user];
    }

    function getUserPrivateTerms(address user) external view returns (uint256[] memory) {
        return userPrivateTerms[user];
    }

    function getPrivateTermRecipients(uint256 _termId) external view returns (address[] memory) {
        return privateTermRecipients[_termId];
    }

    function createTokenSpendingAggrement(uint256 _termId,
        address _spenderAddress,
        string memory _website,
        bool _updatable,
        bool _revocable,
        string memory _termsUrl,
        bool _isPrivate,
        address[] memory _recipients,
        uint256 _approvalAmount,
        address _approvalTokenAddress,
        uint64 _deadline
    ) public {
        require(terms[_termId].contractAddress == address(0), "Term already exists with this Term ID");
        terms[_termId] = Terms({
            contractAddress: 0x0000000000000000000000000000000000001010 ,
            owner: msg.sender,
            website: _website,
            updatable: _updatable,
            revocable: _revocable,
            termsUrl: _termsUrl,
            easSchemaId: _revocable ? revocableSchemaUID : nonRevocableSchemaUID,
            createdOn: block.timestamp,
            updatedOn: block.timestamp,
            pastSchemaIds: new bytes32[](0),
            pastTermsUrl: new string[](0),
            isPrivate: _isPrivate,
            termType: TermType.TOKEN_SPENDING
        });

        userCreatedTerms[msg.sender].push(_termId);

        tokenSpendingTermInfos[_termId].approvalAmount = _approvalAmount;
        tokenSpendingTermInfos[_termId].spenderAddress = _spenderAddress;
        tokenSpendingTermInfos[_termId].tokenAddress = _approvalTokenAddress;
        tokenSpendingTermInfos[_termId].deadline = _deadline;

        if(_isPrivate) {
            for(uint i = 0; i < _recipients.length; i++) {
                privateTermRecipients[_termId].push(_recipients[i]);
                userPrivateTerms[_recipients[i]].push(_termId);
            }
        }
    }

    
    function createEscrowAggrement(uint256 _termId,
        address _recipientAddress,
        string memory _website,
        bool _updatable,
        bool _revocable,
        string memory _termsUrl,
        uint256 _lockAmount,
        uint256 _releaseTime
    ) public payable {
        require(terms[_termId].contractAddress == address(0), "Term already exists with this Term ID");
        require(msg.value == _lockAmount, "Insufficient lock amount sent in msg.value");

        bool _isPrivate = true;

        terms[_termId] = Terms({
            contractAddress: 0x0000000000000000000000000000000000001010 ,
            owner: msg.sender,
            website: _website,
            updatable: _updatable,
            revocable: _revocable,
            termsUrl: _termsUrl,
            easSchemaId: _revocable ? revocableSchemaUID : nonRevocableSchemaUID,
            createdOn: block.timestamp,
            updatedOn: block.timestamp,
            pastSchemaIds: new bytes32[](0),
            pastTermsUrl: new string[](0),
            isPrivate: _isPrivate,
            termType: TermType.ESCROW
        });
        
        // Escrow aggrements tends to be private
        address[] memory _recipients = new address[](1);
        _recipients[0] = _recipientAddress;

        userCreatedTerms[msg.sender].push(_termId);

        escrowTermInfos[_termId].lockedAmount = _lockAmount;
        escrowTermInfos[_termId].recipientAddress = _recipientAddress;
        escrowTermInfos[_termId].releaseTime = _releaseTime;

        if(_isPrivate) {
            for(uint i = 0; i < _recipients.length; i++) {
                privateTermRecipients[_termId].push(_recipients[i]);
                userPrivateTerms[_recipients[i]].push(_termId);
            }
        }
    }


    function acceptTokenSpendingAggrement(uint256 _termId) public {
        require(userTerms[msg.sender][_termId].status == TermStatus.NONE, "Term already accepted or rejected");
        require(terms[_termId].termType == TermType.TOKEN_SPENDING, "Term is not token spending aggrement");
        require(ERC20Upgradeable(tokenSpendingTermInfos[_termId].tokenAddress).allowance(msg.sender, address(this)) >= tokenSpendingTermInfos[_termId].approvalAmount, "Insufficient allowance");
        userTerms[msg.sender][_termId].status = TermStatus.ACCEPTED;
        userTerms[msg.sender][_termId].deadline = tokenSpendingTermInfos[_termId].deadline;
        userTerms[msg.sender][_termId].allowance = tokenSpendingTermInfos[_termId].approvalAmount;

        tokenSpendingTermId[msg.sender][tokenSpendingTermInfos[_termId].spenderAddress] = _termId;

        userAcceptedTerms[msg.sender].push(_termId);
        // AttestationRequest memory request = AttestationRequest({
        //     schema: terms[_termId].easSchemaId,
        //     data: AttestationRequestData({
        //         recipient: address(terms[_termId].contractAddress),
        //         expirationTime: _deadline,
        //         revocable: terms[_termId].revocable,
        //         refUID: bytes32(0),
        //         data: abi.encode(_termId, terms[_termId].contractAddress, terms[_termId].termsUrl, msg.sender, terms[_termId].isPrivate),
        //         value: 0
        //     })
        // });

        // bytes32 attestationUid = eas.attest(request);
        // userTerms[msg.sender][_termId].attestId = attestationUid;
        emit TermAccepted(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
        _mint(terms[_termId].owner, 1);
    }

    function acceptEscrowAgrrement(uint256 _termId) public {
        require(userTerms[msg.sender][_termId].status == TermStatus.NONE, "Term already accepted or rejected");
        require(terms[_termId].termType == TermType.ESCROW, "Term is not escrow aggrement");
        require(escrowTermInfos[_termId].recipientAddress == msg.sender, "You are not the receipient of this term");
        userTerms[msg.sender][_termId].status = TermStatus.ACCEPTED;
        userTerms[msg.sender][_termId].deadline = 0;
        userAcceptedTerms[msg.sender].push(_termId);
        // AttestationRequest memory request = AttestationRequest({
        //     schema: terms[_termId].easSchemaId,
        //     data: AttestationRequestData({
        //         recipient: address(terms[_termId].contractAddress),
        //         expirationTime: _deadline,
        //         revocable: terms[_termId].revocable,
        //         refUID: bytes32(0),
        //         data: abi.encode(_termId, terms[_termId].contractAddress, terms[_termId].termsUrl, msg.sender, terms[_termId].isPrivate),
        //         value: 0
        //     })
        // });

        // bytes32 attestationUid = eas.attest(request);
        // userTerms[msg.sender][_termId].attestId = attestationUid;
        emit TermAccepted(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
        _mint(terms[_termId].owner, 1);
    }


    function rejectTokenSpendingAggrement(uint256 _termId) public {
        require(userTerms[msg.sender][_termId].status == TermStatus.NONE, "Term already accepted or rejected");
        require(terms[_termId].termType == TermType.TOKEN_SPENDING, "Term is not token spending aggrement");
        userTerms[msg.sender][_termId].status = TermStatus.REJECTED;
        userRejectedTerms[msg.sender].push(_termId);
        emit TermRejected(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
    }

    function rejectEscrowAggrement(uint256 _termId) public {
        require(userTerms[msg.sender][_termId].status == TermStatus.NONE, "Term already accepted or rejected");
        require(terms[_termId].termType == TermType.ESCROW, "Term is not escrow aggrement");
        require(escrowTermInfos[_termId].recipientAddress == msg.sender, "You are not the receipient of this term");
        userTerms[msg.sender][_termId].status = TermStatus.REJECTED;
        userRejectedTerms[msg.sender].push(_termId);
        payable(terms[_termId].owner).transfer(escrowTermInfos[_termId].lockedAmount);

        emit TermRejected(_termId, terms[_termId].termsUrl, terms[_termId].contractAddress, msg.sender);
    }

    function transferApprovedTokensFrom(address from, address to, uint256 amount) public {
        uint256 termId = tokenSpendingTermId[from][msg.sender];
        require(termId != 0, "No token spending term found for this sender");
        require(userTerms[from][termId].status == TermStatus.ACCEPTED, "Token spending term not accepted");
        require(userTerms[from][termId].allowance >= amount, "Insufficient allowance");
        require(ERC20Upgradeable(tokenSpendingTermInfos[termId].tokenAddress).allowance(from, address(this)) >= amount, "Insufficient allowance");
        require(ERC20Upgradeable(tokenSpendingTermInfos[termId].tokenAddress).transferFrom(from, to, amount), "Token transfer failed");
        userTerms[from][termId].allowance -= amount;
    }

    

}