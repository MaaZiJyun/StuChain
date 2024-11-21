"use client";

import { useEffect, useState } from "react";
import API from "../_controllers/api";
import BlockList from "./BlockList";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlockchainInfo();
  }, []);

  const fetchBlockchainInfo = async () => {
    try {
      const data = await API().fetchBlockchainInfo();
      setBlocks(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching blockchain info:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
  } else return <div>{blocks.length > 0 && <BlockList blocks={blocks} />}</div>;
};

export default BlockchainInfo;
