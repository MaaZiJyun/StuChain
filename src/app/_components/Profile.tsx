import React, { useState, useEffect } from "react"; // Ensure you have this icon imported
import API from "../_controllers/api";
import LocalStorage from "../_controllers/LocalStorage";
import { DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";
import Spinner from "./Spinner";
import PasswordWidget from "./PasswordWidget";

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
  const [assignedPassword, setAssignedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState(true);

  useEffect(() => {
    const wallet = local.getAttribute("wallet");
    setWallet(wallet);
    console.log("Initial wallet:", wallet);
    if (wallet) {
      setIsStudent(wallet.userID.startsWith("S"));
      refreshWallet(wallet.id);
    }
  }, []);

  useEffect(() => {
    if (assignedPassword) {
      console.log("Password assigned:", assignedPassword);
      createAddress();
    }
  }, [assignedPassword]);

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

  const handlePasswordSubmit = (password: string) => {
    setAssignedPassword(password);
  };

  const createAddress = async () => {
    if (wallet) {
      console.log(wallet);
      try {
        setLoading(true);
        const newAddress = await api.createAnAddress(
          wallet.id,
          assignedPassword
        );
        console.log("New Address:", newAddress);
        if (newAddress) {
          wallet.addresses.push(newAddress);
          console.log(`${newAddress} updated!`);
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

  if (!wallet) {
    return <p>No wallet data available or failed to load.</p>;
  }

  const firstAddress = wallet.addresses.length > 0 ? wallet.addresses[0] : null;

  return (
    <div className="flex flex-col space-y-1 w-1/2">
      <div className="flex space-x-2 items-center">
        <label className="font-bold">User_ID:</label>
        <p className="px-2 py-1">{wallet.userID}</p>
      </div>
      <div className="flex space-x-2 items-center">
        <label className="font-bold">Identity:</label>
        <p
          className={`mx-1 my-1 px-2 py-1 ${
            isStudent ? "text-blue-500" : "text-red-500"
          } `}
        >
          {isStudent ? "Student Permissions" : "Lecturer Permissions"}
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
      {isStudent ? (
        <div>
          {firstAddress ? (
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
          ) : (
            <div>
              <div className="flex space-x-2 items-center">
                <h3 className="font-bold">Address:</h3>

                {error ? (
                  <p className="mt-1 text-red-500">{error}</p>
                ) : (
                  <p className="text-gray-500">
                    You need to create your first Address
                  </p>
                )}
                <PasswordWidget
                  buttonText="Get an Address"
                  buttonClass="rounded-3xl text-white bg-blue-500 hover:bg-blue-700 my-1 text-sm px-2 py-1"
                  onSubmit={handlePasswordSubmit}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex space-x-2 mt-2 items-start">
            <h3 className="font-bold">Address:</h3>
            <ul className="space-y-2">
              {wallet.addresses.map((address, index) => (
                <li className="flex items-center space-x-2" key={index}>
                  <label>{index}.</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border rounded-md text-gray-700"
                    readOnly
                    value={address}
                  />

                  <button onClick={() => copyToClipboard(address)}>
                    <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </li>
              ))}
              <li className="flex items-center space-x-2">
                {error ? (
                  <p className="mt-1 text-red-500">{error}</p>
                ) : (
                  <p className="text-gray-500">
                    You need to create your first Address
                  </p>
                )}
                <PasswordWidget
                  buttonText="Get an Address"
                  buttonClass="rounded-3xl text-white bg-blue-500 hover:bg-blue-700 my-1 text-sm px-2 py-1"
                  onSubmit={handlePasswordSubmit}
                />
              </li>
            </ul>
          </div>
        </div>
      )}
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
