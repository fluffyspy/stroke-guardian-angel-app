
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Download } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { SensorReading, createAndDownloadCSV } from "./balanceUtils";
import { toast } from 'sonner';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

interface ResultScreenProps {
  result: StrokeDetectionResult | null;
  rawSensorData: SensorReading[];
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  rawSensorData
}) => {
  const [showSensorReadings, setShowSensorReadings] = useState(false);
  
  // Create a CSV file from sensor data and save to mobile storage
  const downloadSensorData = async () => {
    if (rawSensorData.length === 0) {
      toast.error("No sensor data available to download");
      return;
    }
    
    try {
      const csv = createAndDownloadCSV(rawSensorData);
      const fileName = `balance-test-data-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
      
      if (Capacitor.isNativePlatform()) {
        // For mobile devices, save to Documents directory
        await Filesystem.writeFile({
          path: fileName,
          data: csv,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        
        toast.success(`CSV file saved to Documents folder as: ${fileName}`);
        console.log(`File saved to Documents: ${fileName}`);
      } else {
        // For web, use traditional download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("CSV file downloaded to Downloads folder");
      }
    } catch (error) {
      console.error("Error saving CSV file:", error);
      toast.error("Failed to save CSV file. Please try again.");
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="text-center p-6 bg-background rounded-lg shadow-lg text-foreground max-w-md w-full">
        {result?.result === 'normal' ? (
          <div>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2">Balance Test Passed</h3>
            <p>Your balance appears normal.</p>
            {result?.details && (
              <div className="mt-2 text-sm text-left overflow-y-auto max-h-36">
                {result.details.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">{line}</p>
                ))}
              </div>
            )}
          </div>
        ) : result?.result === 'abnormal' ? (
          <div>
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Balance Concerns Detected</h3>
            <p>The test indicates potential balance issues.</p>
            {result?.details && (
              <div className="mt-2 text-sm text-left overflow-y-auto max-h-36">
                {result.details.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">{line}</p>
                ))}
              </div>
            )}
            <p className="mt-4 text-red-500 font-medium">
              Please consider seeking medical attention.
            </p>
          </div>
        ) : (
          <div>
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">Test Inconclusive</h3>
            <p>Not enough data was collected to make a determination.</p>
            {result?.details && (
              <div className="mt-2 text-sm text-left overflow-y-auto max-h-36">
                {result.details.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">{line}</p>
                ))}
              </div>
            )}
            <p className="mt-4">
              Please try again and ensure the phone can detect your movement.
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center" 
            onClick={() => setShowSensorReadings(!showSensorReadings)}
          >
            {showSensorReadings ? "Hide Raw Sensor Data" : "Show Raw Sensor Data"}
          </Button>
          
          {showSensorReadings && (
            <div className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-y-auto max-h-40 text-left">
              <h4 className="font-medium mb-1">Sample of collected data:</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {rawSensorData.slice(-10).map((reading, idx) => (
                  <div key={idx} className="bg-white p-1 rounded">
                    <div>Accel: {reading.acceleration.magnitude.toFixed(2)} m/s²</div>
                    <div>Rotation: {reading.orientation.magnitude.toFixed(2)}°</div>
                    {reading.gyroscope && (
                      <div>Gyro: {reading.gyroscope.magnitude.toFixed(2)} rad/s</div>
                    )}
                    {reading.magnetometer && (
                      <div>Magneto: {reading.magnetometer.magnitude.toFixed(2)} units</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Button 
                  size="sm"
                  variant="secondary" 
                  className="w-full flex items-center justify-center"
                  onClick={downloadSensorData}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save to Mobile Storage (CSV)
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  File will be saved to Documents folder on your device
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
