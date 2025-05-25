
import React, { useState, useEffect } from 'react';
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { toast } from 'sonner';

interface SensorDiagnosticsProps {
  onPermissionsGranted: () => void;
}

export const SensorDiagnostics: React.FC<SensorDiagnosticsProps> = ({ onPermissionsGranted }) => {
  const [permissionStatus, setPermissionStatus] = useState<{
    motion: boolean;
    deviceMotion: boolean;
    deviceOrientation: boolean;
  }>({
    motion: false,
    deviceMotion: false,
    deviceOrientation: false
  });
  
  const [testResults, setTestResults] = useState<{
    accelerometer: boolean;
    gyroscope: boolean;
    orientation: boolean;
  }>({
    accelerometer: false,
    gyroscope: false,
    orientation: false
  });
  
  const [isNative, setIsNative] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    console.log("Checking initial permissions...");
    
    if (Capacitor.isNativePlatform()) {
      try {
        // Check motion permissions on native platform
        const motionPermission = await Motion.requestPermissions();
        console.log("Motion permission result:", motionPermission);
        
        setPermissionStatus(prev => ({
          ...prev,
          motion: motionPermission.granted === true
        }));
      } catch (error) {
        console.error("Error checking motion permissions:", error);
      }
    } else {
      // Check web permissions
      if (typeof DeviceMotionEvent !== 'undefined') {
        setPermissionStatus(prev => ({
          ...prev,
          deviceMotion: true
        }));
      }
      
      if (typeof DeviceOrientationEvent !== 'undefined') {
        setPermissionStatus(prev => ({
          ...prev,
          deviceOrientation: true
        }));
      }
    }
  };

  const requestPermissions = async () => {
    console.log("Requesting permissions...");
    setTesting(true);
    
    try {
      if (Capacitor.isNativePlatform()) {
        // Request motion permissions on native
        const motionResult = await Motion.requestPermissions();
        console.log("Motion permission request result:", motionResult);
        
        setPermissionStatus(prev => ({
          ...prev,
          motion: motionResult.granted === true
        }));
        
        if (motionResult.granted) {
          toast.success("Motion permissions granted!");
        } else {
          toast.error("Motion permissions denied. Please enable in device settings.");
        }
      } else {
        // Request web permissions
        if (typeof DeviceMotionEvent !== 'undefined' && (DeviceMotionEvent as any).requestPermission) {
          const motionPermission = await (DeviceMotionEvent as any).requestPermission();
          console.log("Web DeviceMotion permission:", motionPermission);
          
          setPermissionStatus(prev => ({
            ...prev,
            deviceMotion: motionPermission === 'granted'
          }));
        }
        
        if (typeof DeviceOrientationEvent !== 'undefined' && (DeviceOrientationEvent as any).requestPermission) {
          const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
          console.log("Web DeviceOrientation permission:", orientationPermission);
          
          setPermissionStatus(prev => ({
            ...prev,
            deviceOrientation: orientationPermission === 'granted'
          }));
        }
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      toast.error("Failed to request permissions: " + error);
    }
    
    setTesting(false);
  };

  const testSensors = async () => {
    console.log("Testing sensors...");
    setTesting(true);
    
    let accelWorking = false;
    let gyroWorking = false;
    let orientationWorking = false;
    
    try {
      // Test accelerometer
      const accelListener = await Motion.addListener('accel', (event) => {
        console.log("Accelerometer test data:", event);
        const { x, y, z } = event.acceleration;
        if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01 || Math.abs(z) > 0.01) {
          accelWorking = true;
        }
      });
      
      // Test orientation
      const orientationListener = await Motion.addListener('orientation', (event) => {
        console.log("Orientation test data:", event);
        if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
          orientationWorking = true;
        }
      });
      
      // Wait for 3 seconds to collect data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clean up listeners
      accelListener.remove();
      orientationListener.remove();
      
      setTestResults({
        accelerometer: accelWorking,
        gyroscope: gyroWorking, // We simulate gyro from orientation
        orientation: orientationWorking
      });
      
      if (accelWorking && orientationWorking) {
        toast.success("Sensors are working properly!");
        onPermissionsGranted();
      } else {
        toast.error("Some sensors are not working. Please check device capabilities.");
      }
      
    } catch (error) {
      console.error("Error testing sensors:", error);
      toast.error("Failed to test sensors: " + error);
    }
    
    setTesting(false);
  };

  const hasAllPermissions = isNative ? 
    permissionStatus.motion : 
    (permissionStatus.deviceMotion && permissionStatus.deviceOrientation);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          Sensor Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Platform: {isNative ? 'Native Mobile App' : 'Web Browser'}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Permission Status:</h3>
          <div className="space-y-1">
            {isNative ? (
              <div className="flex items-center">
                {permissionStatus.motion ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                )}
                Motion Sensors
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  {permissionStatus.deviceMotion ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  Device Motion
                </div>
                <div className="flex items-center">
                  {permissionStatus.deviceOrientation ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  Device Orientation
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Sensor Test Results:</h3>
          <div className="space-y-1">
            <div className="flex items-center">
              {testResults.accelerometer ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
              )}
              Accelerometer
            </div>
            <div className="flex items-center">
              {testResults.orientation ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
              )}
              Orientation
            </div>
            <div className="flex items-center">
              {testResults.gyroscope ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
              )}
              Gyroscope (Simulated)
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {!hasAllPermissions && (
            <Button 
              onClick={requestPermissions} 
              disabled={testing}
              className="w-full"
            >
              {testing ? "Requesting..." : "Request Permissions"}
            </Button>
          )}
          
          <Button 
            onClick={testSensors} 
            disabled={testing || !hasAllPermissions}
            variant="outline"
            className="w-full"
          >
            {testing ? "Testing..." : "Test Sensors"}
          </Button>
        </div>

        {!hasAllPermissions && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Permissions are required for the balance test to work properly.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
