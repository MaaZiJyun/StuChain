"use client";
import API from "../_controllers/api";
import WithAuth from "../_components/WithAuth";
import Navbar from "../_components/Navbar";
import SearchBar from "../_components/SearchBar";
import { useEffect, useState } from "react";
import { UserClass } from "../_modules/UserClass";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import BlockFilter from "../_components/BlockFilter";
import StudentEventList from "../_components/StudentEventList";

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
        {user && <Navbar userInfo={user} />}
        <main className="overflow-y-auto w-full lg:flex-grow p-6 bg-gray-100 lg:rounded-l-xl lg:my-3 shadow-md">
          {user && <StudentEventList userInfo={user} />}
        </main>
      </div>
    );
};
export default WithAuth(page);
