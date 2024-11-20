import React, { useState } from "react";
import DTFormator from "../_controllers/DateTimeFormator";

interface Transaction {
  id: string;
  type: string;
  hash: string;
  data: {
    inputs: any[];
    outputs: any[];
  };
}

interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
}

interface BlockListProp {
  blocks: Block[];
}

const BlockList: React.FC<BlockListProp> = ({ blocks }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Define how many blocks to show per page

  // Calculate total pages
  const totalPages = Math.ceil(blocks.length / itemsPerPage);

  // Get current blocks
  const indexOfLastBlock = currentPage * itemsPerPage;
  const indexOfFirstBlock = indexOfLastBlock - itemsPerPage;
  const currentBlocks = blocks.slice(indexOfFirstBlock, indexOfLastBlock);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      {blocks.length > 0 && (
        <div>
          <div className="space-y-4">
            {currentBlocks.map((block) => (
              <div key={block.hash} className="bg-white text-black shadow-md rounded-lg p-6 mb-6">
                <h4 className="font-bold">Block {block.index}</h4>
                <p className=" break-words">
                  <span className="font-semibold">Hash:</span> {block.hash}
                </p>
                <p className="break-words">
                  <span className="font-semibold">Previous Hash:</span>{" "}
                  {block.previousHash}
                </p>
                <p>
                  <span className="font-semibold">Timestamp:</span>{" "}
                  {DTFormator.formatTimestamp(block.timestamp).toString()}
                </p>
                <div className="mt-2">
                  <p className="font-semibold">
                    Transactions ({block.transactions.length}):
                  </p>
                  {block.transactions.map((tx) => (
                    <div key={tx.id} className="ml-4 mt-1">
                      <p className=" break-words">ID: {tx.id}</p>
                      <p>Type: {tx.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center bg-white text-black shadow-md rounded-lg py-2 mt-6">
            <div className="flex lg:w-1/2 justify-between">
              {/* Previous Page Button */}
              {currentPage > 1 ? (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="mx-1 px-2 py-1 text-blue-500"
                >
                  Prev
                </button>
              ) : (
                <button className="mx-1 px-2 py-1 text-gray-500">Prev</button>
              )}

              <div className="flex justify-center">
                {/* First Page Button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="mx-1 px-2 py-1  text-blue-500"
                  >
                    1
                  </button>
                )}

                {currentPage > 3 && (
                  <button className="mx-1 px-2 py-1 text-gray-500">...</button>
                )}

                {/* Current Page Button */}
                <button className="mx-1 px-2 py-1 border rounded-xl bg-blue-500 text-white">
                  {currentPage}
                </button>

                {currentPage < totalPages - 2 && (
                  <button className="mx-1 px-2 py-1 text-gray-500">...</button>
                )}

                {/* Last Page Button */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="mx-1 px-2 py-1  text-blue-500"
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              {/* next Page Button */}
              {currentPage < totalPages ? (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="mx-1 px-2 py-1 text-blue-500"
                >
                  Next
                </button>
              ) : (
                <button className="mx-1 px-2 py-1 text-gray-500">Prev</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockList;
