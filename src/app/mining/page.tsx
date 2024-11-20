"use client"
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import SearchBar from "../_components/SearchBar";
import API from "../_controllers/api";
import { UserClass } from "../_modules/UserClass";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import WithAuth from "../_components/WithAuth";

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
      throw new Error(`Error: User Instance is not existing`);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-blue-500">
        <Spinner size="h-20 w-20" color="text-white" strokeWidth={2} />
      </div>
    ); // Display loading indicator
  }

  return (
    <div className="h-screen lg:flex bg-blue-600">
      <Navbar />
      <main className="overflow-y-auto w-full lg:flex-grow p-6 bg-gray-100 lg:rounded-l-xl lg:my-3 shadow-md">
        {user && <SearchBar userInfo={user} />}
        <div className="bg-white shadow-md rounded-lg p-6"></div>
      </main>
    </div>
  );
};
export default WithAuth(page);
