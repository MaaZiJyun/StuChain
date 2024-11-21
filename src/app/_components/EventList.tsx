import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";
import QRCodeGenerator from "./QRCodeGenerator";
import DTFormator from "../_controllers/DateTimeFormator";

interface EventListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

const EventList: React.FC<EventListProps> = ({ userInfo }) => {
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
  const [lecturerId, setLecturerId] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionList();
    setIsStudent(user.userID.startsWith("S"));
  }, []);

  useEffect(() => {
    filter(eventId, lecturerId, dateTime);
  }, [eventId, lecturerId, dateTime]);

  const handleCon = (con: string) => {
    const c = JSON.parse(con);
    console.log(c);
    setEventId(c.eventId);
    setLecturerId(c.lecturerId);
    setDateTime(c.dateTime);
  };

  const filter = (
    eventId: string,
    lecturerId: string,
    dateTime: string
  ) => {
    // Filter the list based on the provided criteria
    const newList: EventClass[] = allEvents.filter((event) => {
      return (
        (eventId !== "" ? event.eventId.includes(eventId) : true) &&
        (lecturerId !== "" ? event.teacherId.includes(lecturerId) : true) &&
        (dateTime !== "" ? event.deadline.includes(dateTime) : true)
      );
    });

    setFiltedEvents(newList);
  };

  // Fetch attendance list
  const fetchTransactionList = async () => {
    try {
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
      const allEventsSet = new Set<EventClass>();

      blocks.forEach((block: any) => {
        block.transactions.forEach((ev: any) => {
          if (ev.eventId && ev.eventId.endsWith("-create")) {
            const fromAddress = ev.data.outputs[0]?.address || "";
            const toAddress = ev.data.outputs[0]?.address || "";
            const amount = 0;
            const changeAddress = ev.data.outputs[1]?.address || "";
            const stuId = ev.stuId || "";
            const teacherId = ev.teacherId;
            
            let deadline = ev.deadline;
            if (typeof deadline === 'number') {
              deadline = deadline.toString();
            } else if (typeof deadline === 'string') {
              deadline = deadline;
            } else {
              deadline = new Date().toISOString();
            }

            const remark = ev.remark || "";
            const eventId = ev.eventId;

            // 只添加当前登录老师创建的事件
            if (teacherId === user.userID) {
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
          }
        });
      });

      console.log(allEventsSet);
      const all: EventClass[] = [];
      allEventsSet.forEach((ev: EventClass) => {
        all.push(ev);
      });
      setAllEvents(all);
      setFiltedEvents(all);
      setError(null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

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
              let formattedTime;
              try {
                formattedTime = DTFormator.formatTimestamp(Number(ev.deadline)).toString();
              } catch (err) {
                formattedTime = ev.deadline;
              }

              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{index}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ev.eventId.replace("-create", "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formattedTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ev.remark || "No remark"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <QRCodeGenerator
                      buttonClass={"text-black hover:text-blue-500"}
                      qrCodeData={JSON.stringify(ev)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList;
