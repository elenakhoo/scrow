import React, { useState } from 'react';
import './LoginWithWallet.css';  // Import the CSS file
import logo from './scrow_logo.png';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';  // Import ethers for blockchain interaction
import { toast } from 'react-toastify'; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css';  // Import toastify CSS

const LoginWithWallet = ({ account }) => {
  const [shippingAddress, setShippingAddress] = useState('');  // State to store shipping address
  const navigate = useNavigate();

  // Define the smart contract address and ABI (Interface)
  const contractAddress = '0xc1082A249ADA138DE70e0736676727bDd601c6b8'; // Replace with your deployed contract address
  const contractABI = [
    {
      "inputs": [{"internalType": "string","name": "_shippingAddress","type": "string"}],
      "name": "setShippingAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Function to set the shipping address in the smart contract
  const setShippingAddressOnChain = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      // Create an instance of BrowserProvider and connect to the contract
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();  // Get the signer (current wallet)
      const contract = new Contract(contractAddress, contractABI, signer);

      // Call the setShippingAddress function from the smart contract
      const tx = await contract.setShippingAddress(shippingAddress);
      console.log('Transaction:', tx);

      // Wait for the transaction to be confirmed
      await tx.wait();

      // Show a success message
      toast.success('Shipping address saved successfully!', { autoClose: 3000 });
      
      // Navigate to the home page after saving the shipping address
      navigate('/');
    } catch (error) {
      console.error('Error setting shipping address:', error);
      toast.error('Failed to set shipping address. Please try again.', { autoClose: 3000 });
    }
  };

  const handleLogin = async () => {
    console.log("Logging in with wallet:", account);
    console.log("Shipping Address:", shippingAddress);
    
    if (shippingAddress.trim() === '') {
      toast.error('Please enter a valid shipping address!', { autoClose: 3000 });
      return;
    }

    // Set the shipping address on the blockchain
    await setShippingAddressOnChain();
  };

  return (
    <div className="login-container">
      <div className="logo-section">
        <img src={logo} alt="Crow Logo" className="crow-logo" />
      </div>

      <div className="login-box">
        <p className="wallet-label">Wallet Address:</p>
        <p className="wallet-address">{account}</p>

        <div className="input-field">
          <label htmlFor="shippingAddress">Shipping Address:</label>
          <input
            type="text"
            id="shippingAddress"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter shipping address"
          />
        </div>

        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginWithWallet;
