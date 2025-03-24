"use client";
import React, { useState } from "react";

// Dummy product data
const dummyProducts = [
  {
    name: "Laptop",
    price: 999.99,
    image:
      "/images/laptop.png",
  },
  {
    name: "Smartphone",
    price: 799.49,
    image:
      "/images/smartphone.png",
  },
  {
    name: "Headphones",
    price: 199.99,
    image:
      "/images/headphone.png",
  },
  {
    name: "Pen",
    price: 29.99,
    image:
      "/images/pen.png",
  },
  {
    name: "Smartwatch",
    price: 249.99,
    image:
      "/images/smartwatch.png",
  },
  {
    name: "Tablet",
    price: 499.99,
    image:
      "/images/tablet.png",
  },
];

const ProductWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBuy = (product: any) => {
    setIsModalOpen(true);
    // Implement cart logic here, maybe adding the product to a state or sending to API
  };
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  return (
    <div className="w-full bg-white shadow-md text-black rounded-lg mb-6 p-6">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
            {/* Modal Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Not Fully Implemented! 😂
            </h2>

            {/* Modal Content */}
            <p className="text-gray-700 mb-6">
              Unfortunately, this function is not fully implemented because it
              wasn't part of the requirement specifications.
              <br />
              <span className="font-bold text-blue-500">
                If you'd like to see more features,
              </span>{" "}
              feel free to contact our team. We promise,{" "}
              <span className="text-green-600">the price will be good!</span> 😉
            </p>

            {/* Close Button */}
            <button
              className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition duration-150"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Exchanging Products
      </h3>
      <div className="flex space-x-4 overflow-x-scroll scrollbar-hide pb-4">
        {dummyProducts.map((product, index) => (
          <div
            key={index}
            className="min-w-[200px] max-w-[200px] bg-white shadow-md rounded-lg p-4 flex-shrink-0"
          >
            {/* Product Image */}
            <img
              src={product.image}
              alt={product.name}
              className="h-32 w-full object-cover rounded-md"
            />

            {/* Product Name */}
            <h4 className="text-lg font-semibold text-gray-700 mt-2">
              {product.name}
            </h4>

            {/* Product Price */}
            <p className="text-md font-medium text-green-600">
              ${product.price.toFixed(2)}
            </p>

            {/* Buy Button */}
            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-150"
              onClick={() => handleBuy(product)}
            >
              Exchange
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductWidget;
