import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";

interface EventListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";

const EventList: React.FC<EventListProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [password, setPassword] = useState("");

  const signedEvents: Set<EventClass> = new Set();
  const unSignedEvents: Set<EventClass> = new Set();

  // Use the corrected useState hook
  const [attendanceList, setAttendanceList] = useState<EventClass[]>([]);
  const [allEvents, setAllEvents] = useState<EventClass[]>([]);

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
      const allEventsSet = new Set<EventClass>();

      blocks.forEach((block: any) => {
        block.transactions.forEach((ev: any) => {
          // Collect signed event IDs
          const stuId = user.userID;

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
            allEventsSet.add(receivedEvent);
          }
        });
      });

      allEventsSet.forEach((ev: EventClass) => {
        if (ev.stuId) {
          if (ev.stuId === user.userID) {
            signedEvents.add(ev);
          } else {
            allEventsSet.delete(ev);
          }
        } else {
          unSignedEvents.add(ev);
        }
      });

      console.log(allEventsSet);
      const all: EventClass[] = [];
      allEventsSet.forEach((ev: EventClass) => {
        all.push(ev);
      });
      setAllEvents(all);
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
    <div className="mb-6">
      <div className="flex justify-center items-center ">
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
              {allEvents.map((ev: EventClass, index) => {
                const isSigned = signedEvents.has(ev); // 判断是否已签到
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{index}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ev.eventId.replace("-create", "")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ev.teacherId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ev.deadline}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ev.remark || "No remark"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <QRCodeGenerator
                        buttonClass={""}
                        qrCodeData={JSON.stringify(ev.toJSON())}
                      />{" "}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventList;
