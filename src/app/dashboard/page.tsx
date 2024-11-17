"use client";
import Head from "next/head";
import API from "../_controllers/api";

import {
  AdjustmentsHorizontalIcon,
  ArrowRightStartOnRectangleIcon,
  ClipboardIcon,
  CubeIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import LocalStorage from "../_controllers/LocalStorage";
import WithAuth from "../_components/WithAuth";
import Link from "next/link";

interface KeyPair {
  publicKey: string;
}

interface Wallet {
  id: string;
  userID: string;
  keyPairs: KeyPair[];
}

const page = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  function handleLogout(e: any): void {
    API().removeAuth();
    window.location.reload();
  }

  useEffect(() => {
    const wallet = LocalStorage().getAttribute("wallet");
    setWallet(wallet);
    console.log(wallet);
  }, []);

  const teamMembers = [
    {
      name: "Jessica Goldsmith",
      role: "Software Engineer",
      image: "/images/jessica.jpg",
    },
    { name: "John Doe", role: "UI/UX Designer", image: "/images/john.jpg" },
    // Add more team members as needed
  ];

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`Copied to clipboard: "${text}"`);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Head>
        <title>Attendance System</title>
        <meta
          name="description"
          content="Efficient attendance tracking system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-blue-600 text-white flex flex-col px-6 py-20">
        <div className="text-3xl font-bold mb-8">
          Blockchain Student Attendance System
        </div>
        <nav className="flex-grow">
          <ul className="space-y-4">
            <li>
              <Link href="/dashboard">
                <div className="flex text-white space-x-2">
                  <AdjustmentsHorizontalIcon className="h-6 w-6" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/attendance">
                <div className="flex text-white space-x-2">
                  <ClipboardIcon className="h-6 w-6" />
                  <span>Attendance</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/mining">
                <div className="flex text-white space-x-2">
                  <CubeIcon className="h-6 w-6" />
                  <span>Mining & Coins</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center mt-auto space-x-2">
          <button onClick={handleLogout}>
            <div className="flex text-white space-x-2">
              <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md space-x-2">
            <input
              type="text"
              placeholder="Search Attendance"
              className="flex-grow p-2 border rounded-lg"
            />
            <select className="border rounded-lg p-2">
              <option>by User ID</option>
              <option>by Address</option>
              {/* Add more years */}
            </select>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white shadow-md rounded-lg mb-6 p-4">
          <h3 className="text-xl font-semibold mb-8">Profile Information</h3>
          <div className="flex space-x-6 overflow-x-auto">
            {wallet ? (
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2 items-center">
                  <label className="font-bold">ID:</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 border rounded-md text-gray-700"
                    readOnly
                    value={wallet.id}
                  />
                  <button onClick={() => copyToClipboard(wallet.id)}>
                    <DocumentDuplicateIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <div className="flex space-x-2 items-center">
                  <label className="font-bold">User ID:</label>
                  <p>{wallet.userID}</p>
                </div>
                <div className="flex space-x-2 items-center">
                  <label className="font-bold">Identity:</label>
                  <p>
                    {wallet.userID.startsWith("S") ? "Student" : "Lecturer"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <h3 className="font-bold">Public Keys:</h3>
                  {wallet.keyPairs.map((keyPair, index) => (
                    <div key={index}>
                      <input type="text" readOnly value={keyPair.publicKey} />
                      <button
                        onClick={() => copyToClipboard(keyPair.publicKey)}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No wallet data available or failed to load.</p>
            )}
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white shadow-md rounded-lg p-4">
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
      </main>
    </div>
  );
};
export default WithAuth(page);
