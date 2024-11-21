"use client";
import { useEffect, useState } from "react";
import { UserClass } from "../_modules/UserClass";
import AttendanceWidget from "./AttendanceWidget";
import {
  MagnifyingGlassIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

interface SearchBarProps {
  userInfo: UserClass;
  onSubmit: (con: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ userInfo, onSubmit }) => {
  const [user, setUser] = useState<UserClass>(userInfo);
  const isStudent = user.userID.startsWith("S");

  const [eventId, setEventId] = useState<string>("");
  const [lecturerId, setLecturerId] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const con = {
      eventId: eventId,
      lecturerId: lecturerId,
      dateTime: dateTime,
    };
    onSubmit(JSON.stringify(con));
  };

  const handleSubmitEmpty = (e: React.FormEvent) => {
    e.preventDefault();
    setEventId("");
    setLecturerId("");
    setDateTime("");
    const con = {
      eventId: "",
      lecturerId: "",
      dateTime: "",
    };
    onSubmit(JSON.stringify(con));
  };

  const handleEventIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredEventId = e.target.value;
    setEventId(enteredEventId);
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
        {isStudent && <AttendanceWidget />}
        <input
          type="text"
          placeholder="Event ID"
          value={eventId}
          onChange={handleEventIdChange}
          className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
        />

        {isStudent && (
          <input
            type="text"
            placeholder="Lecturer ID"
            value={lecturerId}
            onChange={handleLecturerIdChange}
            className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
          />
        )}

        <input
          type="date"
          value={dateTime}
          onChange={handleDateTimeChange}
          className="w-full p-1 border-b-2 text-black border-black mx-2 focus:outline-none focus:border-blue-500"
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
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
