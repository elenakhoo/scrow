import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import Orders from './Orders';
import './Orders.css';
import { formatUnits } from 'ethers'; // Direct import for ethers@6


const contractAddress = '0xc1082A249ADA138DE70e0736676727bDd601c6b8';
const contractABI = [
  {
    "inputs": [{"internalType": "address","name": "_seller","type": "address"}],
    "name": "getOrdersBySeller",
    "outputs": [{
      "components": [
        {"internalType": "uint","name": "orderId","type": "uint"},
        {
          "internalType": "struct UserDatabase.OrderItem[]", // Update this to match the contract's new struct
          "name": "items",
          "type": "tuple[]",
          "components": [
            {"internalType": "uint", "name": "productId", "type": "uint"},
            {"internalType": "uint", "name": "quantity", "type": "uint"}
          ]
        },
        {"internalType": "address","name": "buyer","type": "address"},
        {"internalType": "uint","name": "totalPrice","type": "uint"},
        {"internalType": "bool","name": "isFulfilled","type": "bool"},
        {"internalType": "bool","name": "isAccepted","type": "bool"}
      ],
      "internalType": "struct UserDatabase.Order[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  }
];

const OrdersPage = ({ account }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!account) return;

      try {
        console.info('Account Address:', account);

        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(contractAddress, contractABI, provider);

        const fetchedOrders = await contract.getOrdersBySeller(account);
        console.info('Fetched Orders:', fetchedOrders);

        // Format and set orders in state
        setOrders(fetchedOrders.map(order => ({
          orderId: order.orderId,
          items: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          buyer: order.buyer,
          totalPrice: formatUnits(order.totalPrice, 18),
          isFulfilled: order.isFulfilled,
          isAccepted: order.isAccepted,
        })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [account]);

  return <Orders orders={orders} />;
};

export default OrdersPage;