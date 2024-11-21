import React, { useState, useEffect } from "react"; // Ensure you have this icon imported
import API from "../_controllers/api";
import { UserClass } from "../_modules/UserClass";
import QRCodeScanner from "./QRCodeScanner";
import { DocumentDuplicateIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import PasswordWidget from "./PasswordWidget";
import { EventClass } from "../_modules/EventClass";

interface AttendanceWidgetProps {
  userInfo: UserClass;
}

const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const api = API();

  const [assignedPassword, setAssignedPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isStudent, setIsStudent] = useState(true);
  const [isOpenning, setIsOpenning] = useState(false);
  const [qrData, setQrData] = useState("");
  const [transaction, setTransaction] = useState<EventClass>();

  const [allEvents, setAllEvents] = useState<EventClass[]>([]);

  const [error, setError] = useState("");

  // Toggle scanning state
  const openWidget = () => {
    setIsOpenning(true);
    fetchTransactionList();
    console.log("open");
  };

  const closeWidget = () => {
    setIsOpenning(false);
  };

  useEffect(() => {
    if (qrData) {
      console.log("QR assigned:", qrData);
      const newTransaction = EventClass.fromJSON(JSON.parse(qrData));
      if (newTransaction) {
        setTransaction(newTransaction);
        if (transaction) {
          const isSigned = isEventSigned(transaction, allEvents);
          const dt = new Date(transaction.deadline);
          const now = new Date();
          const isExpired = dt.getTime() < now.getTime();
          if (!isSigned && !isExpired) {
            takeAttendance();
          }
        } else {
          console.log("transaction error");
        }
      } else {
        console.log("new transaction error");
      }
    }
  }, [qrData]);

  const fetchTransactionList = async () => {
    try {
      const latest = await API().fetchTransactionList(user);
      // const allEventsSet = new Set<EventClass>();
      const all: EventClass[] = [];
      latest.forEach((ev) => {
        all.push(ev);
      });
      setAllEvents(all);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const isEventSigned = (event: EventClass, events: EventClass[]): boolean => {
    const signedEventsIds: Set<string> = new Set();
    events.forEach((ev) => {
      if (ev.stuId !== "" && ev.stuId === user.userID) {
        signedEventsIds.add(ev.eventId);
      }
    });
    const result = signedEventsIds.has(event.eventId);
    return result;
  };

  const handleQRData = (code: string) => {
    setQrData(code);
  };

  const handlePasswordData = (password: string) => {
    setAssignedPassword(password);
  };

  useEffect(() => {
    if (assignedPassword) {
      console.log("Password assigned:", assignedPassword);
      takeAttendance();
    }
  }, [assignedPassword]);

  const takeAttendance = async () => {
    const signedAttendance = new EventClass(
      user?.address,
      transaction?.fromAddress ?? "",
      0,
      transaction?.changeAddress ?? "",
      user?.userID,
      transaction?.teacherId ?? "",
      transaction?.eventId ?? "",
      transaction?.deadline ?? "",
      transaction?.remark ?? ""
    );
    try {
      const data = await api.signAttendance(
        user,
        signedAttendance,
        assignedPassword
      );
      closeWidget();
    } catch (error) {
      if (error instanceof Error) {
        setError("asasas" + error.message); // 捕获标准 Error
      } else {
        setError("An unknown error occurred"); // 捕获未知类型错误
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Transaction:", transaction);
    // Further form submission logic here
  };

  if (loading) {
    return (
      <button className="flex items-center space-x-2 text-black rounded-lg">
        <QrCodeIcon className="h-8 w-8 " />
      </button>
    ); // Display loading indicator
  }

  function refreshWindows(): void {
    window.location.reload();
  }

  return (
    <>
      <button
        onClick={openWidget}
        className="flex items-center space-x-2 text-black hover:text-blue-500 rounded-lg"
      >
        <QrCodeIcon className="h-8 w-8" />
      </button>

      {isOpenning && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="w-[90%] lg:w-1/3 bg-white rounded-lg shadow-lg">
            {!transaction ? (
              <>
                <div className="flex items-center justify-between px-6 py-6">
                  <h3 className="text-lg font-semibold">Scan the QR Code</h3>
                  <QRCodeScanner onSubmit={handleQRData} />
                </div>
                <div className="bg-blue-500 text-white text-sm text-justify py-2 px-6 rounded-b-lg">
                  You need to scan the QR code provided by lecturer for taking
                  attendance.
                </div>
              </>
            ) : (
              <>
                {error ? (
                  <button
                    onClick={refreshWindows}
                    className="flex w-full justify-center rounded-t-lg font-bold text-lg px-6 py-6 hover:bg-red-500 hover:text-white"
                  >
                    Exit and try again
                  </button>
                ) : (
                  <PasswordWidget
                    buttonText="Submit to take your attendance"
                    buttonClass="flex w-full justify-center rounded-t-lg font-bold text-lg px-6 py-6 hover:bg-blue-500 hover:text-white"
                    onSubmit={handlePasswordData}
                  />
                )}
                <form onSubmit={handleSubmit}>
                  {error ? (
                    <div className="bg-red-500 text-white text-sm text-justify py-2 px-6">
                      <div>{error}</div>
                    </div>
                  ) : (
                    <div className="bg-blue-500 text-white text-sm text-justify py-2 px-6">
                      You (<span className="font-bold">{user?.userID}</span>)
                      are going to sign the Attendance of{" "}
                      <span className="font-bold">{transaction?.eventId}</span>{" "}
                      held by{" "}
                      <span className="font-bold">
                        {transaction?.teacherId}
                      </span>{" "}
                      at{" "}
                      <span className="font-bold">{transaction?.deadline}</span>
                    </div>
                  )}
                  <div className="flex flex-col space-y-3 text-base px-6 py-6">
                    <div>
                      <div className="flex w-full items-center justify-between">
                        <div className="w-[20%]">From:</div>
                        <div className="overflow-hidden w-[70%] text-blue-500">
                          {transaction?.fromAddress}
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(transaction?.fromAddress ?? "")
                          }
                        >
                          <DocumentDuplicateIcon className="h-5 w-5 text-black hover:text-blue-500" />
                        </button>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="w-[20%]">To:</div>
                        <div className="overflow-hidden w-[70%] text-blue-500">
                          {transaction?.toAddress}
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(transaction?.toAddress ?? "")
                          }
                        >
                          <DocumentDuplicateIcon className="h-5 w-5 text-black hover:text-blue-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Example of the copy to clipboard function
const copyToClipboard = (value: string) => {
  navigator.clipboard.writeText(value).then(
    () => console.log(`${value} copied to clipboard!`),
    (err) => console.error("Failed to copy:", err)
  );
};

export default AttendanceWidget;
