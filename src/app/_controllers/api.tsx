import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";
const API = () => {
  const ROOT = "https://localhost:3001";
  // const ROOT = "https://192.168.33.253:3001";
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

  const getBalance = async (user: UserClass) => {
    try {
      // Call the external API endpoint
      const response = await fetch(`${ROOT}/operator/${user.address}/balance`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      // Parse the response
      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }
      const data = await response.json();
      console.log("the balance is: " + data.balance);

      return data.balance;
      // Respond with the balance
      // res.status(200).json(data);
    } catch (error) {
      console.error({ error: "Failed to fetch balance" });
      return -1;
    }
  };

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

  const signAttendance = async (
    user: UserClass,
    event: EventClass,
    password: string
  ) => {
    const deadline = new Date().toISOString().slice(0, 16);
    const remark = `Signed by ${user.userID}`;

    try {
      const signedEvent = new EventClass(
        user.address,
        event.fromAddress,
        0,
        user.address,
        user.userID,
        event.teacherId,
        event.eventId.replace("-create", ""),
        event.deadline,
        remark
      );

      const ddl = new Date(event.deadline);
      const now = new Date();
      const isExpired = ddl.getTime() < now.getTime();

      if (isExpired) {
        throw new Error(
          `Attendance expired: ${ddl.toUTCString()} < ${now.toUTCString()}`
        );
      }

      const response = await fetch(
        `${ROOT + OPERATOR_WALLETS}/${user.walletId}/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            password, // Include password in headers
          },
          body: JSON.stringify(signedEvent.toJSON()),
        }
      );

      console.log(signedEvent.toJSON());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.message}`);
      }

      console.log(response);

      return response.json();
    } catch (err) {
      console.error("Error during sign-in:", err);
      throw err;
    }
  };

  // Fetch attendance list
  const fetchTransactionList = async (
    user: UserClass
  ): Promise<EventClass[]> => {
    const all: EventClass[] = [];
    try {
      // Fetch blockchain data
      const response = await fetch(`${ROOT}/blockchain/blocks`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch attendance records: ${response.statusText}`
        );
      }

      const blocks = await response.json();

      // console.log("blocks:" + JSON.stringify(blocks));

      // Filter attendance data
      const allEventsSet = new Set<EventClass>();

      blocks.forEach((block: any) => {
        block.transactions.forEach((ev: any) => {
          // Collect signed event IDs

          // Collect all "-create" events
          if (ev.eventId) {
            const fromAddress = ev.data.outputs[0]?.address || "";
            const toAddress = ev.data.outputs[1]?.address || "";
            const amount = 0;
            const changeAddress = ev.data.outputs[0]?.address || "";
            const teacherId = ev.teacherId;
            const stuId = ev.stuId;
            const deadline = ev.deadline;
            const remark = ev.remark || "";
            const eventId = ev.eventId;
            const ts = ev.timestamp || "Not avalible";
            const receivedEvent = new EventClass(
              fromAddress,
              toAddress,
              amount,
              changeAddress,
              stuId,
              teacherId,
              eventId,
              deadline,
              remark,
              ts
            );
            allEventsSet.add(receivedEvent);
          }
        });
      });

      allEventsSet.forEach((ev: EventClass) => {
        all.push(ev);
      });
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
    return all;
  };

  const fetchBlockchainInfo = async () => {
    try {
      const response = await fetch(`${ROOT}/blockchain/blocks`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching blockchain info:", error);
    }
  };

  const handleMining = async (user: UserClass) => {
    try {
      const response = await fetch(`${ROOT}/miner/mine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          rewardAddress: user.address,
          feeAddress: user.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Mining failed");
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      throw new Error("block create failed");
    }
  };

  const createTransaction = async (
    user: UserClass,
    password: string,
    eventId: string,
    deadline: string,
    remark: string
  ) => {
    // 创建请求体
    const fromAddress = user?.address;
    const toAddress = user?.address;
    const walletId = user?.walletId;
    const teacherId = user?.userID;
    const stuId = "";
    const amount = 0;
    const changeAddress = user?.address;

    const now = new Date(); // 当前时间
    now.setMinutes(now.getMinutes() + 30);

    const newEvent = new EventClass(
      fromAddress,
      toAddress,
      amount,
      changeAddress,
      stuId,
      teacherId,
      eventId + "-create",
      deadline === "" ? now.toUTCString() : deadline,
      remark
    );

    console.log("submit:" + JSON.stringify(newEvent));
    // 发送 POST 请求

    const response = await fetch(
      `${ROOT}/operator/wallets/${walletId}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          password, // 将密码放在请求头中
        },
        body: JSON.stringify(newEvent),
      }
    );

    // 检查响应
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message}`);
    }

    return response.json(); // 返回响应数据
  };

  // Return an object exposing the API functions
  return {
    // getAllWallets,
    createAWallet,
    fetchTransactionList,
    verificationAuth,
    removeAuth,
    fetchWalletByID,
    createAnAddress,
    signAttendance,
    fetchBlockchainInfo,
    handleMining,
    createTransaction,
    getBalance,
  };
};

export default API;
