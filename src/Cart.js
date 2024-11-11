import React, { useEffect, useState, useCallback } from 'react';
import { parseUnits, BrowserProvider, Contract, toBigInt } from 'ethers';
import './Cart.css';

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
          { "internalType": "uint", "name": "quantity", "type": "uint" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "imageUrl", "type": "string" }
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
  const [newShippingAddress, setNewShippingAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);

  const contractAddress = '0x14D7303E376B5C20465a139c9f95Ee5Eae561620';

  const fetchShippingAddress = useCallback(async () => {
    if (account && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(contractAddress, contractABI, provider);

        const address = await contract.getShippingAddress(account);
        setShippingAddress(address && address.length > 0 ? address : 'No shipping address set.');
        setNewShippingAddress(address);
      } catch (error) {
        console.error('Error fetching shipping address:', error);
        setShippingAddress('Error fetching shipping address');
      }
    }
  }, [account, contractAddress]);

  // Helper function to group items by sellerId
  const groupItemsBySeller = (cartItems) => {
    return cartItems.reduce((acc, item) => {
      const sellerId = item.sellerId;
      if (!acc[sellerId]) acc[sellerId] = [];
      acc[sellerId].push(item);
      return acc;
    }, {});
  };

  const groupedCart = groupItemsBySeller(cart);

  const createOrder = async (sellerId, items, totalPrice) => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(contractAddress, contractABI, signer);

        // Prepare the items for the order
        const orderItems = items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
          imageUrl: item.imageUrl
        }));

        console.log(`Order items to be sent for seller ${sellerId}:`, orderItems);

        // Send transaction with totalPrice as the value (make sure it's BigInt)
        const tx = await contract.placeOrder(orderItems, { value: totalPrice });
        await tx.wait();
        alert(`Order for seller ${sellerId} created successfully!`);
      } catch (error) {
        console.error('Error creating order:', error);
        alert(`Failed to create the order for seller ${sellerId}.`);
      }
    } else {
      console.warn('Ethereum provider not available.');
    }
  };

  const handleBuyNow = (sellerId, items) => {
    const totalPrice = items.reduce((total, item) => {
      const itemPriceInWei = parseUnits(item.price.toString(), 18);
      return toBigInt(total) + toBigInt(itemPriceInWei) * toBigInt(item.quantity);
    }, toBigInt(0));

    console.log(`Total Price in Wei for seller ${sellerId}:`, totalPrice.toString());
    createOrder(sellerId, items, totalPrice);
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

        const tx = await contract.setShippingAddress(newShippingAddress);
        await tx.wait();

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
        {Object.keys(groupedCart).length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          Object.keys(groupedCart).map((sellerId) => {
            const sellerItems = groupedCart[sellerId];
            const sellerTotal = sellerItems.reduce((total, item) => total + item.price * item.quantity, 0);
            
            return (
              <div key={sellerId} className="seller-order-section">
                <h4>Seller: {sellerId}</h4>
                {sellerItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-product-image">
                      <img src={item.imageUrl || "https://via.placeholder.com/150"} alt="Product" />
                    </div>
                    <span>{item.name}</span>
                    <div className="quantity-control">
                      <button className="minus-btn" onClick={() => decreaseQuantity(item.id)}>-</button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button className="plus-btn" onClick={() => increaseQuantity(item.id)}>+</button>
                    </div>
                    <span className="cart-price-font">{item.price} CROW</span>
                  </div>
                ))}
                <div className="seller-total">
                  <span>Total for this seller: {sellerTotal} CROW</span>
                </div>
                <button className="buy-now buy-now-cart" onClick={() => handleBuyNow(sellerId, sellerItems)}>Buy Now from {sellerId}</button>
              </div>
            );
          })
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
