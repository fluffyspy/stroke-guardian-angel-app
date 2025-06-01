
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface EyeTrackingConfigProps {
  config: {
    movementThreshold: number;
    calibrationTime: number;
    directionTime: number;
    maxConsecutiveMisses: number;
    detectionInterval: number;
    smoothingFactor: number;
  };
  onConfigChange: (config: any) => void;
}

const EyeTrackingConfig: React.FC<EyeTrackingConfigProps> = ({ config, onConfigChange }) => {
  const handleChange = (key: string, value: number) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Detection Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="movementThreshold">Movement Threshold (px)</Label>
          <Input
            id="movementThreshold"
            type="number"
            value={config.movementThreshold}
            onChange={(e) => handleChange('movementThreshold', Number(e.target.value))}
            min="10"
            max="100"
            step="5"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum movement to detect direction</p>
        </div>
        
        <div>
          <Label htmlFor="calibrationTime">Calibration Time (s)</Label>
          <Input
            id="calibrationTime"
            type="number"
            value={config.calibrationTime}
            onChange={(e) => handleChange('calibrationTime', Number(e.target.value))}
            min="1"
            max="10"
            step="1"
          />
          <p className="text-xs text-gray-500 mt-1">Time to calibrate baseline</p>
        </div>
        
        <div>
          <Label htmlFor="directionTime">Direction Time (s)</Label>
          <Input
            id="directionTime"
            type="number"
            value={config.directionTime}
            onChange={(e) => handleChange('directionTime', Number(e.target.value))}
            min="3"
            max="10"
            step="1"
          />
          <p className="text-xs text-gray-500 mt-1">Time per direction</p>
        </div>
        
        <div>
          <Label htmlFor="maxConsecutiveMisses">Max Consecutive Misses</Label>
          <Input
            id="maxConsecutiveMisses"
            type="number"
            value={config.maxConsecutiveMisses}
            onChange={(e) => handleChange('maxConsecutiveMisses', Number(e.target.value))}
            min="1"
            max="5"
            step="1"
          />
          <p className="text-xs text-gray-500 mt-1">Misses before abnormal result</p>
        </div>
        
        <div>
          <Label htmlFor="detectionInterval">Detection Interval (ms)</Label>
          <Input
            id="detectionInterval"
            type="number"
            value={config.detectionInterval}
            onChange={(e) => handleChange('detectionInterval', Number(e.target.value))}
            min="50"
            max="500"
            step="50"
          />
          <p className="text-xs text-gray-500 mt-1">How often to check for movement</p>
        </div>
        
        <div>
          <Label htmlFor="smoothingFactor">Smoothing Factor</Label>
          <Input
            id="smoothingFactor"
            type="number"
            value={config.smoothingFactor}
            onChange={(e) => handleChange('smoothingFactor', Number(e.target.value))}
            min="0.1"
            max="1"
            step="0.1"
          />
          <p className="text-xs text-gray-500 mt-1">Movement smoothing (0.1-1.0)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EyeTrackingConfig;
