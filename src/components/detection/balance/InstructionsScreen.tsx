
import React from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Smartphone } from 'lucide-react';

interface InstructionsScreenProps {
  onReadInstructions: () => void;
  onStartTest: () => void;
  instructionsRead: boolean;
  sensorAvailable: boolean;
  sensorTypes: string[];
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
  onReadInstructions,
  onStartTest,
  instructionsRead,
  sensorAvailable,
  sensorTypes
}) => {
  return (
    <div className="text-center py-8">
      <Activity className="h-16 w-16 mx-auto mb-4 text-primary" />
      <h2 className="text-xl font-semibold mb-2">Balance Test</h2>
      <p className="mb-4 text-gray-600">
        This test uses your phone's motion sensors to check for balance issues. Please ensure:
      </p>
      <ul className="text-left list-disc mb-4 ml-6">
        <li>You are in a safe environment with nothing to trip over</li>
        <li>Someone is nearby to assist if needed</li>
        <li>You have space to walk comfortably</li>
      </ul>
      <div className="mt-4 bg-blue-50 p-4 rounded-lg text-blue-700 text-left">
        <p className="font-medium">Instructions:</p>
        <ol className="list-decimal ml-6 mt-2">
          <li>Hold your phone firmly against the <strong>center of your chest</strong></li>
          <li className="mt-1">Keep both hands on the sides of the phone</li>
          <li className="mt-1">When ready, press "Start Test"</li>
          <li className="mt-1">Walk normally for 15 seconds</li>
          <li className="mt-1">Try to move in different ways to test balance detection</li>
          <li className="mt-1">Stay in place when the timer ends</li>
          <li className="mt-1">The app will analyze your walking balance</li>
        </ol>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-center mb-4">
          <Smartphone className="h-16 w-16 text-primary mr-2" />
          <div className="w-20 h-16 border-2 border-primary rounded-full flex items-center justify-center">
            <span className="text-primary font-medium">CHEST</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Button 
          onClick={onReadInstructions}
          className="mt-4 mb-2"
          disabled={instructionsRead}
        >
          {instructionsRead ? "Instructions Read ✓" : "I've Read The Instructions"}
        </Button>
        <Button 
          onClick={onStartTest} 
          className="mt-2" 
          disabled={!sensorAvailable || !instructionsRead}
        >
          Start Test
        </Button>
        {!sensorAvailable && (
          <p className="mt-2 text-red-500">
            Motion sensors not available on this device. This test requires accelerometer and gyroscope.
          </p>
        )}
        {sensorAvailable && sensorTypes.length > 0 && (
          <p className="mt-2 text-green-600 text-xs">
            Available sensors: {sensorTypes.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};
