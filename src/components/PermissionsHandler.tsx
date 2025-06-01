
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Mic, HardDrive, Activity, CheckCircle, XCircle, Settings } from 'lucide-react';
import { permissionsService, PermissionStatus } from '@/services/permissionsService';
import { Capacitor } from '@capacitor/core';

interface PermissionsHandlerProps {
  onPermissionsGranted: () => void;
}

const PermissionsHandler: React.FC<PermissionsHandlerProps> = ({ onPermissionsGranted }) => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    microphone: false,
    storage: false,
    motion: false
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    // Only show permissions screen on native platforms
    if (!Capacitor.isNativePlatform()) {
      onPermissionsGranted();
      return;
    }

    const currentPermissions = await permissionsService.checkPermissions();
    setPermissions(currentPermissions);
    
    // If all permissions are granted, proceed
    if (currentPermissions.camera && currentPermissions.microphone && currentPermissions.storage && currentPermissions.motion) {
      onPermissionsGranted();
    } else {
      setShowPermissions(true);
    }
  };

  const requestPermissions = async () => {
    setIsChecking(true);
    try {
      const newPermissions = await permissionsService.requestAllPermissions();
      setPermissions(newPermissions);
      
      // Check if all critical permissions are granted
      if (newPermissions.camera && newPermissions.microphone) {
        onPermissionsGranted();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const skipPermissions = () => {
    // Allow user to continue without all permissions
    onPermissionsGranted();
  };

  if (!showPermissions) {
    return null;
  }

  const allPermissionsGranted = permissions.camera && permissions.microphone && permissions.storage && permissions.motion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">App Permissions</CardTitle>
          <p className="text-gray-600">
            Stroke Sense needs these permissions to work properly
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Camera</p>
                  <p className="text-sm text-gray-600">For eye tracking tests</p>
                </div>
              </div>
              {permissions.camera ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mic className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Microphone</p>
                  <p className="text-sm text-gray-600">For speech analysis</p>
                </div>
              </div>
              {permissions.microphone ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-gray-600">For saving test results</p>
                </div>
              </div>
              {permissions.storage ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Motion Sensors</p>
                  <p className="text-sm text-gray-600">For balance testing</p>
                </div>
              </div>
              {permissions.motion ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>

          {!allPermissionsGranted && (
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                If permissions were denied, you may need to enable them manually in your device settings.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={requestPermissions}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? 'Requesting Permissions...' : 'Grant Permissions'}
            </Button>
            
            <Button 
              onClick={skipPermissions}
              variant="outline"
              className="w-full"
            >
              Continue Without All Permissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsHandler;
