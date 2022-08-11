import './App.css';
import {useEffect} from "react";

const App = () => {
  const checkIfWalletIsConnected = async() => {
    try {
      //if phantom connected then this object exists
      const {solana} = window;
      if (solana) {
        //solana exist
        if(solana.isPhantom) {
          console.log("Phantm wallet found!");
          const response = await solana.connect({onlyIfTrusted: true});
          console.log("Connected with public key", response.publicKey.toString());        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    
  };

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect to walllet</button>
  };


  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener("load", onLoad)
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className='App'>{renderNotConnectedContainer()}</div>
};

export default App;
