// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol" ; 


error RandomIpfsNft__RangeOutofBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

//ERC721URIStorage ALREADY HAS THE tokenURI function 


contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {

    //when we mint an NFT, we will trigger a chainlink VRF call to get us a random numbre\

    // using that number, we will get a random NFT
    //pug, shiba inu, st bernard 
    // pug super rate
    // shiba sort of rare
    // st bernard most common 
    //owner of contract can withdraw Eth/we are paying the artist to create this nft 


// Type Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }






    //users have to pay to mint an NFT

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable  i_subscriptionId;
    bytes32 private  immutable i_gasLane;
    uint32 private immutable  i_callbackGasLimit;
    uint16 private constant  REQUEST_CONFIRMATIONS = 3 ;
    uint32 private constant  NUM_WORDS = 100;

    // VRF Helpers

    mapping(uint256 => address) public s_requestIdToSender;
    

    //we want to save that address to  a global variable, so we can call request words on it

    //NFT Variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    uint256 internal i_mintFee;

    //events

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted (Breed dogBreed, address minter);




    constructor(address vrfCoordinatorV2, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit, string[3] memory dogTokenUris, uint256 mintFee) VRFConsumerBaseV2(vrfCoordinatorV2 )ERC721("Random IPFS NFT", "RIN"){
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane ;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
        




    }

    function requestNft() public payable  returns (uint256 requestId) {
        if (msg.value <  i_mintFee){
            revert RandomIpfsNft__NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS



        );

        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);

    }
    //you need a mapping of the request id
    //this is the user using the above mapping
// we want a mapping of request Id's and whoever  called this 

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        //_safeMint(msg.sender, s_tokenCounter) // the owner is the chainlink node that fulfilled our random words request 
        uint256 newTokenId = s_tokenCounter;
        //WHAT DOES THIS TOKEN LOOK LIKE
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        //get a number between 0-99

        // 7 -> PUG
        //88 -> st Bernard

        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner, newTokenId) ;
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogOwner);

    }

    function withdraw() public returns(uint256){
        uint256  amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount} ("");
        if(!success){ 
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed ) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        // moddded RNG = 25
        // i = 0
        // cumlative sum - 0
        for(uint256 i = 0; i < chanceArray.length ; i++){
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]){

                return Breed(i);

            }
            cumulativeSum += chanceArray [i];



        }
        revert RandomIpfsNft__RangeOutofBounds();




    }

    //size 3
    //this array will represent the chances of the different dogs
    function getChanceArray() public pure returns(uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];



    }

    // function tokenURI(uint256) public view override returns(string memory) {

    // } /// WE DONT NEED THIS FUNCTION ANYMORE

    ////ERC721URIStorage ALREADY HAS THE tokenURI function 


    function getTokenCounter() public view returns(uint256) {
        return s_tokenCounter;
    }
}








