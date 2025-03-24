"use client";
import WithAuth from "../_components/WithAuth";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import { UserClass } from "../_modules/UserClass";
import DTFormator from "../_controllers/DateTimeFormator";
import QueryList from "../_components/QueryList";

interface AttendanceRecord {
  eventId: string;
  stuId: string;
  timestamp: number;
}

const QueryPage = () => {
  const [user, setUser] = useState<UserClass>();
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const data = LocalStorage().getAttribute("user");
    const userString = JSON.stringify(data);
    const userInstance = UserClass.fromStorage(userString);
    if (userInstance) {
      if (!userInstance.userID.startsWith("L")) {
        window.location.href = "/dashboard";
      }
      setUser(userInstance);
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
      {user && <Navbar userInfo={user} />}
      <main className="overflow-y-auto w-full lg:flex-grow p-6 bg-gray-100 lg:rounded-l-xl lg:my-3 shadow-md">
        {user && <QueryList userInfo={user} />}
      </main>
    </div>
  );
};

export default WithAuth(QueryPage);
