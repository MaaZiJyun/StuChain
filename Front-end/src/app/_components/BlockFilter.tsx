"use client";

import { useState } from "react";
import Spinner from "./Spinner";

interface Block {
  index: number;
  nonce: number;
  previousHash: string;
  hash: string;
  timestamp: number;
}

const BlockFilter = () => {
  const [index, setIndex] = useState<string>("");
  const [nonce, setNonce] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/blockchain/blocks");
      const allBlocks = await response.json();

      // Filter blocks based on input criteria
      let filteredBlocks = allBlocks.filter((block: Block) => {
        let matchesIndex = true;
        let matchesNonce = true;
        let matchesTimestamp = true;

        if (index !== "") {
          matchesIndex = block.index === parseInt(index);
        }
        if (nonce !== "") {
          matchesNonce = block.nonce === parseInt(nonce);
        }
        if (timestamp !== "") {
          // Convert timestamp to date format for comparison
          const blockDate = new Date(block.timestamp * 1000)
            .toISOString()
            .split("T")[0];
          matchesTimestamp = blockDate === timestamp;
        }

        return matchesIndex && matchesNonce && matchesTimestamp;
      });

      setBlocks(filteredBlocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlocks();
  };

  const handleReset = () => {
    setIndex("");
    setNonce("");
    setTimestamp("");
    fetchBlocks();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Block Filter</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block Index
            </label>
            <input
              type="number"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter block index"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nonce
            </label>
            <input
              type="number"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter nonce"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="mt-4 flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="h-8 w-8" color="text-blue-500" strokeWidth={2} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blocks.map((block) => (
                <tr key={block.hash}>
                  <td className="px-6 py-4 whitespace-nowrap">{block.index}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{block.nonce}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="truncate max-w-xs" title={block.previousHash}>
                      {block.previousHash}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="truncate max-w-xs" title={block.hash}>
                      {block.hash}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatTimestamp(block.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlockFilter; 