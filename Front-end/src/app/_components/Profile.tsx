import React, { useState, useEffect } from "react"; // Ensure you have this icon imported
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Spinner from "./Spinner";
import PasswordWidget from "./PasswordWidget";
import { UserClass } from "../_modules/UserClass";
import API from "../_controllers/api";

interface ProfileProps {
  userInfo: UserClass;
}

const Profile: React.FC<ProfileProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [assignedPassword, setAssignedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorAddress, setErrorAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isStudent, setIsStudent] = useState(true);
  const [balance, setBalance] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    console.log(user instanceof UserClass); // Should output true
    console.log(typeof user.addAddress);
    setIsStudent(user.userID.startsWith("S"));
    getUserBalance();
  }, []);

  useEffect(() => {
    if (assignedPassword) {
      console.log("Password assigned:", assignedPassword);
      createAddress();
    }
  }, [assignedPassword]);

  const getUserBalance = async () => {
    if (user.address) {
      try {
        const bal = await API().getBalance(user);
        console.log("running balance");
        if (bal >= 0) {
          setBalance(`$${bal / 1000000000}`);
        } else {
          setBalance("No Balance");
        }
      } catch (error) {
        setBalance("No Balance");
      }
    } else {
      setBalance("Not Available");
      setErrorAddress(
        "You need to create your address before you use any function provided."
      );
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setAssignedPassword(password);
  };

  const createAddress = async () => {
    if (user) {
      const newAddr = await user.addAddress(assignedPassword);
      // const newUser = new UserClass(user.walletId, user.userID, newAddr);
      // setUser(newUser);
      const newUser = await user.refreshUser();
      if (newUser) {
        console.log("created address: " + newAddr);
        setUser(newUser);
        //
        setSuccessMessage("Address created successfully");
      } else {
        console.log("Failed to create address: " + newAddr);
      }
    } else {
      throw new Error(`Error: Failed to add address`);
    }
  };

  const refreshWindows = () => {
    setSuccessMessage("");
    // window.location.reload();
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md text-black rounded-lg mb-6 py-24">
        <Spinner size="h-20 w-20" color="text-blue-500" strokeWidth={1} />
      </div>
    ); // Display loading indicator
  } else if (user === null) {
    <div className="bg-white shadow-md text-black rounded-lg mb-6 p-6">
      <span>Problem: {error}</span>
    </div>;
  } else
    return (
      <div className="bg-white shadow-md text-black rounded-lg mb-6 p-6">
        {successMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <div className="text-center">
                <p className="text-lg text-blue-500 mb-4">Well Done</p>
                <p className="text-sm text-gray-600 mb-6">{successMessage}</p>
                <button
                  onClick={refreshWindows}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-base w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
        {errorAddress && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <div className="text-center">
                <p className="text-lg text-yellow-500 mb-4">Attention</p>
                <p className="text-sm text-gray-600 mb-6">{errorAddress}</p>
                <button
                  onClick={() => {
                    setErrorAddress("");
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-base w-full"
                >
                  Ok, I understand
                </button>
              </div>
            </div>
          </div>
        )}
        <h3 className="text-2xl font-semibold mb-8">Profile Information</h3>
        <div className="flex flex-col space-y-2 w-full">
          <div className="flex space-x-2 items-center">
            <label className="font-bold w-20">User_ID:</label>
            <p className="">{user.userID}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <label className="font-bold w-20">Balance:</label>
            <p className="">{balance}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <label className="font-bold w-20">Identity:</label>
            {isStudent ? (
              <p className={`text-green-500`}>Student Permissions</p>
            ) : (
              <p className={`text-blue-500`}>Lecturer Permissions</p>
            )}
          </div>
          <div className="flex space-x-2 items-center">
            <label className="font-bold w-20">Wallet_ID:</label>
            <div className="w-full lg:w-1/3 truncate overflow-hidden whitespace-nowrap">
              <span className="py-1">{user.walletId}</span>
              <span>...</span>
            </div>
            <button onClick={() => copyToClipboard(user.walletId)}>
              <DocumentDuplicateIcon className="h-5 w-5 text-black hover:text-blue-500" />
            </button>
          </div>

          <div className="flex items-center">
            <label className="font-bold w-20">Address:</label>
            {user.address !== "" ? (
              <>
                <div className="w-full lg:w-1/3 truncate overflow-hidden whitespace-nowrap">
                  <span className="py-1">{user.address}</span>
                  <span>...</span>
                </div>

                <button onClick={() => copyToClipboard(user.address)}>
                  <DocumentDuplicateIcon className="h-5 w-5 text-black hover:text-blue-500" />
                </button>
              </>
            ) : (
              <>
                {error ? (
                  <p className="mt-1 text-red-500">{error}</p>
                ) : (
                  <p className="py-1 text-gray-500">
                    You need to create your first Address
                  </p>
                )}
                <PasswordWidget
                  buttonText="Get an Address"
                  buttonClass="ml-2 rounded-3xl text-white bg-blue-500 hover:bg-blue-700 my-1 text-sm px-2 py-1"
                  onSubmit={handlePasswordSubmit}
                />
              </>
            )}
          </div>
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
