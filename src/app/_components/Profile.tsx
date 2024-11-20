import React, { useState, useEffect } from "react"; // Ensure you have this icon imported
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Spinner from "./Spinner";
import PasswordWidget from "./PasswordWidget";
import { UserClass } from "../_modules/UserClass";

interface ProfileProps {
  userInfo: UserClass; 
}

const Profile:React.FC<ProfileProps> = ({userInfo}) => {

  const [user, setUser] = useState<UserClass>(userInfo);
  const [assignedPassword, setAssignedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isStudent, setIsStudent] = useState(true);

  useEffect(() => {
    setIsStudent(user.userID.startsWith("S"));
  }, []);

  useEffect(() => {
    if (assignedPassword) {
      console.log("Password assigned:", assignedPassword);
      createAddress();
    }
  }, [assignedPassword]);

  const handlePasswordSubmit = (password: string) => {
    setAssignedPassword(password);
  };

  const createAddress = async () => {
    if (user) {
      user.addAddress(assignedPassword);
    }
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
        <h3 className="text-2xl font-semibold mb-8">Profile Information</h3>
        <div className="flex flex-col space-y-1 w-full">
          <div className="flex space-x-2 items-center">
            <label className="font-bold">User_ID:</label>
            <p className="px-2 py-1">{user.userID}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <label className="font-bold">Identity:</label>
            <p
              className={`mx-1 my-1 px-2 py-1 ${
                isStudent ? "text-green-500" : "text-blue-500"
              } `}
            >
              {isStudent ? "Student Permissions" : "Lecturer Permissions"}
            </p>
          </div>
          <div className="flex space-x-2 items-center">
            <label className="font-bold">Wallet_ID:</label>
            <input
              type="text"
              className="w-full lg:w-1/2 px-2 py-1 border rounded-md text-gray-700"
              readOnly
              value={user.walletId}
            />
            <button onClick={() => copyToClipboard(user.walletId)}>
              <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div>
            {user.address !== "" ? (
              <div className="flex space-x-2 items-center">
                <h3 className="font-bold">Address:</h3>

                <input
                  type="text"
                  className="w-full lg:w-1/2 px-2 py-1 border rounded-md text-gray-700"
                  readOnly
                  value={user.address}
                />

                <button onClick={() => copyToClipboard(user.address)}>
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
