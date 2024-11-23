import { useEffect, useState } from "react";
import { UserClass } from "../_modules/UserClass";
import { PlusIcon } from "@heroicons/react/24/outline";
import { EventClass } from "../_modules/EventClass";
import PasswordWidget from "./PasswordWidget";
import API from "../_controllers/api";

interface ventFormProps {
  userInfo: UserClass;
}
const EventForm: React.FC<ventFormProps> = ({ userInfo }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const [loading, setLoading] = useState<boolean>(true);

  // Define state for each form field
  const [assignedPassword, setAssignedPassword] = useState("");
  const [eventName, setEventName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [remark, setRemark] = useState("");
  const [show, setShow] = useState("");
  const [display, setDisplay] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle change for each input field
  const handlePasswordChange = (e: any) => setAssignedPassword(e.target.value);
  const handleEventNameChange = (e: any) => setEventName(e.target.value);
  const handleDeadlineChange = (e: any) => setDeadline(e.target.value);
  const handleRemarkChange = (e: any) => setRemark(e.target.value);

  const handlePasswordSubmit = (password: string) => {
    setAssignedPassword(password);
  };

  useEffect(() => {
    if (assignedPassword) {
      console.log("Password assigned:", assignedPassword);
      createEvent();
    }
  }, [assignedPassword]);

  const changeDisplay = () => {
    setDisplay(!display);
  };

  const createEvent = async () => {
    if (user) {
      const data = await API().createTransaction(
        user,
        assignedPassword,
        eventName,
        deadline,
        remark
      );
      if (data) {
        setSuccessMessage(`Successfully Create Event ${eventName}`);
        setShow("");
        changeDisplay();
      }
    } else {
      throw new Error(`Error: Failed to add address`);
    }
  };

  return (
    <>
      {successMessage ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <div className="text-center">
              <p className="text-lg text-blue-500 mb-4">{successMessage}</p>
              <p className="text-sm text-gray-600 mb-6">
                Event will be published after mining process
              </p>
              <button
                onClick={() => setSuccessMessage("")}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-base w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="flex w-full text-black justify-between items-center"
          onClick={changeDisplay}
        >
          <h1 className="text-2xl font-bold">Created Events</h1>
          <div className="flex hover:text-blue-500">
            <PlusIcon className="h-6 w-6 mr-2" />
            <span>Create a new Event</span>
          </div>
        </button>
      )}

      {display && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="w-full lg:w-1/3 bg-white p-5 rounded-lg shadow-lg">
            <div id="transactionForm" className="w-full py-6 space-y-6">
              {/* Event Name Field */}
              <div className="flex flex-col">
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  required
                  value={eventName}
                  onChange={handleEventNameChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the event name"
                />
              </div>

              {/* Deadline Field */}
              <div className="flex flex-col">
                <input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
                  value={deadline}
                  onChange={handleDeadlineChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Remark Field */}
              <div className="flex flex-col">
                <textarea
                  id="remark"
                  name="remark"
                  value={remark}
                  onChange={handleRemarkChange}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a remark (optional)"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex">
                <PasswordWidget
                  buttonText="Create Event"
                  buttonClass="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-4"
                  onSubmit={handlePasswordSubmit}
                />
                <button
                  type="button"
                  onClick={changeDisplay}
                  className="w-full bg-gray-500 text-white font-medium py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default EventForm;
