"use client";
import { useState } from "react";
import API from "../_controllers/api";
import LocalStorage from "../_controllers/LocalStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "../_components/Spinner";
import { UserClass } from "../_modules/UserClass";
import withOutAuth from "../_components/WithOutAuth";

const page = () => {
  const router = useRouter();
  const api = API();

  const [role, setRole] = useState("S");
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessageOnUserID, setErrorMessageOnUserID] = useState("");
  const [errorMessageOnPwd, setErrorMessageOnPwd] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const buttonCheck = () => {
    return (
      userID === "" ||
      password === "" ||
      errorMessageOnUserID !== "" ||
      errorMessageOnPwd !== ""
    );
  };

  const signIn = async () => {
    try {
      setLoading(true);
      const newUser = new UserClass("", role + userID, "");
      // Call API function getAllWallets
      const user = await api.verificationAuth(newUser.userID, password);
      if (user !== null) {
        // 假设登录成功后返回用户数据，存储用户ID
        const result = await LocalStorage().setAttribute("user", user.toJSON());
        if (result) {
          // 登录成功后，重定向到主页
          setLoading(false);
          router.push("/dashboard");
        }else{
          console.log("localstorage storing error");
        }
      }else{
        console.log("verification Auth error");
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessageOnUserID(`${error.message}`);
      } else {
        setErrorMessageOnUserID("An unexpected error occurred");
      }
      setLoading(false);
    }
  };

  const handleUserIDEdit = async (e: any) => {
    const enteredUserID = e.target.value;
    setUserID(enteredUserID);

    // Regular expression to test if the input contains only numbers
    if (!/^\d*$/.test(enteredUserID)) {
      setErrorMessageOnUserID("Please enter a valid number"); // Show error if invalid
    } else {
      if (enteredUserID.length <= 3) {
        setErrorMessageOnUserID("Please enter 4 digits numbers");
      } else {
        setErrorMessageOnUserID(""); // Clear error message if no duplicate
      }
    }
  };

  const handlePasswordEdit = (e: any) => {
    const enteredPassword = e.target.value;
    setPassword(enteredPassword);
    const words = enteredPassword.trim().split(/\s+/);
    if (words.length <= 4) {
      setErrorMessageOnPwd("Password must contain more than 4 words");
      console.log(`${words} is not available`);
    } else {
      setErrorMessageOnPwd("");
      console.log(`${words} is available`);
    }
  };

  const handleRoleEdit = (newRole: any) => {
    setRole(newRole);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="w-[90%] lg:w-1/3 p-12 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl text-black mb-2 font-bold text-center">
          Sign in
        </h1>

        <h2 className="text-base text-black mb-8 text-center">
          to continue to sign attendance
        </h2>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={role === "S"}
            onChange={() => handleRoleEdit("S")}
            className="mr-1"
          />
          <label className="mr-4 text-black text-sm">Student</label>
          <input
            type="checkbox"
            checked={role === "L"}
            onChange={() => handleRoleEdit("L")}
            className="mr-1"
          />
          <label className="text-black text-sm">Lecturer</label>
        </div>

        <div className="mb-4">
          <label htmlFor="userID" className="block text-gray-500 text-sm mb-1">
            User ID
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="readOnlyField"
              value={role}
              readOnly
              className="w-7 p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            />
            <input
              type="text"
              id="userID"
              value={userID}
              onChange={handleUserIDEdit}
              // onChange={(e) => setUserID(e.target.value)} // Update state on change
              placeholder="Enter your NetID"
              className={`w-full p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring ${
                errorMessageOnUserID
                  ? "focus:ring-red-400"
                  : "focus:ring-blue-400"
              }`}
              required
            />
          </div>
          {errorMessageOnUserID && (
            <p className="mt-1 text-red-500 text-sm">{errorMessageOnUserID}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-500 text-sm mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            // onChange={(e) => setPassword(e.target.value)} // Update state on change
            onChange={handlePasswordEdit}
            placeholder="Enter your NetPassword"
            className={`w-full p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring ${
              errorMessageOnPwd ? "focus:ring-red-400" : "focus:ring-blue-400"
            }`}
            required
          />
          {errorMessageOnPwd && (
            <p className="mt-1 text-red-500 text-sm">{errorMessageOnPwd}</p>
          )}
        </div>

        {loading ? (
          <Spinner size="h-12 w-12" color="text-blue-500" strokeWidth={2} />
        ) : (
          <button
            type="button"
            onClick={signIn}
            disabled={buttonCheck()}
            className={`w-full mt-4 py-2 ${
              buttonCheck() ? "bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
            } text-white font-bold rounded transition duration-200`}
          >
            Sign in
          </button>
        )}

        <div className="flex justify-center mt-2 text-sm space-x-2">
          <p className="text-gray-500">I have no any account.</p>
          <Link href="/register">
            <p className="text-blue-500 hover:underline">Sign up</p>
          </Link>
        </div>
      </form>
    </div>
  );
};
export default withOutAuth(page);
