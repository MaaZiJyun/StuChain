import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";

interface EventListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";

const EventList: React.FC<EventListProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [password, setPassword] = useState("");

  const filteredEvents: EventClass[] = [];

  // Use the corrected useState hook
  const [attendanceList, setAttendanceList] = useState<EventClass[]>([]);
  const [signedEvents, setSignedEvents] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionList();
    setIsStudent(user.userID.startsWith("S"));
  }, []);

  // Fetch attendance list
  const fetchTransactionList = async () => {
    try {
      // Fetch blockchain data
      const response = await fetch("http://localhost:3001/blockchain/blocks", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch attendance records: ${response.statusText}`
        );
      }

      const blocks = await response.json();

      // Filter attendance data
      const signedEventsSet = new Set();

      blocks.forEach((block: any) => {
        block.transactions.forEach((ev: any) => {
          // Collect signed event IDs
          const stuId = user.userID;
          if (ev.stuId === stuId && ev.eventId) {
            signedEventsSet.add(ev.eventId);
          }

          // Collect all "-create" events
          if (ev.eventId && ev.eventId.endsWith("-create")) {
            const fromAddress = user.address;
            const toAddress = ev.data.outputs[0]?.address || "";
            const amount = 0;
            const changeAddress = ev.data.outputs[1]?.address || "";
            const teacherId = ev.teacherId;
            const deadline = ev.deadline;
            const remark = ev.remark || "";
            const eventId = ev.eventId;
            const receivedEvent = new EventClass(
              fromAddress,
              toAddress,
              amount,
              changeAddress,
              stuId,
              teacherId,
              eventId,
              deadline,
              remark
            );
            filteredEvents.push(receivedEvent);
          }
        });
      });
      console.log(filteredEvents);
      setAttendanceList(filteredEvents);
      setSignedEvents(signedEventsSet);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Sign attendance function
  const signAttendance = async (event: EventClass) => {
    const deadline = new Date().toISOString().slice(0, 16); // Current time
    const remark = `Signed by ${user.userID}`;
    console.log(JSON.stringify("before signAttendance: " + event.toJSON()));
    try {
      // Execute sign transaction
      const signedEvent = new EventClass(
        user.address,
        event.fromAddress,
        0,
        user.address,
        user.userID,
        event.teacherId,
        event.eventId.replace("-create", ""),
        deadline,
        remark
      );
      await executeSignTransaction(user.walletId, password, signedEvent);

      console.log(JSON.stringify("signAttendance: " + signedEvent.toJSON()));

      // Refresh the attendance list
      fetchTransactionList();
    } catch (err) {
      console.error("Error during sign-in:", err);
      alert(`Sign-in Failed: ${err || "Unknown error"}`);
    }
  };

  // Execute sign transaction
  const executeSignTransaction = async (
    walletId: string,
    password: string,
    signedEvent: EventClass
  ) => {
    const response = await fetch(
      `http://localhost:3001/operator/wallets/${walletId}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          password, // Include password in headers
        },
        body: JSON.stringify(signedEvent.toJSON()),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message}`);
    }

    return response.json();
  };

  // Fetch attendance list on component load
  useEffect(() => {
    fetchTransactionList();
  }, []);

  return (
    <div className="container mx-auto mt-4">
      {error && <p className="text-red-500">Error: {error}</p>}

      <table className="w-full">
        <thead className="w-full bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Index
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
              Event Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
              Teacher ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
              Remark
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="w-full bg-white divide-y divide-gray-200">
          {attendanceList.map((attendance: EventClass, index) => {
            const isSigned = signedEvents.has(attendance.eventId); // 判断是否已签到
            return (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{index}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendance.eventId.replace("-create", "")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendance.teacherId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendance.deadline}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attendance.remark || "No remark"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {!isSigned && (
                    <button
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      onClick={() => {
                        signAttendance(attendance);
                      }}
                    >
                      Sign
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EventList;
