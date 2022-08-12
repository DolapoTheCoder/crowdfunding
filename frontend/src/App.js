import './App.css';
import {useEffect, useState} from "react";
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';
import {Buffer} from 'buffer';
import { publicKey } from '@project-serum/anchor/dist/cjs/utils';

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
  const [campaigns, setCampaigns] = useState([]);

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

  const getCampaigns = async() => {
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    Program.all(
      (await connection.getProgramAccounts(programID)).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.pubkey)),
          pubkey: campaign.pubkey,
        })
      ).then(campaign => setCampaigns(campaigns))
    );
  }

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
			await program.rpc.create("campaign name", "campaign description", {
				accounts: {
					campaign,
					user: provider.wallet.publicKey,
					systemProgram: SystemProgram.programId,
				},
			});
			console.log(
				"Created a new campaign w/ address:",
				campaign.toString()
			);
		} catch (error) {
			console.error("Error creating campaign account:", error);
		}
	};

  const donate = async (publicKey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      
      //donate
      await program.rpc.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("Donated some money to:", publicKey.toString());
      getCampaigns();
    } catch (error) {
      console.log("Error donating:" , error);
    }
  };

  const withdraw = async (publicKey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      //hard coding the amount to withdraw
      await program.rpc.withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publicKey,
          user: provider.wallet.publicKey,
        },
      });

      console.log("Withdrew money from: ", publicKey.toString());
    } catch (error) {
      console.log("Error trying to withdraw: ", error);
    }
  }


  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect to walllet</button>
  };
  const renderConnectedContainer = () => {
    return(
      <>
        <button onClick={createCampaign}>Create a campaign</button>
        <button onClick={getCampaigns}>Get list of campaigns</button>
        <br />
        {campaigns.map(campaign => {
          <>
            <p>Campaign ID: {campaign.pubkey.toString()}</p>
            <p>
                Balance: {" "}
                {(
                    campaign.amountDonated / web3. LAMPORTS_PER_SOL
                    ).toString()
                }
            </p>
            <p>{campaign.name}</p>
            <p>{campaign.description}</p>
            <button onClick={() => donate(campaign.pubkey)}>Donate to Campaign!</button>
            <button onClick={() => withdraw(campaign.pubkey)}>Withdraw from Campaign!</button>
            <br />
          </>
        })}
      </>
    );
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
