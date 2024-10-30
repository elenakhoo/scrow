import React, { useEffect, useState, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers'; // Ensure you have the ethers package installed
import './Cart.css';

// Move contractABI outside the component
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
  },
  {
    "inputs": [{"internalType": "string","name": "_shippingAddress","type": "string"}],
    "name": "setShippingAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const Cart = ({ cart, setCart, account }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [newShippingAddress, setNewShippingAddress] = useState(''); // For editing
  const [isSaving, setIsSaving] = useState(false); // State to track if the save process is ongoing
  const [isEditVisible, setIsEditVisible] = useState(false); // Toggle visibility for edit section

  const contractAddress = '0x6d925938edb8a16b3035a4cf34faa090f490202a'; // Replace with your deployed contract address

  const fetchShippingAddress = useCallback(async () => {
    if (account && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum); // Using ethers v6+
        const contract = new Contract(contractAddress, contractABI, provider);

        console.log(`Fetching shipping address for account: ${account}`);
        
        // Fetch the shipping address for the connected wallet
        const address = await contract.getShippingAddress(account);
        
        setShippingAddress(address && address.length > 0 ? address : 'No shipping address set.');
        setNewShippingAddress(address); // Set this for editing
        console.info('Account Address:', account);
        console.info('Shipping address found:', address);
      } catch (error) {
        console.error('Error fetching shipping address:', error);
        setShippingAddress('Error fetching shipping address');
      }
    } else {
      console.warn('Account or Ethereum provider not available.');
    }
  }, [account, contractAddress]);

  useEffect(() => {
    if (account) {
      fetchShippingAddress();
    }
  }, [account, fetchShippingAddress]);

  // Function to save the new shipping address to the blockchain
  const saveShippingAddress = async () => {
    if (newShippingAddress && window.ethereum) {
      setIsSaving(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(); // Get the signer for sending transactions
        const contract = new Contract(contractAddress, contractABI, signer); // Use signer instead of provider for sending tx

        console.log('Saving shipping address to blockchain:', newShippingAddress);

        const tx = await contract.setShippingAddress(newShippingAddress); // Send the transaction
        await tx.wait(); // Wait for the transaction to be mined

        console.info('Shipping address saved successfully:', newShippingAddress);
        setShippingAddress(newShippingAddress);
        setIsSaving(false);
        setIsEditVisible(false); // Hide edit section after saving
        alert('Shipping address updated successfully on the blockchain!');
      } catch (error) {
        console.error('Error saving shipping address:', error);
        setIsSaving(false);
        alert('Failed to save the shipping address');
      }
    }
  };

  // Toggle the visibility of the edit section
  const toggleEditSection = () => {
    setIsEditVisible(!isEditVisible);
  };

  // Function to increase the quantity of a specific item
  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  // Function to decrease the quantity of a specific item and remove it if it reaches 0
  const decreaseQuantity = (id) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter(item => item.quantity > 0);  // Remove items with 0 or less quantity

    setCart(updatedCart);
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-section">
        <h3>Your Cart</h3>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-product-image">
                <img src="https://via.placeholder.com/150" alt="Product" />
              </div>
              <span>{item.name}</span>

              {/* Quantity Control */}
              <div className="quantity-control">
                <button className="minus-btn" onClick={() => decreaseQuantity(item.id)}>-</button>
                <span className="cart-item-quantity">{item.quantity}</span>
                <button className="plus-btn" onClick={() => increaseQuantity(item.id)}>+</button>
              </div>

              <span className="cart-price-font">{item.price} CROW</span>
            </div>
          ))
        )}

        {cart.length > 0 && (
          <div className="cart-total">
            <div className="cart-total-row">
              <span>Total: </span>
              <span className="cart-price-font">
                {cart.reduce((total, item) => total + item.price * item.quantity, 0)} CROW
              </span>
            </div>
            
            <button className="buy-now">Buy Now</button>
          </div>
        )}
        
        {/* Display the fetched shipping address */}
        <h4>Shipping Address:</h4>
        <p>{shippingAddress}</p>
        <button onClick={toggleEditSection}>{isEditVisible ? 'Cancel' : 'Edit'}</button>

        {/* Input field to edit shipping address */}
        {isEditVisible && (
          <div className="edit-shipping-address">
            <h4>Edit Shipping Address:</h4>
            <input
              type="text"
              value={newShippingAddress}
              onChange={(e) => setNewShippingAddress(e.target.value)}
              disabled={isSaving} // Disable the input while saving
            />
            <button className="edit-shipping-address-button" onClick={saveShippingAddress} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
