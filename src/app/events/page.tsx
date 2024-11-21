"use client";
import { useEffect, useState } from "react";
import Spinner from "../_components/Spinner";
import withAuth from "../_components/WithAuth";
import { UserClass } from "../_modules/UserClass";
import LocalStorage from "../_controllers/LocalStorage";

const page = () => {
  const [user, setUser] = useState<UserClass>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);

  // Define state for each form field
  const [password, setPassword] = useState("");
  const [eventName, setEventName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [remark, setRemark] = useState("");
  const [show, setShow] = useState("");

  // Handle change for each input field
  const handlePasswordChange = (e: any) => setPassword(e.target.value);
  const handleEventNameChange = (e: any) => setEventName(e.target.value);
  const handleDeadlineChange = (e: any) => setDeadline(e.target.value);
  const handleRemarkChange = (e: any) => setRemark(e.target.value);

  useEffect(() => {
    const data = LocalStorage().getAttribute("user");
    const userString = JSON.stringify(data);
    const userInstance = UserClass.fromStorage(userString);
    if (userInstance) {
      setUser(userInstance);

      // test
      if (user) {
        setIsStudent(user.userID.startsWith("S"));
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const onSubmit = async () => {
    // Pass the form data to the submit handler
    setLoading(true);
    const data = await handleSubmit(password, eventName, deadline, remark);
    setShow(data);
    setLoading(false);
  };

  const handleSubmit = async (
    password: string,
    eventId: string,
    deadline: string,
    remark: string
  ) => {
    // 创建请求体
    const fromAddress = user?.address;
    const toAddress = user?.address;
    const walletId = user?.walletId;
    const teacherId = user?.userID;
    const stuId = "";
    const amount = 0;
    const changeAddress = user?.address;
    const transactionPayload = {
      fromAddress,
      toAddress,
      amount,
      changeAddress,
      stuId,
      teacherId,
      eventId,
      deadline,
      remark,
    };
    
    console.log("submit:" + JSON.stringify(transactionPayload));
    // 发送 POST 请求

    const response = await fetch(
      `http://localhost:3001/operator/wallets/${walletId}/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          password, // 将密码放在请求头中
        },
        body: JSON.stringify(transactionPayload),
      }
    );

    // 检查响应
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message}`);
    }

    return response.json(); // 返回响应数据
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-blue-500">
        <Spinner size="h-20 w-20" color="text-white" strokeWidth={2} />
      </div>
    ); // Display loading indicator
  } else
    return (
      <>
        <div>
          <h1>Create Transaction</h1>
          <form id="transactionForm" onSubmit={onSubmit}>
            {/* Password Field */}
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={handlePasswordChange}
              />
              <br />
              <br />
            </div>

            {/* Event Name Field */}
            <div>
              <label htmlFor="eventName">Event Name:</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                required
                value={eventName}
                onChange={handleEventNameChange}
              />
              <br />
              <br />
            </div>

            {/* Deadline Field */}
            <div>
              <label htmlFor="deadline">Deadline:</label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                required
                value={deadline}
                onChange={handleDeadlineChange}
              />
              <br />
              <br />
            </div>

            {/* Remark Field */}
            <div>
              <label htmlFor="remark">Remark (Optional):</label>
              <textarea
                id="remark"
                name="remark"
                value={remark}
                onChange={handleRemarkChange}
              ></textarea>
              <br />
              <br />
            </div>

            {/* Submit Button */}
            <button type="button" onClick={onSubmit}>
              Create Transaction
            </button>
          </form>

          <div id="result"></div>
        </div>
      </>
    );
};

export default withAuth(page);
