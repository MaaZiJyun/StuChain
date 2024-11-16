"use client";
import API from "../_controllers/api";
import "./login.css";
import Link from "next/link";

const page = () => {
  const signIn = async () => {
    try {
      // Call API function getAllWallets
      const wallets = await API().getAllWallets();
      console.log("Wallets:", wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <h1 className="text-4xl text-black font-bold">Sign in</h1>

        <h2 className="text-lg text-black mb-4">to sign attendance</h2>

        <div className="mb-4">
          <label htmlFor="netID" className="block text-gray-500 text-sm mb-1">
            User ID
          </label>
          <input
            type="text"
            id="netID"
            placeholder="Enter your NetID"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="netPassword"
            className="block text-gray-500 text-sm mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="netPassword"
            placeholder="Enter your NetPassword"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
        </div>

        <div className="flex items-center mb-4">
          <Link href="/register">
            <span className="text-blue-500 hover:underline">
              Sign up for a new account
            </span>
          </Link>
        </div>

        <button
          type="submit"
          onClick={signIn}
          className="w-full mt-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition duration-200"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};
export default page;
