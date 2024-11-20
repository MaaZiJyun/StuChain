"use client";
import Head from "next/head";
import API from "../_controllers/api";
import WithAuth from "../_components/WithAuth";
import Navbar from "../_components/Navbar";
import SearchBar from "../_components/SearchBar";
import { useEffect, useState } from "react";
import { UserClass } from "../_modules/UserClass";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import BlockchainInfo from '../_components/BlockchainInfo';
import BlockFilter from '../_components/BlockFilter';

const page = () => {
  const api = API();

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
    ); // Display loading indicator
  } else
    return (
      <div className="h-screen lg:flex bg-blue-600">
        <Navbar />
        <main className="overflow-y-auto w-full lg:flex-grow p-6 bg-gray-100 lg:rounded-l-xl lg:my-3 shadow-md">
          {user && <SearchBar userInfo={user} />}
          <BlockFilter />
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">User ID</th>
                    <th className="text-left p-2">Address</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">1</td>
                    <td className="p-2">S2312</td>
                    <td className="p-2">
                      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                    </td>
                    <td className="p-2">20-08-2021</td>
                    <td className="p-2">09:00 AM</td>
                  </tr>
                  {/* Add more rows as necessary */}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                Show{" "}
                <select className="border rounded p-1">
                  <option>10</option>
                  <option>25</option>
                </select>
              </div>
              <div>
                {/* Pagination */}
                <button className="p-1">&lt;</button>
                <button className="p-1">1</button>
                <button className="p-1">2</button>
                <button className="p-1">&gt;</button>
              </div>
            </div>
          </div>
          
          <BlockchainInfo />
        </main>
      </div>
    );
};
export default WithAuth(page);
