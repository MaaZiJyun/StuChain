"use client";
import { useState } from "react";
import API from "../_controllers/api";
import "./register.css";
import Link from "next/link";

const page = () => {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessageOnUserID, setErrorMessageOnUserID] = useState("");
  const signUp = async () => {
    try {
      // Call API function getAllWallets
      const wallets = await API().createAWallet(userID, password);
      console.log("Wallets:", wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const handleUserIDChange = async (e: any) => {
    const enteredUserID = e.target.value;
    setUserID(enteredUserID);

    if (enteredUserID) {
      const duplicate = await API().isUserIDDuplicate(enteredUserID);
      if (duplicate) {
        setErrorMessageOnUserID(`UserID ${enteredUserID} is already taken.`);
      } else {
        setErrorMessageOnUserID(""); // Clear error message if no duplicate
      }
    } else {
      setErrorMessageOnUserID(""); // Clear error message if input is empty
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <h1 className="text-4xl text-black font-bold">Sign up</h1>

        <h2 className="text-lg text-black mb-4">to create an account</h2>

        <div className="mb-4">
          <label htmlFor="userID" className="block text-gray-500 text-sm mb-1">
            User ID
          </label>
          <input
            type="text"
            id="userID"
            value={userID}
            onChange={handleUserIDChange}
            // onChange={(e) => setUserID(e.target.value)} // Update state on change
            placeholder="Enter your NetID"
            className={`w-full p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring ${
              errorMessageOnUserID
                ? "focus:ring-red-400"
                : "focus:ring-blue-400"
            }`}
            required
          />
          {errorMessageOnUserID && (
            <p className="mt-1 text-red-500 text-sm">{errorMessageOnUserID}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-500 text-sm mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update state on change
            placeholder="Enter your NetPassword"
            className="w-full p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex items-center mb-4">
          <Link href="/login">
            <span className="text-blue-500 hover:underline">
              I had an account already
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={signUp}
          className="w-full mt-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition duration-200"
        >
          Sign up
        </button>
      </form>
    </div>
  );
};
export default page;
