import { EventClass } from "../_modules/EventClass";
import { UserClass } from "../_modules/UserClass";
import PasswordWidget from "./PasswordWidget";
import DTFormator from "../_controllers/DateTimeFormator";

interface StudentEventListProps {
  userInfo: UserClass;
}

import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import LocalStorage from "../_controllers/LocalStorage";
import API from "../_controllers/api";

const StudentEventList: React.FC<StudentEventListProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  const unSignedEvents: Set<EventClass> = new Set();

  const [filtedEvents, setFiltedEvents] = useState<EventClass[]>([]);
  const [allEvents, setAllEvents] = useState<EventClass[]>([]);
  const [allCreatedEvents, setAllCreatedEvents] = useState<EventClass[]>([]);
  const [allSignedEventIds, setAllSignedEventIds] = useState<string[]>([]);

  const [eventId, setEventId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [lecturerId, setLecturerId] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");

  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    fetchTransactionList();
    setIsStudent(user.userID.startsWith("S"));
  }, []);

  useEffect(() => {
    filter(eventId, studentId, lecturerId, dateTime);
  }, [eventId, studentId, lecturerId, dateTime]);

  const isEventSigned = (event: EventClass): boolean => {
    const eventId = event.eventId.replace("-create", "");
    var result = false;
    allSignedEventIds.forEach((str) => {
      if (str === eventId) {
        console.log(`${str} ${eventId} : ${str === eventId}`);
        result = true;
      }
    });
    return result;
  };

  const handleCon = (con: string) => {
    const c = JSON.parse(con);
    // console.log(c);
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

      const allCreated: EventClass[] = [];
      const allSignedSet: Set<string> = new Set();
      const allSignedList: string[] = [];

      allEventsSet.forEach((ev: EventClass) => {
        // console.log(`allcreated process: ${ev.eventId}`);
        if (ev.eventId.includes("-create")) {
          allCreated.push(ev);
        } else if (ev.stuId !== "" && ev.stuId === user.userID) {
          // console.log(`EV STUDID: ${ev.stuId}`);
          // console.log(JSON.stringify(ev));
          allSignedSet.add(ev.eventId);
          // console.log(allSignedEventIds);
        }
      });
      setAllCreatedEvents(allCreated);
      allSignedSet.forEach((str) => {
        allSignedList.push(str);
      });
      setAllSignedEventIds(allSignedList);
      const all: EventClass[] = [];
      // console.log(allCreated);
      setAllEvents(all);
      setFiltedEvents(allCreated);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
    setLoading(false);
  };

  if (loading) {
  } else
    return (
      <div className="mb-6">
        <SearchBar userInfo={user} onSubmit={handleCon} />
        {successMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <div className="text-center">
                <p className="text-lg text-blue-500 mb-4">Well Done</p>
                <p className="text-sm text-gray-600 mb-6">
                  {successMessage}
                </p>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-base w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
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
                const dt = new Date(ev.deadline);
                const now = new Date();
                const isExpired = dt.getTime() < now.getTime();
                const isSigned = isEventSigned(ev);
                console.log(`isEventSigned(ev) ${isEventSigned(ev)}`);
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
                      {DTFormator.formatDateTime(ev.deadline).toString()}
                    </td>

                    <td className="max-x-60 min-x-40 px-6 py-4 whitespace-nowrap">
                      <p className="whitespace-normal">
                        {ev.remark || "No remark"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {!isSigned && !isExpired ? (
                        <PasswordWidget
                          buttonText="Sign"
                          buttonClass="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                          onSubmit={(password) => {
                            try {
                              API().signAttendance(user, ev, password);
                              setSuccessMessage(
                                "Your attendance signed successfully"
                              );
                            } catch (error) {
                              // console.error(error);
                              if (error instanceof Error) {
                                setError(error.message);
                              } else {
                                setError("An unknown error occurred"); // 捕获未知类型错误
                              }
                            }
                          }}
                        />
                      ) : (
                        <button
                          className={`px-3 py-2 ${
                            isSigned ? "bg-gray-300" : "bg-red-300"
                          } text-white rounded-lg`}
                        >
                          {isSigned ? "Signed" : "Expired"}
                          {/* {`isSigned: ${isSigned}`} */}
                        </button>
                      )}
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

export default StudentEventList;
