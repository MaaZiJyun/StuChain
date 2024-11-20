import { UserClass } from "../_modules/UserClass";
const API = () => {
  const ROOT = "http://localhost:3001";
  // const ROOT = "http://172.20.10.2:3001";
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

  async function fetchWalletByID(walletId: string): Promise<UserClass | null> {
    // Return a UserClass or undefined
    try {
      const res = await fetch(`${ROOT + OPERATOR_WALLETS}/${walletId}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();

      // Assuming data is a single object matching UserClass structure
      const userClassInstance = UserClass.fromJSON(JSON.stringify(data));
      return userClassInstance; // Return the UserClass instance
    } catch (error) {
      console.error("There was an error retrieving the wallet:", error);
      return null; // Return undefined if an error occurs
    }
  }

  const verificationAuth = async (
    userID: string,
    password: string
  ): Promise<UserClass | null> => {
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

      const data = await res.json(); // Assuming data is a single object matching UserClass structure
      // console.log("data:"+data);
      const jsonString = JSON.stringify(data);
      console.log("jsonString:" + jsonString);
      const userClassInstance = UserClass.fromJSON(jsonString);
      // console.log("userClassInstance:"+userClassInstance);
      return userClassInstance; // Return the UserClass instance
    } catch (err) {
      return null; // Return undefined if an error occurs
    }
  };

  const removeAuth = () => {
    // Clear user session storage or tokens
    localStorage.removeItem("user"); // Example of clearing user data
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

  const createAnAddress = async (walletId: string, password: string) => {
    const requestData = {
      walletId: walletId,
      password: password,
    };
    console.log("request: " + JSON.stringify(requestData));
    try {
      const res = await fetch(
        `${ROOT + OPERATOR_WALLETS}/${walletId}/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            password: password, // Sending password in headers
          },
        }
      );

      if (!res.ok) {
        // 尝试获取JSON错误详细信息
        const errorData = await res.json();
        console.log(errorData);
        throw new Error(`Error: ${errorData.message}`);
      }

      const { address } = await res.json();
      console.log(address);
      return address; // Return the data for further use
    } catch (err) {
      throw err; // Throw the error for further handling
    }
  };
  // Return an object exposing the API functions
  return {
    // getAllWallets,
    createAWallet,
    // isUserIDDuplicate,
    verificationAuth,
    removeAuth,
    fetchWalletByID,
    createAnAddress,
  };
};

export default API;
