import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/Certification.json";
import DotLoader from "react-spinners/DotLoader";
// import { useAccount } from 'wagmi';
// import { useConnect, useDisconnect } from 'wagmi';

const App = () => {
  const contractABI = abi.abi;
  const [allCheckedIns, setAllCheckedIns] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const contractAddress = "0xf312E5fDCc595D58B74DCEC30Ff2370De1D19837";

  // Spinner when refreshing the page
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }, [])


  // Check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });


      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }

  };


  // Implement your connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      // const { data } = useAccount();  

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // A textbox that lets users add their own message to the page after hitting the check-in function
  const [message, setYourMessage] = React.useState("");

  const checkIn = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const certifiedContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Showing current address on page (but only after a check-in. NEED TO FIX)
        const addr = await signer.getAddress();
        setUserAddress(addr.toString());

        let checkedInCount = await certifiedContract.getTotalCheckIns();
        console.log("Retrieved total check-in count...", checkedInCount.toNumber());


        // Execute the actual checkIn from smart contract.
        const checkInTxn = await certifiedContract.checkIn(message, { gasLimit: 300000 });

        console.log("Mining -- ", checkInTxn.hash);
        await checkInTxn.wait();
        console.log("Mined -- ", checkInTxn.hash);
        checkedInCount = await certifiedContract.getTotalCheckIns();
        console.log("Retrieved total check-in count...", checkedInCount.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllCheckedIns = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const certifiedContract = new ethers.Contract(contractAddress, contractABI, signer);
        const checks = await certifiedContract.getAllCheckedIns();

        const checksCleaned = checks.map((checkIn) => {
          return {
            address: checkIn.attendee,
            timestamp: new Date(checkIn.timestamp * 1000),
            message: checkIn.message,

          };

        });

        setAllCheckedIns(checksCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(eror);
    }

  };

  /**
 * Listen in for emitter events!
 */

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);



  useEffect(() => {
    let certifiedContract;



    const onNewCheck = (from, timestamp, message) => {
      console.log("NewCheck", from, timestamp, message);
      setAllCheckedIns((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      certifiedContract = new ethers.Contract(contractAddress, contractABI, signer);
      certifiedContract.on("NewCheck", onNewCheck);
    }


    return () => {
      if (certifiedContract) {
        certifiedContract.off("NewCheck", onNewCheck);
      }

    };
  }, []);

  return (
    <div className="mainContainer">


      {
        loading ?
          <DotLoader color={'#4A90E2'} loading={loading} size={20} />
          :
          <div className="dataContainer">
            <div className="header">
              <h2>Certify!</h2>
            </div>

            <div className="bio">
              <h2>To confirm this is <em>you</em> who's present,<br></br> please connect to MetaMask.</h2>
            </div>

            <div className="small">
              (USE THE RINKEBY TEST NETWORK ONLY!)
            </div>

            <div className="bio">
              <h2>Once connected,<br></br> input a message and check in.</h2>
            </div>


            <div className="bio">
              <small>Account: {userAddress}</small>
            </div>


            {
              currentAccount ? (<textarea
                className="textbox"
                name="yourMessageArea"
                placeholder="type your message"
                type="text"
                id="aMessage"
                value={message}
                onChange={e =>
                  setYourMessage(e.target.value)} />) : null
            }

            {!currentAccount && (
              <button className="connectWalletButton" onClick={connectWallet}>
                Connect Wallet
          </button>
            )}

            <button className="checkInButton" onClick={() => checkIn(message)}>
              Check In
        </button>


            {allCheckedIns.map((checkIn, index) => {
              return (
                <div className="rounded" key={index} style={{ backgroundColor: "#dbe9ff", marginTop: "16px", padding: "8px" }}>
                  <div>{checkIn.message}</div>
                  <div><sub>Address: <small>{checkIn.address}</small></sub></div>
                  <div><sup>Time: <small>{checkIn.timestamp.toString()}</small></sup></div>
                </div>

              );

            })}

          </div>

      }

    </div>
  );

};

export default App;
