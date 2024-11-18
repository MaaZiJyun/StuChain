const API = () => {
  const ROOT = "http://localhost:3001";
  const BLOCKCHAIN_BLOCKS = "/blockchain/blocks";
  const BLOCKCHAIN_TRANSACTIONS = "/blockchain/transactions";
  const OPERATOR = "/operator";
  const OPERATOR_WALLETS = "/operator/wallets";
  const NODE = "/node";
  const NODE_PEERS = "/node/peers";
  const MINER = "/miner/mine";
  const AUTH = "/operator/wallets/auth";

  const HEADER = {
    Accept: "application/json",
  };
  const HEADER2 = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Function to check if a userID is duplicate
  const isUserIDDuplicate = async (userID: string) => {
    try {
      const wallets = await getAllWallets(); // Fetch all wallets data

      // Check if any wallet has the same userID
      const duplicate = wallets.some(
        (wallet: { userID: string }) => wallet.userID === userID
      );

      if (duplicate) {
        console.log(`UserID ${userID} is already taken.`);
      } else {
        console.log(`UserID ${userID} is available.`);
      }

      return duplicate; // Returns true if duplicate, false otherwise
    } catch (error) {
      console.error("Error checking userID duplication:", error);
      return false; // Handle the error and assume no duplicate as a fallback
    }
  };

  const getAllWallets = async () => {
    try {
      const res = await fetch(ROOT + OPERATOR_WALLETS, {
        method: "GET",
        headers: HEADER,
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(data);
      return data; // Return the data for further use
    } catch (err) {
      throw err; // Throw the error for further handling
    }
  };

  async function fetchWalletByID(walletId: string) {
    try {
      const res = await fetch(`${ROOT + OPERATOR_WALLETS}/${walletId}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("There was an error retrieving the wallet:", error);
      // Handle or display the error as needed
    }
  }

  const verificationAuth = async (userID: string, password: string) => {
    const requestData = {
      password: password, // Actual password text
      userID: userID,
    };
    try {
      const res = await fetch(ROOT + AUTH, {
        method: "POST",
        headers: HEADER2,
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      return data; // Return the data for further use
    } catch (err) {
      throw err; // Throw the error for further handling
    }
  };

  const removeAuth = () => {
    // Clear user session storage or tokens
    localStorage.removeItem("wallet"); // Example of clearing user data
  };

  const createAWallet = async (userID: string, password: string) => {
    const requestData = {
      password: password, // Actual password text
      userID: userID,
    };
    try {
      const res = await fetch(ROOT + OPERATOR_WALLETS, {
        method: "POST",
        headers: HEADER2,
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        // 尝试获取JSON错误详细信息
        const errorData = await res.json();
        console.log(errorData);
        throw new Error(`Error: ${errorData.message}`);
      }

      const data = await res.json();
      console.log(data);
      return data; // Return the data for further use
    } catch (err) {
      throw err; // Throw the error for further handling
    }
  };
  // Return an object exposing the API functions
  return {
    getAllWallets,
    createAWallet,
    isUserIDDuplicate,
    verificationAuth,
    removeAuth,
    fetchWalletByID,
  };
};

export default API;
