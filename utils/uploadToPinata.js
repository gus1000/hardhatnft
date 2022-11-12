const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

//./images/randomnft

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)
require("dotenv").config()



//you want these attribures on chain so your smart contract can programtically itneract with these attributes

/*
async function storeImage(imagesFilePath){


    fullimagefilepath = resolve.imageFilePath
    file = fs.readirSync(fullImagePath)

    let responses = []

    for fileIndex in files {
        console.log("we are processing ${fileInex}")
        readablestream= fs.createReadStream( ${fullImagePath}/${files[filesIndex]}
        //readdirSync is used to read the contents of the directory
    }

//the purpose of createstrea, is open up a stream and read data...we are streaming data into an inage

*/

//store the images via their  file patjh

async function storeImages(imagesFilePath){
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    //console.log(files)  //images are just a file with a bunch of data
    let responses = [] //responses from the pinata server
    console.log("Uploading to Pinata")
    for (fileIndex in files){
        console.log(`Working on ${fileIndex}`)
        //create a reable stream of data from a data path
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)

        try {

            const  response = await pinata.pinFileToIPFS(readableStreamForFile) //pinata stuff..pinata is posting data to their server
            responses.push(response)
        } catch(error) {
            console.log(error)
        }
        
        
        
        //we are creating a red stream

    }


    return {responses, files}



}
console.log("i try")

//pin file to ipfs  is going to return the hash of the file. we needthe hash to add to the metadata
//we convert out template into a json object and then store it
async function storeTokenUriMetadata (metadata) {

    try{
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null



}

module.exports = {storeImages, storeTokenUriMetadata}
//this function gives the full output of the path...full image path 



//
// 'ipfs://Qmby5bQhNnDsMn1Pey9eh9p4tX78QYAkfS3yoskiT2MJKz',
  //'ipfs://QmfWqSG5gXLyXdn6TUgaCtswgYuDZkpEqrPTLgF82T2giZ',
  //'ipfs://QmNeEi4TyyRWbKafwDQsVmGok3kbC7x3BwYLGFBo9xJKCf'


