const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", function () {
          let raffle, RaffleentranceFee, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              RaffleentranceFee = await raffle.getEntranceFee()
          })

          describe("fulfull random words", function () {
              it("works with live Chainlink Keepers and chainlink VRF , we get a random winner ", async () => {
                  //enter the raffle
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()

                  await new Promise(async (resolve, reject) => {
                      //setup a listener before we enter the raffle
                      // just incase the blockchain moves really fast
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired")
                          try {
                              //aserts
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const EndingTimeStamp = await raffle.getLatestTimeStamp()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, "0")
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(RaffleentranceFee).toString()
                              )
                              assert(EndingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      // then entering the raffle
                      await raffle.enterRaffle({ value: RaffleentranceFee })
                      const winnerStartingBalance = await accounts[0].getBalance()
                      //this code wont complete untill our listener has finished listening!
                  })
              })
          })
      })
