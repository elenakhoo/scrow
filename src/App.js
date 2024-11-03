import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { JsonRpcProvider, Contract } from 'ethers';
import NavBar from './NavBar';
import ProductList from './ProductList';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import LoginWithMetaMask from './LoginWithMetaMask';
import LoginWithWallet from './LoginWithWallet';
import Orders from './Orders';
import './App.css';
import OrdersPage from './OrdersPage';
import BuyerOrdersPage from './BuyerOrdersPage';
import { formatUnits } from 'ethers'; // Direct import for ethers@6

// Smart contract details
const contractAddress = "0xc1082A249ADA138DE70e0736676727bDd601c6b8";
const contractABI = [
  {
    "inputs": [],
    "name": "getAllProducts",
    "outputs": [{"components": [{"internalType": "uint","name": "id","type": "uint"},{"internalType": "string","name": "name","type": "string"},{"internalType": "uint","name": "price","type": "uint"},{"internalType": "string","name": "description","type": "string"},{"internalType": "bool","name": "available","type": "bool"}],"internalType": "struct UserDatabase.Product[]","name":"","type":"tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [cart, setCart] = useState([]); // Initialize cart state
  const [account, setAccount] = useState(null); // Initialize state to store MetaMask account
  const [isConnected, setIsConnected] = useState(false); // Track if MetaMask is connected
  const [products, setProducts] = useState([]); // State to store products
  const [loading, setLoading] = useState(true); // Loading state for products

  // Function to fetch all products from the blockchain
  const fetchAllProducts = async () => {
    try {
      const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/b4afcbbebc2b47598d043747b32d4a24");
      const contract = new Contract(contractAddress, contractABI, provider);
      const allProducts = await contract.getAllProducts({ blockTag: "latest" });
      
      // Format products data
      const formattedProducts = allProducts.map(([id, name, price, description, available]) => ({
        id,
        name,
        price: formatUnits(price, 18),
        description,
        available
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Function to connect to MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        localStorage.setItem('account', accounts[0]);
      } catch (error) {
        console.error('MetaMask connection error:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Handle account changes or disconnection
  useEffect(() => {
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      setAccount(storedAccount);
      setIsConnected(true);
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('account', accounts[0]);
        } else {
          setAccount(null);
          setIsConnected(false);
          localStorage.removeItem('account');
        }
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/*" element={
          <AppContent
            account={account}
            isConnected={isConnected}
            connectMetaMask={connectMetaMask}
            cart={cart}
            setCart={setCart}
            products={products}
            loading={loading}
          />
        }/>
      </Routes>
    </Router>
  );
}

function AppContent({ account, isConnected, connectMetaMask, cart, setCart, products, loading }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && (location.pathname === '/login')) {
      navigate('/');
    }
  }, [isConnected, location.pathname, navigate]);

  return (
    <div className="App">
      {location.pathname !== '/login' && location.pathname !== '/address' && (
        <NavBar account={account} isConnected={isConnected} connectMetaMask={connectMetaMask} />
      )}

      <main>
        <Routes>
          <Route path="/login" element={<LoginWithMetaMask connectMetaMask={connectMetaMask} />} />
          <Route path="/address" element={<LoginWithWallet account={account} />} />
          <Route path="/" element={<ProductList products={products} loading={loading} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} cart={cart} setCart={setCart} isConnected={isConnected} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} account={account} />} />
          <Route path="/seller" element={<OrdersPage account={account}/>} />
          <Route path="/buyer" element={<BuyerOrdersPage account={account}/>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
