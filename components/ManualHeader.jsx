//use moralis is used to access hooks
//Hooks allow function components to have access to state and other react features.
//Because of this, class componenets are generally no longer needed
import { useMoralis } from "react-moralis"

//core react hook
import { useEffect } from "react"

//need export keyword to make sure its accessible
export default function ManualHeader() {
    //some button that connects us and changes connect to true
    //if we changed connect to tru web page doesnt know
    //this is where react comes in hooks allows us to get access to state similar to swiftui
    //let connected = false
    const {
        enableWeb3,
        isWeb3Enabled,
        account,
        Moralis,
        deactivateWeb3,
        isWeb3EnableLoading,
    } = useMoralis()

    //takes function and dependecy array
    //dependecy array used to see if anything within array changes if so call function
    //automatically runs on load then checks value if dependecy array
    useEffect(() => {
        if (isWeb3Enabled) return
        if (
            checkWindowTypeExists() &&
            window.localStorage.getItem("connected") == "injected"
        ) {
            enableWeb3()
        }
    }, [isWeb3Enabled]) //if you dont add dependecy array it runs everytime something re-renders
    // Careful with this !! because then you can get circular renders
    //black dependecy array only runs on load

    //checking to see if we disconnected
    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    }, [])

    //add {} to add js to html within jsx file
    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...
                    {account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        //local storage
                        if (checkWindowTypeExists()) {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}

function checkWindowTypeExists() {
    return typeof window !== "undefined"
}

//hard way
