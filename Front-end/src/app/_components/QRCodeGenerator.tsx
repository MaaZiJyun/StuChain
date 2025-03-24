"use client";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import RealTimeClock from "./RealTimeClock";

interface QRCodeWidgetProps {
  buttonClass: string;
  qrCodeData: string;
}

const QRCodeGenerator: React.FC<QRCodeWidgetProps> = ({
  buttonClass,
  qrCodeData,
}) => {
  const [qrCodeUrl, setQRCodeUrl] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    generateQRCode(qrCodeData);
  }, []);

  const generateQRCode = async (data: string) => {
    try {
      const qrCode = await QRCode.toDataURL(data);
      setQRCodeUrl(qrCode);
    } catch (error) {
      console.error("Error generating QR Code:", error);
    }
  };

  const openWidget = () => {
    setIsVisible(true);
  };
  const closeWidget = () => {
    setIsVisible(false);
  };

  return (
    <>
      <button onClick={openWidget} className={`${buttonClass}`}>
        <QrCodeIcon className="h-7 w-7" />
      </button>

      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {qrCodeUrl && (
              <div className="flex flex-col w-80 items-center justify-center">
                <h2 className="text-base font-semibold">
                  Scan the QR Code for taking Attendance
                </h2>
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                <RealTimeClock />
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" onClick={closeWidget} className="">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeGenerator;
