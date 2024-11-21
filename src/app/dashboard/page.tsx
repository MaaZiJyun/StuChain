"use client";
import WithAuth from "../_components/WithAuth";
import Profile from "../_components/Profile";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import SearchBar from "../_components/SearchBar";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import { UserClass } from "../_modules/UserClass";
import QRCodeGenerator from "../_components/QRCodeGenerator";
import DateTimeFormator from "../_controllers/DateTimeFormator";

interface Attendance {
  walletId: string;
  password: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  changeAddress: string;
  participantId: string;
  hostId: string;
  eventId: string;
  deadline: string;
  remark: string;
}

const page = () => {
  const [user, setUser] = useState<UserClass>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  useEffect(() => {
    const data = LocalStorage().getAttribute("user");
    const userString = JSON.stringify(data);
    const userInstance = UserClass.fromStorage(userString);
    if (userInstance) {
      setUser(userInstance);

      // test
      if (user) {
        setIsStudent(user.userID.startsWith("S"));
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Creating a dummy data object adhering to the Attendance interface
  const dummyAttendance: Attendance[] = [
    {
      walletId: "wallet_12345",
      password: "securepassword123",
      fromAddress: "addr_abc123456",
      toAddress: "addr_def654321",
      amount: 100,
      changeAddress: "addr_change7890",
      participantId: "participant_67890",
      hostId: "host_id_13579",
      eventId: "event_24680",
      deadline: "2023-12-31T23:59:59", // ISO 8601 format for datetime
      remark: "This is a dummy remark for testing purposes.",
    },
  ];

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
          {user && <SearchBar userInfo={user} />}
          {user && <Profile userInfo={user} />}
          <div className="bg-white shadow-md rounded-lg p-6 text-black">
            {isStudent ? (
              <>
                <h3 className="text-2xl font-semibold mb-8">
                  Events participated
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Index</th>
                        <th className="text-left p-2">Event ID</th>
                        <th className="text-left p-2">Host ID</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyAttendance.map((attendance, index) => {
                        const dateTime = DateTimeFormator.formatDateTime(attendance.deadline);
                        return (
                          <tr className="border-t" key={index}>
                            <td className="p-2">{index}</td>
                            <td className="p-2">{attendance.eventId}</td>
                            <td className="p-2">{attendance.hostId}</td>
                            <td className="p-2">{dateTime.date}</td>
                            <td className="p-2">{dateTime.time}</td>
                            <td className="p-2">{attendance.remark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold mb-8">Events Held</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Index</th>
                      <th className="text-left p-2">Event ID</th>
                      <th className="text-left p-2">Host ID</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Remark</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyAttendance.map((attendance, index) => {
                      const dateTime = DateTimeFormator.formatDateTime(attendance.deadline);
                      return (
                        <tr className="border-t" key={index}>
                          <td className="p-2">{index}</td>
                          <td className="p-2">{attendance.eventId}</td>
                          <td className="p-2">{attendance.hostId}</td>
                          <td className="p-2">{dateTime.date}</td>
                          <td className="p-2">{dateTime.time}</td>
                          <td className="p-2">{attendance.remark}</td>
                          <td className="p-2">
                            <QRCodeGenerator
                              buttonClass={"text-black hover:text-blue-500"}
                              qrCodeData={JSON.stringify(attendance)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
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
