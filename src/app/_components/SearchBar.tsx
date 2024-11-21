"use client";
import { useEffect, useState } from "react";
import { UserClass } from "../_modules/UserClass";
import AttendanceWidget from "./AttendanceWidget";
import {
  MagnifyingGlassIcon,
  ArrowUturnLeftIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

interface SearchBarProps {
  userInfo: UserClass;
  onSubmit: (con: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ userInfo, onSubmit }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const isStudent = user.userID.startsWith("S");

  const [eventId, setEventId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [lecturerId, setLecturerId] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const con = {
      eventId: eventId,
      studentId: studentId,
      lecturerId: lecturerId,
      dateTime: dateTime,
    };
    onSubmit(JSON.stringify(con));
  };

  const handleSubmitEmpty = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setEventId("");
    setStudentId("");
    setLecturerId("");
    setDateTime("");
    const con = {
      eventId: "",
      studentId: "",
      lecturerId: "",
      dateTime: "",
    };
    onSubmit(JSON.stringify(con));
  };

  // Handlers for input changes
  const handleEventIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredEventId = e.target.value;
    setEventId(enteredEventId);
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredStudentId = e.target.value;
    setStudentId(enteredStudentId);
  };

  const handleLecturerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredLecturerId = e.target.value;
    setLecturerId(enteredLecturerId);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredDateTime = e.target.value;
    setDateTime(enteredDateTime);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-center items-center bg-white p-4 rounded-lg shadow-md">
        {isStudent && <AttendanceWidget userInfo={user} />}
        <input
          type="text"
          placeholder="Event ID"
          value={eventId}
          onChange={handleEventIdChange}
          className="w-full p-1 border rounded-md m-2"
        />

        {isStudent ? (
          <input
            type="text"
            placeholder="Lecturer ID"
            value={lecturerId}
            onChange={handleLecturerIdChange}
            className="w-full p-1 border rounded-md m-2"
          />
        ) : (
          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={handleStudentIdChange}
            className="w-full p-1 border rounded-md m-2"
          />
        )}

        <input
          type="date"
          value={dateTime}
          onChange={handleDateTimeChange}
          className="w-full p-1 border rounded-md m-2"
        />

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-1 py-1 rounded-md hover:bg-blue-600"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleSubmitEmpty}
            className="bg-gray-500 text-white px-1 py-1 rounded-md hover:bg-gray-600"
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </button>
          {/* <button
            type="button"
            className="bg-red-500 text-white px-1 py-1 rounded-md hover:bg-red-600"
          >
            <FlagIcon className="h-6 w-6" />
          </button> */}
        </div>

        {/* <div className="text-black rounded-lg">
          <select>
            <option>by User ID</option>
            <option>by Address</option>
          </select>
        </div> */}
      </div>
    </div>
  );
};

export default SearchBar;
