import React, { useState } from 'react';
import { Card, Button } from './common';

type HelpTopic = '기본' | '차고 & 파츠' | '레이스' | '연구 & 시설' | '직원 & 성장' | '기타 시스템';

const helpTopics: { id: HelpTopic, emoji: string }[] = [
  { id: '기본', emoji: '🏁' },
  { id: '차고 & 파츠', emoji: '🔧' },
  { id: '레이스', emoji: '🏆' },
  { id: '연구 & 시설', emoji: '🔬' },
  { id: '직원 & 성장', emoji: '🧑‍🔧' },
  { id: '기타 시스템', emoji: '✨' },
];

const HelpContent: React.FC<{ topic: HelpTopic }> = ({ topic }) => {
  switch (topic) {
    case '기본':
      return (
        <div className="space-y-4">
          <p>이모지 레이서에 오신 것을 환영합니다! 당신은 레이싱 팀의 감독이 되어 월드 챔피언십 우승을 목표로 팀을 운영하게 됩니다.</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>목표:</strong> 레이스에서 승리하고, 최고의 차와 드라이버를 육성하여 시즌 챔피언이 되세요!</li>
            <li><strong>💰 돈:</strong> 차량 업그레이드, 수리, 직원 월급, 시설 투자 등 팀 운영에 필요한 핵심 자원입니다. 레이스 상금과 스폰서 계약으로 얻을 수 있습니다.</li>
            <li><strong>🔬 연구 포인트 (RP):</strong> 새로운 차량, 부품, 팀 특성을 개발하는 데 사용됩니다. 레이스 보상으로 획득할 수 있습니다.</li>
            <li><strong>📅 시간:</strong> 레이스를 할 때마다 한 달이 지나갑니다. 매달 직원들에게 월급이 자동으로 지급되니, 자금 관리에 유의하세요. 12월 레이스가 끝나면 시즌이 종료되고 결산이 진행됩니다.</li>
          </ul>
        </div>
      );
    case '차고 & 파츠':
      return (
        <div className="space-y-4">
          <p>차고는 팀의 심장입니다. 이곳에서 차량을 관리하고 최적의 상태로 만드세요.</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>차량 스탯:</strong>
              <ul className="list-['-_'] list-inside ml-4">
                <li><strong>⚡️ 속도:</strong> 최고 속도에 영향을 줍니다. 고속 코스에서 중요합니다.</li>
                <li><strong>💨 가속:</strong> 최고 속도에 도달하는 시간에 영향을 줍니다.</li>
                <li><strong>🔄 핸들링:</strong> 코너링 성능에 영향을 줍니다. 테크니컬 코스에서 중요합니다.</li>
              </ul>
            </li>
            <li><strong>업그레이드:</strong> 돈을 사용하여 차량의 기본 스탯을 영구적으로 향상시킵니다.</li>
            <li><strong>내구도 & 수리:</strong> 레이스를 할 때마다 차량의 내구도가 소모됩니다. 내구도가 0이 되면 레이스에 참가할 수 없으니, 돈을 들여 수리해야 합니다.</li>
            <li><strong>파츠 장착:</strong> 연구를 통해 개발한 엔진, 타이어, 섀시 파츠를 장착하여 차량에 추가 스탯 보너스를 부여할 수 있습니다. 각 파츠는 고유의 장단점을 가지고 있습니다.</li>
          </ul>
        </div>
      );
    case '레이스':
        return (
            <div className="space-y-4">
            <p>레이스는 돈과 RP를 얻고, 드라이버를 성장시키는 주된 활동입니다.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>코스 타입:</strong>
                <ul className="list-['-_'] list-inside ml-4">
                    <li><strong>🛣️ 고속 코스:</strong> 속도가 높은 차량이 유리합니다.</li>
                    <li><strong>🔄 테크니컬 코스:</strong> 핸들링이 높은 차량이 유리합니다.</li>
                    <li><strong>⚖️ 밸런스 코스:</strong> 전반적인 성능이 중요합니다.</li>
                </ul>
                </li>
                <li><strong>날씨:</strong>
                <ul className="list-['-_'] list-inside ml-4">
                    <li><strong>☀️ 맑음:</strong> 기본 조건입니다. 슬릭 타이어가 최고의 성능을 발휘합니다.</li>
                    <li><strong>🌧️ 비:</strong> 트랙이 미끄러워집니다. 레인 타이어를 장착하면 엄청난 보너스를 받지만, 다른 타이어는 성능이 저하됩니다.</li>
                </ul>
                </li>
                <li><strong>드라이버 컨디션:</strong> 드라이버의 컨디션(최상 ~ 나쁨)은 레이스 중 퍼포먼스에 직접적인 영향을 줍니다.</li>
                <li><strong>특수 스킬:</strong> 드라이버는 고유의 특수 스킬을 가지고 있어 레이스에 변수를 만듭니다. (예: 스타트 대시, 오버드라이브)</li>
                <li><strong>피트인:</strong> 레이스 중 한 번 피트인을 요청할 수 있습니다. 미케닉이 차량 내구도를 일부 수리해주지만, 시간이 소요되어 순위가 하락할 수 있습니다. 미케닉의 기술력이 높을수록 수리 효율과 속도가 증가합니다.</li>
            </ul>
            </div>
        );
    case '연구 & 시설':
        return (
            <div className="space-y-4">
            <p>지속적인 연구와 투자는 팀을 강하게 만드는 원동력입니다.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>연구:</strong> RP를 소모하여 새로운 파츠, 신차, 팀 전체에 이로운 효과를 주는 '팀 특성'을 해금할 수 있습니다. 일부 연구는 선행 연구를 완료해야만 진행할 수 있습니다.</li>
                <li><strong>시설 투자:</strong> 돈과 RP를 투자하여 팀 시설을 업그레이드할 수 있습니다.
                <ul className="list-['-_'] list-inside ml-4">
                    <li><strong>🚗 차고:</strong> 레벨이 오르면 더 많은 차량을 보유할 수 있습니다.</li>
                    <li><strong>🧪 연구소:</strong> 레벨이 오르면 더 높은 등급의 연구 항목이 해금됩니다.</li>
                    <li><strong>🏋️ 트레이닝 센터:</strong> 건설하면 직원들이 레이스 후 얻는 경험치가 증가합니다.</li>
                </ul>
                </li>
            </ul>
            </div>
        );
    case '직원 & 성장':
        return (
            <div className="space-y-4">
            <p>최고의 팀에는 최고의 직원이 필요합니다. 직원은 매달 월급을 받습니다.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>드라이버 👨‍🚀:</strong> 차량을 운전하여 레이스를 펼칩니다. '기술' 스탯이 높을수록 차량 성능에 더 큰 보너스를 줍니다. 레이스를 통해 경험치를 얻고 레벨업하여 성장합니다.</li>
                <li><strong>미케닉 👩‍🔧:</strong> 팀의 기술적인 부분을 담당합니다. '기술' 스탯이 높을수록 차량 업그레이드 및 수리 비용이 할인되고, 업그레이드 시 추가 스탯 보너스를 제공하며, 연구 비용도 할인해줍니다.</li>
                <li><strong>고용:</strong> 고용 센터에서 새로운 직원을 영입할 수 있습니다.</li>
            </ul>
            </div>
        );
    case '기타 시스템':
        return (
            <div className="space-y-4">
            <p>팀 운영을 풍요롭게 하는 추가적인 시스템들입니다.</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>스폰서 🤝:</strong> 스폰서와 계약하여 안정적인 추가 수입을 얻을 수 있습니다. 계약 시 보너스, 레이스당 지급액, 승리 보너스 등을 제공합니다. 계약 기간이 있으니 신중하게 선택하세요.</li>
                <li><strong>오라 ✨:</strong> 팀 전체에 적용되는 특별한 버프입니다. 경험치 증가, 상금 증가 등 다양한 효과 중 하나를 선택하여 활성화할 수 있으며, 언제든지 변경 가능합니다.</li>
                <li><strong>챔피언십 📈:</strong> 1년(시즌) 동안 레이스 순위에 따라 챔피언십 포인트를 획득합니다. 시즌 종료 시 순위에 따라 라이벌 팀과 경쟁하며, 챔피언이 되면 막대한 보상을 얻습니다.</li>
            </ul>
            </div>
        );
    default:
      return null;
  }
};

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeTopic, setActiveTopic] = useState<HelpTopic>('기본');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[70] animate-fade-in">
      <Card className="w-full max-w-2xl flex flex-col">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-white">도움말 📖</h2>
        
        <div className="flex border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap -mb-px">
            {helpTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`flex-shrink-0 px-3 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTopic === topic.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-1.5">{topic.emoji}</span>{topic.id}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 max-h-[50vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300">
          <HelpContent topic={activeTopic} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="primary">
            닫기
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HelpModal;
