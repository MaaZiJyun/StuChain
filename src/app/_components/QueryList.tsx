import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";

interface QueryListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import DTFormator from "../_controllers/DateTimeFormator";
import { QrCodeIcon } from "@heroicons/react/16/solid";
import SearchBar from "./SearchBar";
import API from "../_controllers/api";
import EventForm from "./EventForm";

const QueryList: React.FC<QueryListProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [password, setPassword] = useState("");

  const [filtedEvents, setFiltedEvents] = useState<EventClass[]>([]);
  const [studentSignedEvents, setStudentSignedEvents] = useState<EventClass[]>(
    []
  );

  const [eventId, setEventId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionList();
    setIsStudent(user.userID.startsWith("S"));
  }, []);

  useEffect(() => {
    if (eventId || studentId || startDate || endDate) {
      filter(eventId, studentId, startDate!, endDate!);
      console.log("[eventId, studentId, startDate, endDate]");
    } else {
      setFiltedEvents(studentSignedEvents);
    }
  }, [eventId, studentId, startDate, endDate]);

  const filter = (
    eventId: string,
    studentId: string,
    startDate: Date,
    endDate: Date
  ) => {
    const newList: EventClass[] = studentSignedEvents.filter((event) => {
      if (event.timestamp) {
        const time = new Date(event.timestamp * 1000);

        return (
          (eventId !== "" ? event.eventId.includes(eventId) : true) &&
          (studentId !== "" ? event.stuId.includes(studentId) : true) &&
          (startDate ? time >= startDate : true) &&
          (endDate ? time <= endDate : true)
        );
      }
      return false;
    });

    setFiltedEvents(newList);
  };

  const fetchTransactionList = async () => {
    try {
      const latest = await API().fetchTransactionList(user);
      const allEventsSet = new Set<EventClass>();
      latest.forEach((ev) => {
        allEventsSet.add(ev);
      });

      const teachingStudentRecords: EventClass[] = [];
      allEventsSet.forEach((ev: EventClass) => {
        if (!ev.eventId.includes("-create")) {
          if (ev.teacherId === user.userID) {
            teachingStudentRecords.push(ev);
          }
        }
      });
      setStudentSignedEvents(teachingStudentRecords);
      setFiltedEvents(teachingStudentRecords);
      setError(null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;

    switch (field) {
      case "eventId":
        setEventId(value);
        break;
      case "studentId":
        setStudentId(value);
        break;
      case "startDate":
        setStartDate(value ? new Date(value) : undefined);
        break;
      case "endDate":
        setEndDate(value ? new Date(value) : undefined);
        break;
      default:
        break;
    }
  };

  const fetchAndFilterRecords = () => {
    if (eventId || studentId || startDate || endDate) {
      filter(eventId, studentId, startDate!, endDate!);
    }
  };

  const resetFilters = () => {
    setEventId("");
    setStudentId("");
    setStartDate(undefined);
    setEndDate(undefined);
    setFiltedEvents(studentSignedEvents);
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Query Attendance Records</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              value={studentId}
              onChange={(e) => handleFilterChange(e, "studentId")}
              className="w-full p-2 border rounded-md"
              placeholder="Enter student ID"
            />
          </div>

          <div>
            <input
              type="text"
              value={eventId}
              onChange={(e) => handleFilterChange(e, "eventId")}
              className="w-full p-2 border rounded-md"
              placeholder="Enter event ID"
            />
          </div>

          <div>
            <input
              type="date"
              value={startDate?.toISOString().split("T")[0] || ""}
              onChange={(e) => handleFilterChange(e, "startDate")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate?.toISOString().split("T")[0] || ""}
              onChange={(e) => handleFilterChange(e, "endDate")}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={fetchAndFilterRecords}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Query Records
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtedEvents.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.eventId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.stuId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.timestamp
                      ? DTFormator.formatTimestamp(record.timestamp).toString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default QueryList;
