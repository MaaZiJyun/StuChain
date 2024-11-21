import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";
import PasswordWidget from "./PasswordWidget";
import DTFormator from "../_controllers/DateTimeFormator";

interface StudentEventListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

const StudentEventList: React.FC<StudentEventListProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [password, setPassword] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventClass | null>(null);

  const signedEvents: Set<EventClass> = new Set();
  const unSignedEvents: Set<EventClass> = new Set();
  const [filtedEvents, setFiltedEvents] = useState<EventClass[]>([]);
  const [allEvents, setAllEvents] = useState<EventClass[]>([]);

  const [eventId, setEventId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [lecturerId, setLecturerId] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionList();
    setIsStudent(user.userID.startsWith("S"));
  }, []);

  useEffect(() => {
    filter(eventId, studentId, lecturerId, dateTime);
  }, [eventId, studentId, lecturerId, dateTime]);

  const handleCon = (con: string) => {
    const c = JSON.parse(con);
    console.log(c);
    setEventId(c.eventId);
    setStudentId(c.studentId);
    setLecturerId(c.lecturerId);
    setDateTime(c.dateTime);
  };

  const filter = (
    eventId: string,
    studentId: string,
    lecturerId: string,
    dateTime: string
  ) => {
    // Filter the list based on the provided criteria
    const newList: EventClass[] = allEvents.filter((event) => {
      return (
        (eventId !== "" ? event.eventId.includes(eventId) : true) &&
        (studentId !== "" ? event.stuId.includes(studentId) : true) &&
        (lecturerId !== "" ? event.teacherId.includes(lecturerId) : true) &&
        (dateTime !== "" ? event.deadline.includes(dateTime) : true)
      );
    });

    setFiltedEvents(newList); // Return the filtered list
  };

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
      setFiltedEvents(all);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Sign attendance function
  const signAttendance = async (event: EventClass, password: string) => {
    const deadline = new Date().toISOString().slice(0, 16);
    const remark = `Signed by ${user.userID}`;
    
    try {
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
      fetchTransactionList(); // 刷新列表
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
      <SearchBar userInfo={user} onSubmit={handleCon} />
      <div className="flex justify-center items-center bg-white p-4 rounded-lg shadow-md">
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
            {filtedEvents.map((ev: EventClass, index) => {
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
                  <td className="px-6 py-4 whitespace-nowrap">{ev.deadline}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ev.remark || "No remark"}
                  </td>

<<<<<<< Updated upstream
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
                      {DTFormator.formatTimestamp(Number(ev.deadline)).toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ev.remark || "No remark"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {!isSigned && (
                        <PasswordWidget
                          buttonText="Sign"
                          buttonClass="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                          onSubmit={(password) => {
                            signAttendance(ev, password);
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
=======
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!isSigned && (
                      <button
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        onClick={() => {
                          signAttendance(ev);
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
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

export default StudentEventList;
