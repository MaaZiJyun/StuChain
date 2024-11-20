"use client";
// components/QRCodeScanner.tsx
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { TransactionClass } from "../_modules/TransactionClass";
import { ViewfinderCircleIcon } from "@heroicons/react/24/outline";

interface ScanWidgetProps {
  onSubmit: (code: string) => void;
}

const QRCodeScanner: React.FC<ScanWidgetProps> = ({ onSubmit }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");

  // Toggle scanning state
  const openWidget = () => {
    setIsScanning(true);
  };

  const closeWidget = () => {
    setIsScanning(false);
    setQrCodeData("");
  };

  useEffect(() => {
    onSubmit(qrCodeData);
    closeWidget();
  }, [qrCodeData]);

  return (
    <>
      <button
        onClick={openWidget}
        className="flex items-center space-x-2 border border-black rounded-lg py-2 px-3 hover:bg-gray-100"
      >
        <ViewfinderCircleIcon className="h-5 w-5" />
        <span>Scan</span>
      </button>

      {isScanning && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Please scan the QR Code in the frame
            </h2>
            <div className="flex">
              <div
                style={{
                  position: "relative",
                  width: "300px",
                  height: "300px",
                  margin: "20px auto",
                }}
              >
                <Scanner
                  onScan={function (code: IDetectedBarcode[]): void {
                    try {
                      const toJson = JSON.parse(code.at(0)?.rawValue ?? "");
                      const toString = JSON.stringify(toJson);
                      setQrCodeData(toString);
                      console.log(toString);
                      setIsScanning(false);
                    } catch (error) {
                      console.log(code);
                    }
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={closeWidget}
                className="px-3 py-1 mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default QRCodeScanner;
