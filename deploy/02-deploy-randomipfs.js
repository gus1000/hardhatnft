const {network} = require("hardhat")
const {developmentChains, networkConfig} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify")
const {storeImages, storeTokenUriMetadata} = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNFT/"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

console.log("try hard")


module.exports = async function({getNamedAccounts, deployments}) {
    
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris
    

    //get the IPFS hashes of our images in a few ways


    if (process.env.UPLOAD_TO_PINATA == "true") {

        tokenUris = await handleTokenUris()
    }

    // 1. with our own IFPS node : https://docs.ipfs.io .

    //2. Pinata https://www.pinata.cloud/

    //3. https://nft.storage/ : it uses the file coin network to pin our network
    //file coin is a blockchain dedicated to pinning IPFS data  and storing decentralized data
    // 21:34 go back later and try this ...it is one of the more persistent ways to leep our data up







    // let is a keyword that allows to declrare variables that are limited to the scope of the block
    // of a block state ment or expression taht is used in
    let vrfCoordinatorV2Address, subscriptionId //we need the address for the vrf coordinator

    if (developmentChains.includes(network.name)) {

        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address // we need an address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId

    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId



    }



    log("------------------------")

    await storeImages(imagesLocation)
    const args = [
        vrfCoordinatorV2Address, 
        subscriptionId, 
        networkConfig[chainId].gasLane, 
        networkConfig[chainId].callBackgasLimit,
        tokenUris,
        networkConfig[chainId].mintFee, //tokenURIS 
    ]




    const randomIpfsNft = await deploy ("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying")
        await verify(randomIpfsNft.address, args)
    }
}


async function handleTokenUris(){
    tokenUris = [] //the list of files you are storing 

    //we need to store the Image in IPFS
    //Store the metadata in IPFS
    //const {responses: imageuploadresponses, files} = await storeImages(ImageFileLocation)

    const {responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    for (imageUploadResponseIndex in imageUploadResponses){
        //create metadata
        //upload the metadata
        let tokenUriMetadata = { ...metadataTemplate} // we are going to let out metadata  equal to the json data
        // let tokeunUriMetaData = [...metadatatemplate]
        //tokenURimetaData.name =  files[imageUploadResponseIndex].replace("jpg")
        //tokenURIMEtaData.description = 'a cute [tokenURimetaData.name ] pup
        //tokenurimetadata.image = ipfs://${imageUploadResponses[imageUploadResponsesIndex]}
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        //pug.png, st-bernad.png...we are dropping the extension
        tokenUriMetadata.description =`An Adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        //store the JSON to pinata / IPFS
        //const metadataUploadResponse = await storeTokenURIMetadata(tokenUriMetadata)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }

    console.log("Token URIs Uploaded! They are")
    console.log(tokenUris)


    return tokenUris



}


module.exports.tags = ["all", "randomipfs", "main"]
