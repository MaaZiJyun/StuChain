"use client";
import { useState } from "react";
import API from "../_controllers/api";
import "./register.css";
import Link from "next/link";

const page = () => {
  const [role, setRole] = useState("S");
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessageOnUserID, setErrorMessageOnUserID] = useState("");
  const [errorMessageOnPwd, setErrorMessageOnPwd] = useState("");

  const buttonCheck = () => {
    return (
      userID === "" ||
      password === "" ||
      errorMessageOnUserID !== "" ||
      errorMessageOnPwd !== ""
    );
  };

  const signUp = async () => {
    try {
      // Call API function getAllWallets
      const wallets = await API().createAWallet(role + userID, password);
      console.log("Wallets:", wallets);
    } catch (error) {
        if (error instanceof Error) {
            setErrorMessageOnUserID(`${error.message}`);
          } else {
            setErrorMessageOnUserID("An unexpected error occurred");
          }
    }
  };

  const handleUserIDChange = async (e: any) => {
    const enteredUserID = e.target.value;
    setUserID(enteredUserID);

    // Regular expression to test if the input contains only numbers
    if (!/^\d*$/.test(enteredUserID)) {
      setErrorMessageOnUserID("Please enter a valid number"); // Show error if invalid
    } else {
      if (enteredUserID.length <= 3) {
        setErrorMessageOnUserID("Please enter 4 digits numbers");
      } else {
        // const duplicate = await API().isUserIDDuplicate(role + enteredUserID);
        // if (duplicate) {
        //   setErrorMessageOnUserID(`UserID ${enteredUserID} is already taken.`);
        // } else {
        setErrorMessageOnUserID(""); // Clear error message if no duplicate
        // }
      }
    }
  };

  const handlePasswordChange = (e: any) => {
    const enteredPassword = e.target.value;
    setPassword(enteredPassword);
    const words = enteredPassword.trim().split(/\s+/);
    if (words.length <= 4) {
      setErrorMessageOnPwd("Password must contain more than 4 words");
      console.log(`${words} is not available`);
    } else {
      setErrorMessageOnPwd("");
      console.log(`${words} is available`);
    }
  };

  const handleRoleChange = (newRole: any) => {
    setRole(newRole);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <h1 className="text-4xl text-black font-bold">Sign up</h1>

        <h2 className="text-lg text-black mb-4">to create an account</h2>

        <div className="mb-4 flex items-center">
          <label className="block text-gray-500 text-sm mr-2">Role:</label>
          <label className="mr-4 text-black">
            <input
              type="checkbox"
              checked={role === "S"}
              onChange={() => handleRoleChange("S")}
              className="mr-1"
            />
            Student
          </label>
          <label className="text-black">
            <input
              type="checkbox"
              checked={role === "L"}
              onChange={() => handleRoleChange("L")}
              className="mr-1"
            />
            Lecturer
          </label>
        </div>

        <div className="mb-4">
          <label htmlFor="userID" className="block text-gray-500 text-sm mb-1">
            User ID
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="readOnlyField"
              value={role}
              readOnly
              className="w-7 p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            />
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
          </div>
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
            // onChange={(e) => setPassword(e.target.value)} // Update state on change
            onChange={handlePasswordChange}
            placeholder="Enter your NetPassword"
            className={`w-full p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring ${
              errorMessageOnPwd ? "focus:ring-red-400" : "focus:ring-blue-400"
            }`}
            required
          />
          {errorMessageOnPwd && (
            <p className="mt-1 text-red-500 text-sm">{errorMessageOnPwd}</p>
          )}
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
          disabled={buttonCheck()}
          className={`w-full mt-4 py-2 ${
            buttonCheck() ? "bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white font-bold rounded transition duration-200`}
        >
          Sign up
        </button>
      </form>
    </div>
  );
};
export default page;
