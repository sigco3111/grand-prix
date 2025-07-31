
import React from 'react';
import { Part, PartType } from '../types';
import { Button, Card } from './common';

interface PartSelectionModalProps {
  partType: PartType;
  unlockedParts: Part[];
  currentlyEquippedPartId: number | null;
  onEquip: (partId: number | null) => void;
  onClose: () => void;
}

const PartSelectionModal: React.FC<PartSelectionModalProps> = ({
  partType,
  unlockedParts,
  currentlyEquippedPartId,
  onEquip,
  onClose,
}) => {
  const availableParts = unlockedParts.filter(p => p.type === partType);
  
  const typeToKorean = {
    Engine: '엔진',
    Tire: '타이어',
    Chassis: '섀시',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60] animate-fade-in">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          {typeToKorean[partType]} 선택
        </h2>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
          {availableParts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">해금된 파츠가 없습니다. 연구를 통해 새로운 파츠를 개발하세요!</p>
          ) : (
            availableParts.map(part => {
              const isEquipped = part.id === currentlyEquippedPartId;
              return (
                <Card key={part.id} className={`flex items-center justify-between gap-4 p-4 transition-all ${isEquipped ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">{part.emoji} {part.name}</h3>
                    <div className="text-xs mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                      {Object.entries(part.stats).map(([stat, value]) => value !== 0 && (
                        <span key={stat} className="mr-3">
                          {stat === 'speed' ? '속도' : stat === 'acceleration' ? '가속' : '핸들링'}
                          <span className={`${value > 0 ? 'text-green-500' : 'text-red-500'} font-semibold ml-1`}>
                            {value > 0 ? `+${value}` : value}
                          </span>
                        </span>
                      ))}
                    </div>
                     {part.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                          {part.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onEquip(part.id)}
                    disabled={isEquipped}
                    variant={isEquipped ? 'secondary' : 'primary'}
                    className="px-4 py-2 text-sm"
                  >
                    {isEquipped ? '장착됨' : '선택'}
                  </Button>
                </Card>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button onClick={() => onEquip(null)} variant="danger" disabled={currentlyEquippedPartId === null}>
            장착 해제
          </Button>
          <Button onClick={onClose} variant="secondary">
            닫기
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PartSelectionModal;