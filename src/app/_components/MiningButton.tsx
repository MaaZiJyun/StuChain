"use client";

import { useState } from "react";
import Spinner from "./Spinner";
import DTFormator from "../_controllers/DateTimeFormator";
import { WrenchIcon } from "@heroicons/react/24/outline";

interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: any[];
  nonce: number;
}

const MiningButton = () => {
  const [loading, setLoading] = useState(false);
  const [newBlock, setNewBlock] = useState<Block | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMining = async () => {
    setLoading(true);
    setError(null);
    setNewBlock(null);

    try {
      const response = await fetch("http://localhost:3001/miner/mine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Mining failed");
      }

      const data = await response.json();
      setNewBlock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mine block");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black rounded-lg mb-6">
      <button
        onClick={handleMining}
        disabled={loading}
        className={`flex w-full px-6 py-2 rounded-lg text-white items-center justify-center
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
      >
        <div className="flex items-center justify-between">
          {loading ? (
            <>
              <Spinner size="h-5 w-5 mr-2" color="text-white" strokeWidth={2} />
              <span>Mining...</span>
            </>
          ) : (
            <>
              <WrenchIcon className="h-5 w-5 mr-2" />
              <span>Start Mining</span>
            </>
          )}
        </div>
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {newBlock && (
        <div className="">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Block Index</p>
                <p className="font-mono">{newBlock.index}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nonce</p>
                <p className="font-mono">{newBlock.nonce}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Hash</p>
                <p className="font-mono text-sm break-all">{newBlock.hash}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Previous Hash</p>
                <p className="font-mono text-sm break-all">
                  {newBlock.previousHash}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="font-mono">
                  {DTFormator.formatTimestamp(newBlock.timestamp).toString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="font-mono">
                  {newBlock.transactions.length} transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningButton;
