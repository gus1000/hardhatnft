const {developmentChains} = require ("../helper-hardhat-config")

module.exports = async function (hre) {

    const { network, ethers, getNamedAccounts, deployments} = hre
    const BASE_FEE  = "250000000000000000"
    const GAS_PRICE_LINK  = 1e9

    const{deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    

    

    if (developmentChains.includes(network.name)) {

        //mocks deplourf
        console.log("deploying mocks")
        await deploy("VRFCoordinatorV2Mock" ,{
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],

        })

        log("Mocks Deployed!")
        log("--------------------------")


    }



 

}

module.exports.tags = ["all", "mocks", "main"]
