const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium , it costs 25 links for a request
const GAS_PRICE_LINK = 1e9 // 1000000000 //link per gas .calculated value based of the gas price of the chain

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local Network detected! Deploying Mocks....")
        //deploy a mock vrfcoordinator....
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks Deployed !")
        log("-----------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
