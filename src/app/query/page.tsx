"use client";
import WithAuth from "../_components/WithAuth";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import LocalStorage from "../_controllers/LocalStorage";
import Spinner from "../_components/Spinner";
import { UserClass } from "../_modules/UserClass";
import DTFormator from "../_controllers/DateTimeFormator";

interface AttendanceRecord {
  eventId: string;
  stuId: string;
  timestamp: number;
}

const QueryPage = () => {
  const [user, setUser] = useState<UserClass>();
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);

  // 筛选条件
  const [filters, setFilters] = useState({
    studentId: "",
    eventId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const data = LocalStorage().getAttribute("user");
    const userString = JSON.stringify(data);
    const userInstance = UserClass.fromStorage(userString);
    if (userInstance) {
      if (!userInstance.userID.startsWith("L")) {
        window.location.href = "/dashboard";
      }
      setUser(userInstance);
      setLoading(false);
    }
  }, []);

  // 处理筛选条件变化
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFilters({
      ...filters,
      [field]: e.target.value,
    });
  };

  // 获取区块链数据并应用筛选
  const fetchAndFilterRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/blockchain/blocks");
      const blocks = await response.json();

      const attendanceRecords: AttendanceRecord[] = [];

      blocks.forEach((block: any) => {
        block.transactions.forEach((transaction: any) => {
          if (
            transaction.teacherId === user?.userID &&
            !transaction.eventId.endsWith("-create")
          ) {
            attendanceRecords.push({
              eventId: transaction.eventId,
              stuId: transaction.stuId,
              timestamp: transaction.timestamp,
            });
          }
        });
      });

      // 应用筛选条件
      let filtered = [...attendanceRecords];

      if (filters.studentId) {
        filtered = filtered.filter((record) =>
          record.stuId.toLowerCase().includes(filters.studentId.toLowerCase())
        );
      }

      if (filters.eventId) {
        filtered = filtered.filter((record) =>
          record.eventId.toLowerCase().includes(filters.eventId.toLowerCase())
        );
      }

      // 添加时间范围筛选
      if (filters.startDate) {
        const startTimestamp = new Date(filters.startDate).getTime() / 1000;
        filtered = filtered.filter((record) => record.timestamp >= startTimestamp);
      }

      if (filters.endDate) {
        const endTimestamp = new Date(filters.endDate).getTime() / 1000;
        filtered = filtered.filter((record) => record.timestamp <= endTimestamp);
      }

      setRecords(attendanceRecords);
      setFilteredRecords(filtered);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      studentId: "",
      eventId: "",
      startDate: "",
      endDate: "",
    });
    setFilteredRecords(records);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-blue-500">
        <Spinner size="h-20 w-20" color="text-white" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="h-screen lg:flex bg-blue-600">
      {user && <Navbar userInfo={user} />}
      <main className="overflow-y-auto w-full lg:flex-grow p-6 bg-gray-100 lg:rounded-l-xl lg:my-3 shadow-md">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Query Attendance Records</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={filters.studentId}
                onChange={(e) => handleFilterChange(e, "studentId")}
                className="w-full p-2 border rounded-md"
                placeholder="Enter student ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event ID
              </label>
              <input
                type="text"
                value={filters.eventId}
                onChange={(e) => handleFilterChange(e, "eventId")}
                className="w-full p-2 border rounded-md"
                placeholder="Enter event ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange(e, "startDate")}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={filters.endDate}
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

        {/* Results Table */}
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, index) => {
                  let formattedTime;
                  try {
                    formattedTime = DTFormator.formatTimestamp(record.timestamp).toString();
                  } catch (err) {
                    formattedTime = new Date(record.timestamp * 1000).toLocaleString();
                  }

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{index}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.eventId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.stuId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formattedTime}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WithAuth(QueryPage); 