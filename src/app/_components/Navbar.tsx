"use client";
import {
  AdjustmentsHorizontalIcon,
  ArrowRightStartOnRectangleIcon,
  ClipboardIcon,
  CubeIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useState } from "react";
import API from "../_controllers/api";
import { UserClass } from "../_modules/UserClass";

interface NavbarProps {
  userInfo: UserClass;
}

const Navbar: React.FC<NavbarProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const isStudent = user.userID.startsWith("S");
  function handleLogout(e: any): void {
    API().removeAuth();
    window.location.reload();
  }
  return (
    <>
      <aside className="hidden lg:flex lg:w-64 text-white flex-col py-12">
        <div className="text-3xl font-bold mb-8 px-6">
          Blockchain Student Attendance System
        </div>
        <nav className="flex-grow">
          <ul className="">
            <li className="">
              <Link href="/dashboard">
                <div className="flex text-white space-x-2 hover:bg-white hover:text-blue-500 px-6 py-2">
                  <AdjustmentsHorizontalIcon className="h-6 w-6" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>
            {isStudent ? (
              <li className="">
                <Link href="/attendance">
                  <div className="flex text-white space-x-2 hover:bg-white hover:text-blue-500 px-6 py-2">
                    <ClipboardIcon className="h-6 w-6" />
                    <span>Attendance</span>
                  </div>
                </Link>
              </li>
            ) : (
              <li className="">
                <Link href="/events">
                  <div className="flex text-white space-x-2 hover:bg-white hover:text-blue-500 px-6 py-2">
                    <MegaphoneIcon className="h-6 w-6" />
                    <span>Events</span>
                  </div>
                </Link>
              </li>
            )}

            <li className="">
              <Link href="/mining">
                <div className="flex text-white space-x-2 hover:bg-white hover:text-blue-500 px-6 py-2">
                  <CubeIcon className="h-6 w-6" />
                  <span>Blockchain</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>

        <button onClick={handleLogout}>
          <div className="flex text-white space-x-2 hover:bg-white hover:text-red-500 px-6 py-2">
            <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </div>
        </button>
      </aside>
      <nav className="flex lg:hidden bg-blue-600 items-center justify-between">
        <div className="text-base text-white font-bold px-6 py-2">
          Blockchain Student Attendance System
        </div>
        <div className="flex">
          <Link href="/dashboard">
            <div className="flex text-white space-x-2 hover:bg-blue-800 px-3 py-2">
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </div>
          </Link>

          {isStudent ? (
            <Link href="/attendance">
              <div className="flex text-white space-x-2 hover:bg-blue-800 px-3 py-2">
                <ClipboardIcon className="h-6 w-6" />
              </div>
            </Link>
          ) : (
            <Link href="/events">
              <div className="flex text-white space-x-2 hover:bg-blue-800 px-3 py-2">
                <MegaphoneIcon className="h-6 w-6" />
              </div>
            </Link>
          )}

          <Link href="/mining">
            <div className="flex text-white space-x-2 hover:bg-blue-800 px-3 py-2">
              <CubeIcon className="h-6 w-6" />
            </div>
          </Link>
          <button onClick={handleLogout}>
            <div className="flex text-white space-x-2 hover:bg-blue-800 px-3 py-2">
              <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
            </div>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
