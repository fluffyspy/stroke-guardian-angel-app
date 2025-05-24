

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { TEST_DURATION, ACCELERATION_THRESHOLD, ROTATION_THRESHOLD } from './balanceUtils';

interface LiveTestScreenProps {
  timer: number;
  currentAccel: { x: number; y: number; z: number };
  currentRotation: { alpha: number; beta: number; gamma: number };
  currentGyro: { x: number; y: number; z: number };
  debugInfo: {
    totalReadings: number;
    abnormalCount: number;
    lastUpdate: number;
    motionDetected: boolean;
  };
  accelerationData: number[];
  rotationData: number[];
  gyroscopeData: number[];
  readingsCount: number;
}

export const LiveTestScreen: React.FC<LiveTestScreenProps> = ({
  timer,
  currentAccel,
  currentRotation,
  currentGyro,
  debugInfo,
  accelerationData,
  rotationData,
  gyroscopeData,
  readingsCount
}) => {
  // Helper function to safely format numbers, handling null values
  const safeToFixed = (value: number | null, digits: number = 2): string => {
    return value !== null ? value.toFixed(digits) : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{timer}</div>
          <p className="text-gray-600">Hold phone against center of chest and walk normally</p>
          
          {/* Live sensor readings display with visualization */}
          <div className="mt-6 bg-gray-50 p-3 rounded-lg w-full max-w-md mx-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Live Sensor Readings</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="font-medium">Acceleration</div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <div>X: {safeToFixed(currentAccel.x)}</div>
                  <div>Y: {safeToFixed(currentAccel.y)}</div>
                  <div>Z: {safeToFixed(currentAccel.z)}</div>
                </div>
                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, Math.sqrt(currentAccel.x**2 + currentAccel.y**2 + currentAccel.z**2) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="font-medium">Orientation</div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <div>α: {safeToFixed(currentRotation.alpha, 0)}°</div>
                  <div>β: {safeToFixed(currentRotation.beta, 0)}°</div>
                  <div>γ: {safeToFixed(currentRotation.gamma, 0)}°</div>
                </div>
                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, Math.sqrt((currentRotation.alpha || 0)**2 + (currentRotation.beta || 0)**2 + (currentRotation.gamma || 0)**2) / 3)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Simulated gyroscope data from orientation changes */}
            <div className="bg-white p-2 rounded shadow-sm mt-2">
              <div className="font-medium">Gyroscope (from orientation)</div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div>X: {safeToFixed(currentGyro.x)}</div>
                <div>Y: {safeToFixed(currentGyro.y)}</div>
                <div>Z: {safeToFixed(currentGyro.z)}</div>
              </div>
              <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.sqrt(currentGyro.x**2 + currentGyro.y**2 + currentGyro.z**2) * 10)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Debug info counter */}
            <div className="mt-2 text-xs text-gray-500">
              <div>Total readings: {debugInfo.totalReadings}</div>
              <div>Abnormal movements: {debugInfo.abnormalCount}</div>
              <div className="text-xs mt-1">
                <span className={debugInfo.motionDetected ? "text-green-500" : "text-red-500"}>
                  {debugInfo.motionDetected ? "✓ Motion detected" : "✗ No motion detected"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Visual indicators for motion detection */}
          <div className="mt-4 flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Movement</div>
              <div className={`h-4 w-4 rounded-full mx-auto ${
                accelerationData.length > 0 && 
                accelerationData[accelerationData.length - 1] > ACCELERATION_THRESHOLD 
                  ? 'bg-yellow-500 animate-ping' 
                  : 'bg-green-500'
              }`}></div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Balance</div>
              <div className={`h-4 w-4 rounded-full mx-auto ${
                (rotationData.length > 0 && 
                rotationData[rotationData.length - 1] > ROTATION_THRESHOLD) ||
                (gyroscopeData.length > 0 &&
                gyroscopeData[gyroscopeData.length - 1] > ROTATION_THRESHOLD)
                  ? 'bg-yellow-500 animate-ping' 
                  : 'bg-green-500'
              }`}></div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Readings</div>
              <div className="text-xs font-medium">{readingsCount}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Time remaining:</span>
          <span>{timer} seconds</span>
        </div>
        <Progress value={((TEST_DURATION - timer) / TEST_DURATION) * 100} />
      </div>
    </div>
  );
};

