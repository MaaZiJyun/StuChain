import { useState } from "react";
import { UserClass } from "../_modules/UserClass";
import AttendanceWidget from "./AttendanceWidget";

interface SearchBarProps {
  userInfo: UserClass;
}

const SearchBar: React.FC<SearchBarProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const isStudent = user.userID.startsWith("S");
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        {isStudent && <AttendanceWidget />}
        <input
          type="text"
          placeholder="Search Attendance"
          className="w-full p-1 border-b-2 border-black mx-4 focus:outline-none focus:border-blue-500"
        />

        <div className="text-black rounded-lg">
          <select>
            <option>by User ID</option>
            <option>by Address</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
