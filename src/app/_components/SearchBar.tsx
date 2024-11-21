import { useState } from "react";
import { UserClass } from "../_modules/UserClass";
import AttendanceWidget from "./AttendanceWidget";
import { MagnifyingGlassIcon, ArrowUturnLeftIcon, FlagIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  userInfo: UserClass;
}

const SearchBar: React.FC<SearchBarProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const isStudent = user.userID.startsWith("S");
  return (
    <div className="mb-6">
      <div className="flex justify-center items-center bg-white p-4 rounded-lg shadow-md">
        {isStudent && <AttendanceWidget />}
        <input
          type="text"
          placeholder="Event ID"
          className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
        />

        {isStudent ? (
          <input
            type="text"
            placeholder="Lecturer ID"
            className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
          />
        ) : (
          <input
            type="text"
            placeholder="Student ID"
            className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
          />
        )}

        <input
          type="date"
          className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
        />

        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-1 py-1 rounded-md hover:bg-blue-600"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-1 py-1 rounded-md hover:bg-gray-600"
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-1 py-1 rounded-md hover:bg-red-600"
          >
            <FlagIcon className="h-6 w-6" />
          </button>
        </div>

        {/* <div className="text-black rounded-lg">
          <select>
            <option>by User ID</option>
            <option>by Address</option>
          </select>
        </div> */}
      </div>
    </div>
  );
};

export default SearchBar;
