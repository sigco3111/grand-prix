
import React from 'react';
import { Car, Part } from '../types';
import { Button, Card } from './common';

// A more detailed stat display for this modal
const StatDisplayDetailed: React.FC<{ icon: string; label: string; value: string | number; color: string; }> = ({ icon, label, value, color }) => (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
        <span className="text-xl">{icon}</span>
        <span className={`font-medium text-gray-600 dark:text-gray-400`}>{label}:</span>
        <span className={`font-bold text-lg ${color}`}>{value}</span>
    </div>
);

type CarWithStats = Car & {
    totalStats: {
        speed: number;
        acceleration: number;
        handling: number;
    };
     equippedPartsMap: {
        engine?: Part;
        tire?: Part;
        chassis?: Part;
    };
};

interface CarSelectionModalProps {
  cars: CarWithStats[];
  onSelect: (car: Car) => void;
  onClose: () => void;
  raceName: string;
}



const CarSelectionModal: React.FC<CarSelectionModalProps> = ({ cars, onSelect, onClose, raceName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          '{raceName}'에 출전할 차량 선택
        </h2>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
          {cars.map(car => {
              const needsRepair = car.durability <= 0;
              const durabilityRatio = car.durability / car.maxDurability;
              let durabilityColor = 'text-green-500';
              if (durabilityRatio <= 0.2) {
                  durabilityColor = 'text-red-500';
              } else if (durabilityRatio <= 0.5) {
                  durabilityColor = 'text-yellow-500';
              }

              return (
                <Card key={car.id} className={`bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 p-4 ${needsRepair ? 'opacity-60' : ''}`}>
                  <div className="flex-grow w-full">
                      <h3 className="text-xl font-bold mb-3">{car.emoji} {car.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <StatDisplayDetailed icon="⚡️" label="속도" value={car.totalStats.speed} color="text-red-500" />
                          <StatDisplayDetailed icon="💨" label="가속" value={car.totalStats.acceleration} color="text-blue-500" />
                          <StatDisplayDetailed icon="🔄" label="핸들링" value={car.totalStats.handling} color="text-green-500" />
                          <StatDisplayDetailed icon="🛡️" label="내구도" value={`${car.durability}/${car.maxDurability}`} color={durabilityColor} />
                      </div>
                  </div>
                  <div className="flex-shrink-0 mt-3 md:mt-0">
                      <Button onClick={() => onSelect(car)} variant="secondary" disabled={needsRepair}>
                          {needsRepair ? '수리 필요' : '이 차량으로 참가'}
                      </Button>
                  </div>
                </Card>
              );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="danger">취소</Button>
        </div>
      </Card>
    </div>
  );
};

export default CarSelectionModal;
