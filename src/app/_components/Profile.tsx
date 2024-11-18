import React, { useState, useEffect } from "react"; // Ensure you have this icon imported
import API from "../_controllers/api";
import LocalStorage from "../_controllers/LocalStorage";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Spinner from "./Spinner";

// Define the Wallet interface
interface Wallet {
  id: string;
  userID: string;
  addresses: string[];
}

const Profile = () => {
  const local = LocalStorage();
  const api = API();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const wallet = local.getAttribute("wallet");
    setWallet(wallet);
    console.log("Initial wallet:", wallet);
    if (wallet) {
      refreshWallet(wallet.id);
    }
  }, []);

  const refreshWallet = async (walletId: string) => {
    if (walletId) {
      try {
        const newWallet = await api.fetchWalletByID(walletId);
        console.log("New wallet:", newWallet);
        if (newWallet) {
          setWallet(newWallet);
          console.log(`${newWallet.id} updated!`);
        } else {
          setError("An unexpected error occurred");
        }
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(`${err.message}`);
        } else {
          setError("An unexpected error occurred");
        }
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Spinner size="h-20 w-20" color="text-blue-500" strokeWidth={1} />; // Display loading indicator
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!wallet) {
    return <p>No wallet data available or failed to load.</p>;
  }

  const firstAddress =
    wallet.addresses.length > 0
      ? wallet.addresses[0]
      : "No addresses available";

  return (
    <div className="flex flex-col space-y-1 w-1/2">
      <div className="flex space-x-2 items-center">
        <label className="font-bold">User_ID:</label>
        <p className="px-2 py-1">{wallet.userID}</p>
      </div>
      <div className="flex space-x-2 items-center">
        <label className="font-bold">Identity:</label>
        <p
          className={`mx-1 my-1 px-2 py-1 rounded-3xl text-sm ${
            wallet.userID.startsWith("S") ? "bg-blue-500" : "bg-red-500"
          } text-white`}
        >
          {wallet.userID.startsWith("S")
            ? "Student Permissions"
            : "Lecturer Permissions"}
        </p>
      </div>
      <div className="flex space-x-2 items-center">
        <label className="font-bold">Wallet_ID:</label>
        <input
          type="text"
          className="w-full px-2 py-1 border rounded-md text-gray-700"
          readOnly
          value={wallet.id}
        />
        <button onClick={() => copyToClipboard(wallet.id)}>
          <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="flex space-x-2 items-center">
        <h3 className="font-bold">Address:</h3>
        <input
          type="text"
          className="w-full px-2 py-1 border rounded-md text-gray-700"
          readOnly
          value={firstAddress}
        />
        <button onClick={() => copyToClipboard(firstAddress)}>
          <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

// Example of the copy to clipboard function
const copyToClipboard = (value: string) => {
  navigator.clipboard.writeText(value).then(
    () => console.log(`${value} copied to clipboard!`),
    (err) => console.error("Failed to copy:", err)
  );
};

export default Profile;
