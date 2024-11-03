import React, { useEffect, useState, useCallback } from 'react';
import { parseUnits, BrowserProvider, Contract, toBigInt } from 'ethers';
import './Cart.css';


// Update the contract ABI to match the new implementation
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
  },
  {
    "inputs": [
      {
        "internalType": "tuple[]",
        "name": "_items",
        "type": "tuple[]",
        "components": [
          { "internalType": "uint", "name": "productId", "type": "uint" },
          { "internalType": "uint", "name": "quantity", "type": "uint" }
        ]
      }
    ],
    "name": "placeOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const Cart = ({ cart, setCart, account }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [newShippingAddress, setNewShippingAddress] = useState(''); // For editing
  const [isSaving, setIsSaving] = useState(false); // State to track if the save process is ongoing
  const [isEditVisible, setIsEditVisible] = useState(false); // Toggle visibility for edit section

  const contractAddress = '0xc1082A249ADA138DE70e0736676727bDd601c6b8'; // Replace with your deployed contract address

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

  // Function to create an order with multiple products
  const createOrder = async (totalPrice) => {
    if (window.ethereum) {
        try {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(contractAddress, contractABI, signer);

            // Prepare the items for the order
            const orderItems = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
            }));

            console.log("Order items to be sent:", orderItems);

            // Send transaction with totalPrice as the value (make sure it's BigInt)
            const tx = await contract.placeOrder(orderItems, { value: totalPrice });
            await tx.wait();
            alert('Order created successfully!');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create the order.');
        }
    } else {
        console.warn('Ethereum provider not available.');
    }
  };

  

  // Triggered when "Buy Now" is clicked
  const handleBuyNow = () => {
    // Calculate total price in wei using ethers.toBigInt
    const totalPrice = cart.reduce((total, item) => {
        const itemPriceInWei = parseUnits(item.price.toString(), 18);
        return toBigInt(total) + toBigInt(itemPriceInWei) * toBigInt(item.quantity);
    }, toBigInt(0));

    console.log("Total Price in Wei:", totalPrice.toString());
    createOrder(totalPrice);
};


  useEffect(() => {
    if (account) {
      fetchShippingAddress();
    }
  }, [account, fetchShippingAddress]);

  const saveShippingAddress = async () => {
    if (newShippingAddress && window.ethereum) {
      setIsSaving(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractABI, signer);

        console.log('Saving shipping address to blockchain:', newShippingAddress);

        const tx = await contract.setShippingAddress(newShippingAddress);
        await tx.wait();

        console.info('Shipping address saved successfully:', newShippingAddress);
        setShippingAddress(newShippingAddress);
        setIsSaving(false);
        setIsEditVisible(false);
        alert('Shipping address updated successfully on the blockchain!');
      } catch (error) {
        console.error('Error saving shipping address:', error);
        setIsSaving(false);
        alert('Failed to save the shipping address');
      }
    }
  };

  const toggleEditSection = () => {
    setIsEditVisible(!isEditVisible);
  };

  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  const decreaseQuantity = (id) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter(item => item.quantity > 0);

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
            
            <button className="buy-now" onClick={handleBuyNow}>Buy Now</button>
          </div>
        )}
        
        <h4>Shipping Address:</h4>
        <p>{shippingAddress}</p>
        <button onClick={toggleEditSection}>{isEditVisible ? 'Cancel' : 'Edit'}</button>

        {isEditVisible && (
          <div className="edit-shipping-address">
            <h4>Edit Shipping Address:</h4>
            <input
              type="text"
              value={newShippingAddress}
              onChange={(e) => setNewShippingAddress(e.target.value)}
              disabled={isSaving}
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
