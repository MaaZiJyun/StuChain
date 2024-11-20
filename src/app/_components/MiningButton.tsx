'use client';

import { useState } from 'react';
import Spinner from './Spinner';

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
      const response = await fetch('http://localhost:3001/miner/mine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Mining failed');
      }

      const data = await response.json();
      setNewBlock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mine block');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Mining Control</h3>
        <button
          onClick={handleMining}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-semibold flex items-center space-x-2
            ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? (
            <>
              <Spinner size="h-5 w-5" color="text-white" strokeWidth={2} />
              <span>Mining...</span>
            </>
          ) : (
            'Start Mining'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {newBlock && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">New Block Mined!</h4>
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
                <p className="font-mono text-sm break-all">{newBlock.previousHash}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="font-mono">{formatTimestamp(newBlock.timestamp)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="font-mono">{newBlock.transactions.length} transactions</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningButton; 