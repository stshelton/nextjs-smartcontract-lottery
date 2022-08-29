import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "@web3uikit/core" //ui library for pop up notifcations

function MyApp({ Component, pageProps }) {
    //for moralis framework to work we must wrap the entire app in MoralisProvider
    // initializeOnMount asking if we are using moralis to connect to outside api/server
    return (
        <MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    )
}

export default MyApp
