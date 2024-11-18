import React, { useState, useEffect } from "react"; // Ensure you have this icon imported
import API from "../_controllers/api";
import LocalStorage from "../_controllers/LocalStorage";
import {
  DocumentDuplicateIcon,
  PlusIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import Spinner from "./Spinner";
import PasswordWidget from "./PasswordWidget";
import QRCodeGenerator from "./QRCodeGenerator";

// Define the Wallet interface
interface Wallet {
  id: string;
  userID: string;
  addresses: string[];
}

const AddressesTable = () => {
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
    return (
      <div className="bg-white shadow-md text-black rounded-lg mb-6 py-24">
        <Spinner size="h-20 w-20" color="text-blue-500" strokeWidth={1} />
      </div>
    ); // Display loading indicator
  }

  if (!wallet) {
    return <p>No wallet data available or failed to load.</p>;
  }

  const firstAddress = wallet.addresses.length > 0 ? wallet.addresses[0] : null;

  const generateQRCode = (address: string) => {
    throw new Error("Function not implemented.");
  };

  return (
    <div className="bg-white shadow-md text-black rounded-lg mb-6 p-6">
      <h3 className="text-2xl font-semibold mb-8">Profile Information</h3>
      {isStudent ? (
        <div>
          {firstAddress ? (
            <div className="flex space-x-2 items-center">
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
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">User ID</th>
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {wallet.addresses.map((address, index) => (
                <tr className="border-t" key={index}>
                  <td className="p-2">{index}</td>
                  <td className="p-2">{wallet.userID}</td>
                  <td className="p-2">{address}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <button onClick={() => copyToClipboard(address)}>
                        <DocumentDuplicateIcon className="h-5 w-5 text-gray-500 hover:text-black" />
                      </button>
                      <QRCodeGenerator buttonText={""} buttonClass={""} qrCodeData={address} />
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t">
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <PasswordWidget
                    buttonText="Get an Address"
                    buttonClass="rounded-3xl text-white bg-blue-500 hover:bg-blue-700 my-1 text-sm px-2 py-1"
                    onSubmit={handlePasswordSubmit}
                  />
                </td>
              </tr>
            </tbody>
          </table>
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

export default AddressesTable;
