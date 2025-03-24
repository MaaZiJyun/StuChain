import React, { useState } from "react";

interface PasswordWidgetProps {
  onSubmit: (password: string) => void;
  buttonText: string; // Define the expected prop type
  buttonClass: string; // Define the expected prop type
}

// PasswordWidget Component as a reusable component
const PasswordWidget: React.FC<PasswordWidgetProps> = ({
  buttonText,
  buttonClass,
  onSubmit,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessageOnPwd, setErrorMessageOnPwd] = useState("");

  const openWidget = () => {
    setIsVisible(true);
  };

  const closeWidget = () => {
    setIsVisible(false);
    setPassword(""); // Clear password when closing
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(password);
    closeWidget();
  };

  return (
    <>
      <button onClick={openWidget} className={`${buttonClass}`}>
        {buttonText}
      </button>

      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Please input your password for authentication
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                required
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="border p-2 rounded w-full"
                placeholder="Password"
              />
              {errorMessageOnPwd && (
                <p className="mt-1 text-red-500 text-sm">{errorMessageOnPwd}</p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeWidget}
                  className="px-3 py-1 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={errorMessageOnPwd !== ""}
                  className={`px-3 py-1 ${
                    errorMessageOnPwd !== ""
                      ? "bg-gray-200"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white rounded`}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PasswordWidget;
