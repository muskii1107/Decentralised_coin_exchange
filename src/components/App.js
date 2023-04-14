import { useEffect } from "react";
import "../App.css";
import config from "../config.json";
import Navbar from "./Navbar";
import Markets from "./Markets";
import { useDispatch } from "react-redux";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvent
} from "../store/ineraction";
import Balance from "./Balance";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // connect ether with blockchain
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(dispatch, provider);

   // Fetch current account & balance from Metamask when changed
   window.ethereum.on('accountsChanged', () => {
    loadAccount(dispatch,provider)
  })

    //fetching contracts
    const shery = config[chainId].shery;
    const eTIT = config[chainId].eTIT;
    await loadTokens(
      [shery.address, eTIT.address],
      dispatch,
      provider
    );

    //fetching exchange contract
    const exchange = await loadExchange(config[chainId].exchange.address, dispatch, provider);
    subscribeToEvent(exchange,dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets />
          <Balance/>

          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}

export default App;