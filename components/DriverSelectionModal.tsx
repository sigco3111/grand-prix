
import React from 'react';
import { Staff } from '../types';
import { Button, Card, StatDisplay } from './common';

interface DriverSelectionModalProps {
  drivers: Staff[];
  onSelect: (driver: Staff) => void;
  onClose: () => void;
  raceName: string;
}

const conditionEmojis: { [key: string]: string } = { '최상': '😊', '좋음': '🙂', '보통': '😐', '나쁨': '😟' };

const DriverSelectionModal: React.FC<DriverSelectionModalProps> = ({ drivers, onSelect, onClose, raceName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          '{raceName}'에 출전할 드라이버 선택
        </h2>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
          {drivers.map(driver => (
            <Card key={driver.id} className="bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 p-4">
              <div className="flex-grow w-full">
                <h3 className="text-xl font-bold mb-3">{driver.emoji} {driver.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <StatDisplay icon="⭐" label="기술" value={driver.skill} color="text-yellow-500" />
                  {driver.specialSkill && (
                    <StatDisplay icon="✨" label="특수 스킬" value={driver.specialSkill} color="text-cyan-400" />
                  )}
                  {driver.condition && (
                    <StatDisplay icon={conditionEmojis[driver.condition]} label="컨디션" value={driver.condition} color="text-orange-500" />
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 mt-3 md:mt-0">
                <Button onClick={() => onSelect(driver)} variant="secondary">
                  이 드라이버로 참가
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="danger">취소</Button>
        </div>
      </Card>
    </div>
  );
};

export default DriverSelectionModal;
