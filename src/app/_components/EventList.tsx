import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";

interface EventListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import DTFormator from "../_controllers/DateTimeFormator";
import { QrCodeIcon } from "@heroicons/react/16/solid";
import SearchBar from "./SearchBar";
import API from "../_controllers/api";
import EventForm from "./EventForm";

const EventList: React.FC<EventListProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [password, setPassword] = useState("");

  const signedEvents: Set<EventClass> = new Set();
  const unSignedEvents: Set<EventClass> = new Set();

  // Use the corrected useState hook
  const [filtedEvents, setFiltedEvents] = useState<EventClass[]>([]);
  // const [allEvents, setAllEvents] = useState<EventClass[]>([]);
  const [allCreatedEvents, setAllCreatedEvents] = useState<EventClass[]>([]);

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
    const newList: EventClass[] = allCreatedEvents.filter((event) => {
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
      const latest = await API().fetchTransactionList(user);
      const allEventsSet = new Set<EventClass>();
      latest.forEach((ev) => {
        allEventsSet.add(ev);
      });

      const singleLecturerCreated: EventClass[] = [];
      allEventsSet.forEach((ev: EventClass) => {
        if (ev.eventId.includes("-create")) {
          if (ev.teacherId === user.userID) {
            singleLecturerCreated.push(ev);
          }
        }
      });
      setAllCreatedEvents(singleLecturerCreated);

      const all: EventClass[] = [];
      // setAllEvents(all);
      setFiltedEvents(singleLecturerCreated);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  return (
    <div className="mb-6">
      <SearchBar userInfo={user} onSubmit={handleCon} />
      <div className="bg-white shadow-md rounded-lg p-6 text-black">
        {user && <EventForm userInfo={user} />}
        <div className="flex justify-center items-center ">
          <div className="overflow-x-auto mt-4">
            {error && <p className="text-red-500">Error: {error}</p>}

            <table className="w-full">
              <thead className="w-full bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    QR
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
                </tr>
              </thead>
              <tbody className="w-full bg-white divide-y divide-gray-200">
                {filtedEvents.map((ev: EventClass, index) => {
                  // const isSigned = signedEvents.has(ev); // 判断是否已签到
                  const dt = new Date(ev.deadline);
                  const now = new Date();
                  const isExpired = dt.getTime() < now.getTime();
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isExpired ? (
                          <QrCodeIcon className="h-7 w-7 text-gray-300" />
                        ) : (
                          <QRCodeGenerator
                            buttonClass={"text-black hover:text-blue-500"}
                            qrCodeData={JSON.stringify(ev.toJSON())}
                          />
                        )}{" "}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ev.eventId.replace("-create", "")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ev.teacherId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {DTFormator.formatDateTime(dt.toUTCString()).toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ev.remark || "No remark"}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventList;
