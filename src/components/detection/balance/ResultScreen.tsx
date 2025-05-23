
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Download } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { SensorReading, createAndDownloadCSV } from "./balanceUtils";
import { toast } from 'sonner';

interface ResultScreenProps {
  result: StrokeDetectionResult | null;
  rawSensorData: SensorReading[];
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  rawSensorData
}) => {
  const [showSensorReadings, setShowSensorReadings] = useState(false);
  
  // Create a CSV file from sensor data and trigger download
  const downloadSensorData = () => {
    if (rawSensorData.length === 0) {
      toast.error("No sensor data available to download");
      return;
    }
    
    const csv = createAndDownloadCSV(rawSensorData);
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-test-data-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Sensor data downloaded as CSV");
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
                  Download Complete Data (CSV)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
