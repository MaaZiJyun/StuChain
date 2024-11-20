"use client"
// components/TransactionForm.tsx
import React, { useState } from "react";

const page = () => {
  const [formData, setFormData] = useState({
    walletId: "",
    password: "",
    fromAddress: "",
    toAddress: "",
    changeAddress: "",
    eventName: "",
    deadline: "",
    remark: "",
  });
  const [result, setResult] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      walletId,
      password,
      fromAddress,
      toAddress,
      changeAddress,
      eventName,
      deadline,
      remark,
    } = formData;
    const amount = 0;
    const stuId = "";
    const teacherId = "testid";

    if (
      !walletId ||
      !password ||
      !fromAddress ||
      !toAddress ||
      !changeAddress ||
      !eventName ||
      !deadline
    ) {
      alert("Please fill out all required fields!");
      return;
    }

    try {
      const transactionResult = await createTransaction(
        walletId,
        password,
        fromAddress,
        toAddress,
        amount,
        changeAddress,
        stuId,
        teacherId,
        `${eventName}-create`,
        deadline,
        remark || null
      );
      setResult(`Transaction Created Successfully:
${JSON.stringify(transactionResult, null, 2)}`);
    } catch (error) {
      setResult(
        `Failed to create transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Detailed Error:", error);
    }
  };

  return (
    <div>
      <h1>Create Transaction</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="walletId">Wallet ID:</label>
        <input
          type="text"
          id="walletId"
          name="walletId"
          value={formData.walletId}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="fromAddress">From Address:</label>
        <input
          type="text"
          id="fromAddress"
          name="fromAddress"
          value={formData.fromAddress}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="toAddress">To Address:</label>
        <input
          type="text"
          id="toAddress"
          name="toAddress"
          value={formData.toAddress}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="changeAddress">Change Address:</label>
        <input
          type="text"
          id="changeAddress"
          name="changeAddress"
          value={formData.changeAddress}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="eventName">Event Name:</label>
        <input
          type="text"
          id="eventName"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="deadline">Deadline:</label>
        <input
          type="datetime-local"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <label htmlFor="remark">Remark (Optional):</label>
        <textarea
          id="remark"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
        ></textarea>
        <br />
        <br />

        <button type="submit">Create Transaction</button>
      </form>

      {result && (
        <div id="result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

// Define the createTransaction function
async function createTransaction(
  walletId: string,
  password: string,
  fromAddress: string,
  toAddress: string,
  amount: number,
  changeAddress: string,
  stuId: string,
  teacherId: string,
  eventId: string,
  deadline: string,
  remark: string | null
) {
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

  const response = await fetch(
    `http://localhost:3001/operator/wallets/${walletId}/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        password,
      },
      body: JSON.stringify(transactionPayload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error: ${response.status} - ${errorData.message}`);
  }

  return response.json();
}

export default page;
