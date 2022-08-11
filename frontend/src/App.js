import './App.css';
import {useEffect, useState} from "react";
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';
import {Buffer} from 'buffer';

window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

//controls how we aknowledge a trans is done
const opts = {
  preflightCommitment: "processed",
};

const {SystemProgram } = web3;

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

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const [campaign] = await PublicKey.findProgramAddress(
				[
					utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
					provider.wallet.publicKey.toBuffer(),
				],
				program.programId
			);
      await program.rpc.create("Campaign Name", "Campaign Desc", {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("Create a new campaign with account: ", campaign.toString());
    } catch (error) {
      console.log("Error creating campaign account:", error);
    }
  }

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect to walllet</button>
  };
  const renderConnectedContainer = () => {
    return <button onClick={createCampaign}>Create a campaign</button>
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
      {walletAddress && renderConnectedContainer()}
    </div>)
};

export default App;
