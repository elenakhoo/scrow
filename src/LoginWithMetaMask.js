import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers'; // Correct import for BrowserProvider in ethers v6+
import { toast } from 'react-toastify'; // Import react-toastify for toasts
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import logo from './scrow_logo.png';
import logo2 from './metamask_fox.png';
import './LoginWithMetaMask.css'; // Import the CSS for styling

const LoginWithMetaMask = ({ connectMetaMask }) => {
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  // Define the smart contract address and ABI (Interface)
  const contractAddress = '0x14D7303E376B5C20465a139c9f95Ee5Eae561620'; // Replace with your deployed contract address
  const contractABI = [
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "hasShippingAddress",
      "outputs": [{"internalType": "bool","name":"","type":"bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "_user","type": "address"}],
      "name": "getShippingAddress",
      "outputs": [{"internalType": "string","name":"","type":"string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  // Check if the wallet is mapped to a shipping address and return the address
  const isWalletMapped = async (walletAddress) => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum); // Using BrowserProvider for ethers v6+
        const network = await provider.getNetwork();
        console.log('Connected to network:', network);
        const contract = new Contract(contractAddress, contractABI, provider);

        // Check if the wallet address has a shipping address
        const isMapped = await contract.hasShippingAddress(walletAddress);

        console.log('Is Wallet Mapped:', isMapped);

        if (isMapped) {
          const shippingAddress = await contract.getShippingAddress(walletAddress); // Get the shipping address
          console.log('Shipping Address:', shippingAddress);
          return true; // Address exists
        }
      }
    } catch (error) {
      console.error('Error checking wallet mapping:', error);
      return false;
    }
    return false; // No address mapped
  };

  // Connect to MetaMask function
  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0]; // Get the first account
        setAccount(walletAddress); // Store account in local state
        connectMetaMask(); // Call the connectMetaMask function to update the parent state

        // Check if the wallet address has been mapped to a shipping address
        const isMapped = await isWalletMapped(walletAddress);
        if (isMapped) {
          navigate('/'); // Redirect to home page
        } else {
          navigate('/address'); // Redirect to address input page
        }
      } catch (error) {
        console.error('MetaMask connection error:', error);
        toast.error('MetaMask connection failed');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-section">
        <img src={logo} alt="Crow Logo" className="crow-logo" />
        <h1>$CROW</h1>
      </div>
      
      <div className="login-button-section">
        <button onClick={connectToMetaMask} className="metamask-button">
          <img src={logo2} alt="MetaMask Logo" className="metamask-logo" />
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Login with MetaMask'}
        </button>
      </div>
    </div>
  );
};

export default LoginWithMetaMask;
