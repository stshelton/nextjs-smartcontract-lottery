import { useMoralisSubscription, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "@web3uikit/core"

//test winner  by running spencershelton$ yarn hardhat run scripts/mockOffchain.js --network localhost

export default function LotteryEntrance() {
    //how does moralis get chain id u may be asking
    //well since we wrapped the whole app in moralisProvider the header file that gets info about wallet passes to provider
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() //chain id gives us the hex value
    console.log(`chainId: ${chainIdHex})`)
    console.log(parseInt(chainIdHex))
    const chainId = parseInt(chainIdHex)
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const webSocketProvider = new ethers.providers.WebSocketProvider(
        "ws://127.0.0.1:8545/"
    )

    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("")
    const [prizeMoney, setPrizeMoney] = useState("")

    const dispatch = useNotification()
    //useWeb3Contract params
    /*
        contractAddress?: string;
        abi?: object;
        functionName?: string;
        params?: Record<string, unknown>;
        msgValue?: number | string; 
    
    */
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getCurrentPrizeMoney } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getCurrentPrizeMoney",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    useMoralisSubscription("WinnerPicked", (q) => q, [], {
        onCreate: (data) => console.log(data.attributes.winner),
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            console.log(`raffleaddress: ${raffleAddress}`)
            //try to read the raffle entrance fee
            const raffleContract = new ethers.Contract(
                raffleAddress,
                abi,
                webSocketProvider
            )
            raffleContract.on("WinnerPicked", async () => {
                console.log("Winner picked!")
                updateUi()
            })

            updateUi()
        }
    }, [isWeb3Enabled])

    useEffect(() => {})

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }
    //on success doesnt confirm that block has a confirmation just checks to see if transaction was sent to metamask
    //thats why we wait one to wait for block to be confirmed
    const handleSuccess = async function (tx) {
        await tx.wait(1)
        updateUi()
        handleNewNotification(tx)
    }

    async function updateUi() {
        //entrance fee
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromCall)

        //num players
        const numOfPlayers = (await getNumberOfPlayers()).toString()
        setNumPlayers(numOfPlayers)

        //recent winnder
        const recentWinnerFromCall = await getRecentWinner()
        setRecentWinner(recentWinnerFromCall)

        //current prize money
        const currentPrizeMoneyFromCall = (
            await getCurrentPrizeMoney()
        ).toString()
        setPrizeMoney(currentPrizeMoneyFromCall)
        // console.log(something)
    }

    function RaffleAddressExistsUI() {
        return (
            <div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-gold py-2 px-4 rounded ml-auto"
                    onClick={async function () {
                        console.log(enterRaffle)
                        await enterRaffle({
                            onSuccess: handleSuccess, //tx response is passed by default when not adding ()
                            onError: (error) => console.log(error),
                        })
                    }}
                    disabled={isFetching || isLoading}
                >
                    {LoadingUi()}
                </button>
                <div>
                    Entrance Fee:{" "}
                    {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                </div>

                <div>Number Of Players: {numPlayers}</div>
                <div>Recent Winner : {recentWinner}</div>
                {/* <div>
                    Current Prize money :{" "}
                    {ethers.utils.formatUnits(prizeMoney, "ether")} ETH
                </div> */}
            </div>
        )
    }

    function LoadingUi() {
        return isFetching || isLoading ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
        ) : (
            <div> Enter Raffle </div>
        )
    }

    return (
        <div className="p-5">
            Lottery LotteryEntrance{" "}
            {raffleAddress
                ? RaffleAddressExistsUI()
                : RaffleAddressDoesntExistUI()}
        </div>
    )
}

function RaffleAddressDoesntExistUI() {
    return <div>No Raffle Address Deteched</div>
}

//have a function that enters lottery

//async function
