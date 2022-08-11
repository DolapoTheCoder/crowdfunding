import './App.css';
import {useEffect, useState} from "react";
import idl from './idl.json';
import { Connection, Publickey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';


const programID = new Publickey(idl.metadata.address);

const network = clusterApiUrl('devnet');

//controls how we aknowledge a trans is done
const opts = {
  preflightCommitment: "processed",
};



const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  
  const getProvider = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    //authenticated connection via solana
    return provider;
  };

  const checkIfWalletIsConnected = async() => {
    try {
      //if phantom connected then this object exists
      const {solana} = window;
      if (solana) {
        //solana exist
        if(solana.isPhantom) {
          console.log("Phantm wallet found!");
          const response = await solana.connect({onlyIfTrusted: true});
          console.log("Connected with public key", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const {solana} = window;
    if (solana) {
      const response = solana.connect();
      console.log("Connected with public key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    };

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

  return(
    <div className='App'>
      {!walletAddress && renderNotConnectedContainer()}
    </div>)
};

export default App;
