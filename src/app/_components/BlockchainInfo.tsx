'use client';

import { useState } from 'react';
import API from '../_controllers/api';

interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: string;
  hash: string;
  data: {
    inputs: any[];
    outputs: any[];
  };
}

const BlockchainInfo = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const fetchBlockchainInfo = async () => {
    try {
      const response = await fetch('http://localhost:3001/blockchain/blocks');
      const data = await response.json();
      setBlocks(data);
      setIsVisible(true);
    } catch (error) {
      console.error('Error fetching blockchain info:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="mt-4">
      <button
        onClick={fetchBlockchainInfo}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        View Blockchain Info
      </button>

      {isVisible && blocks.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="text-xl font-bold mb-4">Blockchain Information</h3>
          <div className="space-y-4">
            {blocks.map((block) => (
              <div key={block.hash} className="border p-4 rounded">
                <h4 className="font-bold">Block #{block.index}</h4>
                <p className="text-sm">
                  <span className="font-semibold">Hash:</span> {block.hash}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Previous Hash:</span> {block.previousHash}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Timestamp:</span> {formatTimestamp(block.timestamp)}
                </p>
                <div className="mt-2">
                  <p className="font-semibold">Transactions ({block.transactions.length}):</p>
                  {block.transactions.map((tx) => (
                    <div key={tx.id} className="ml-4 mt-1 text-sm">
                      <p>ID: {tx.id}</p>
                      <p>Type: {tx.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainInfo; 