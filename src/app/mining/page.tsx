"use client";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import { UserClass } from "../_modules/UserClass";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import BlockchainInfo from "../_components/BlockchainInfo";
import MiningButton from "../_components/MiningButton";

const page = () => {
  const [user, setUser] = useState<UserClass>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const data = LocalStorage().getAttribute("user");
    const userString = JSON.stringify(data);
    const userInstance = UserClass.fromStorage(userString);
    if (userInstance) {
      setUser(userInstance);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-blue-500">
        <Spinner size="h-20 w-20" color="text-white" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="h-screen lg:flex bg-blue-600">
      <Navbar />
      <main className="overflow-y-auto w-full lg:flex-grow p-6 bg-gray-100 lg:rounded-l-xl lg:my-3 shadow-md">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Mining & Coins</h2>
          <p className="text-gray-600 mb-4">
            This page allows you to mine new blocks and view blockchain information.
          </p>
        </div>

        {/* Add Mining Button component */}
        <MiningButton />

        {/* Add BlockchainInfo component */}
        <BlockchainInfo />
      </main>
    </div>
  );
};

export default page;
