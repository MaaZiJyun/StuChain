import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";
import PasswordWidget from "./PasswordWidget";
import DTFormator from "../_controllers/DateTimeFormator";

interface StudentEventHistoryListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import LocalStorage from "../_controllers/LocalStorage";
import API from "../_controllers/api";

const StudentEventHistoryList: React.FC<StudentEventHistoryListProps> = ({
  userInfo,
}) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  const signedEvents: Set<EventClass> = new Set();
  const unSignedEvents: Set<EventClass> = new Set();
  const [filtedEvents, setFiltedEvents] = useState<EventClass[]>([]);
  // const [allEvents, setAllEvents] = useState<EventClass[]>([]);
  const [allSignedEvents, setAllSignedEvents] = useState<EventClass[]>([]);

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
    const newList: EventClass[] = allSignedEvents.filter((event) => {
      return (
        (eventId !== "" ? event.eventId.includes(eventId) : true) &&
        (studentId !== "" ? event.stuId.includes(studentId) : true) &&
        (lecturerId !== "" ? event.teacherId.includes(lecturerId) : true) &&
        (dateTime !== "" && event.timestamp
          ? DTFormator.formatTimestamp(event.timestamp)
              .toString()
              .includes(dateTime)
          : true)
      );
    });

    console.log("New:" + newList);

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

      const allSigned: EventClass[] = [];
      allEventsSet.forEach((ev: EventClass) => {
        if (!ev.eventId.includes("-create")) {
          allSigned.push(ev);
        }
      });
      setAllSignedEvents(allSigned);
      setFiltedEvents(allSigned);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  return (
    <div className="mb-6">
      <SearchBar userInfo={user} onSubmit={handleCon} />
      <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
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
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                Deadline
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                Remark
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                History Record
              </th>
            </tr>
          </thead>
          <tbody className="w-full bg-white divide-y divide-gray-200">
            {filtedEvents.map((ev: EventClass, index) => {
              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{index}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {ev.eventId.replace("-create", "")}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {ev.teacherId}
                  </td>

                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    {DTFormator.formatDateTime(ev.deadline).toString()}
                  </td> */}

                  <td className="max-x-60 min-x-40 px-6 py-4 whitespace-nowrap">
                    <p className="whitespace-normal">
                      {ev.remark || "No remark"}
                    </p>
                  </td>
                  <td className="max-x-60 min-x-40 px-6 py-4 whitespace-nowrap">
                    <p className="whitespace-normal">
                      {ev.timestamp && ev.timestamp !== 0
                        ? DTFormator.formatTimestamp(ev.timestamp).toString()
                        : "No remark"}
                    </p>
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

export default StudentEventHistoryList;
