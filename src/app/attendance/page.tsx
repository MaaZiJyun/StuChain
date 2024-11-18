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
import Profile from "../_components/Profile";
import AddressesTable from "../_components/AddressesTable";

// interface Wallet {
//   id: string;
//   userID: string;
//   addresses: string[];
// }

const page = () => {
  const api = API();

  function handleLogout(e: any): void {
    api.removeAuth();
    window.location.reload();
  }

  const teamMembers = [
    {
      name: "Jessica Goldsmith",
      role: "Software Engineer",
      image: "/images/jessica.jpg",
    },
    { name: "John Doe", role: "UI/UX Designer", image: "/images/john.jpg" },
    // Add more team members as needed
  ];

  return (
    <div className="min-h-screen flex bg-blue-600">
      <Head>
        <title>Attendance System</title>
        <meta
          name="description"
          content="Efficient attendance tracking system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar Navigation */}
      <aside className="w-64 text-white flex flex-col py-20">
        <div className="text-3xl font-bold mb-8 px-6">
          Blockchain Student Attendance System
        </div>
        <nav className="flex-grow">
          <ul className="">
            <li className="">
              <Link href="/dashboard">
                <div className="flex text-white space-x-2 hover:bg-blue-800 px-6 py-2">
                  <AdjustmentsHorizontalIcon className="h-6 w-6" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            <li className="">
              <Link href="/attendance">
                <div className="flex text-white space-x-2 hover:bg-blue-800 px-6 py-2">
                  <ClipboardIcon className="h-6 w-6" />
                  <span>Attendance</span>
                </div>
              </Link>
            </li>
            <li className="">
              <Link href="/mining">
                <div className="flex text-white space-x-2 hover:bg-blue-800 px-6 py-2">
                  <CubeIcon className="h-6 w-6" />
                  <span>Mining & Coins</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>

        <button onClick={handleLogout}>
          <div className="flex text-white space-x-2 hover:bg-blue-800 px-6 py-4">
            <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </div>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 bg-gray-100 rounded-l-xl my-3 shadow-md">
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

        <AddressesTable />

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
