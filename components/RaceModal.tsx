import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Race, Car, Staff, TeamTrait } from '../types';
import { Button, Card } from './common';
import { CAR_PARTS } from '../constants';

interface RaceModalProps {
  race: Race;
  playerCar: Car;
  playerCarId: number;
  playerDriver: Staff;
  mechanicSkill: number;
  onClose: () => void;
  onRaceFinish: (prizeMoney: number, prizeRp: number, rank: number, raceId: number, carId: number, driverId: number, durabilityRepaired: number) => void;
  teamTraitEffects: {
    pitStopTimeReduction: number;
    durabilityLossModifier: number;
    sponsorPayoutModifier: number;
    allCarsHandlingBonus: number;
  };
}

type RaceStatus = 'starting' | 'racing' | 'finished';

interface Racer {
  name: string;
  emoji: string;
  performance: number;
  isPlayer: boolean;
}

interface PlayerPerformanceBreakdown {
  carBase: number;
  driverBonus: number;
  weatherModifier: number;
  conditionModifier: number;
  total: number;
}

interface RaceData {
    allRacers: Racer[];
    playerPerformanceBreakdown: PlayerPerformanceBreakdown;
}

const courseTypeIcons = {
    '고속': '🛣️',
    '테크니컬': '🔄',
    '밸런스': '⚖️',
};

const RaceModal: React.FC<RaceModalProps> = ({ race, playerCar, playerDriver, playerCarId, mechanicSkill, onClose, onRaceFinish, teamTraitEffects }) => {
  const [status, setStatus] = useState<RaceStatus>('starting');
  const [results, setResults] = useState<Racer[]>([]);
  const [playerRank, setPlayerRank] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [playerPerformanceBreakdown, setPlayerPerformanceBreakdown] = useState<PlayerPerformanceBreakdown | null>(null);
  const [skillUses, setSkillUses] = useState(0);
  const [pitStopAvailable, setPitStopAvailable] = useState(true);
  const [pitStopScheduled, setPitStopScheduled] = useState(false);
  const [durabilityRepaired, setDurabilityRepaired] = useState(0);
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const raceDataRef = useRef<RaceData | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  const finishRace = useCallback(() => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
      raceIntervalRef.current = null;
    }
    
    if (!raceDataRef.current) return;

    const { allRacers, playerPerformanceBreakdown } = raceDataRef.current;

    const finalResults = [...allRacers].sort((a, b) => b.performance - a.performance);
    setResults(finalResults);
    
    const rank = finalResults.findIndex(r => r.isPlayer) + 1;
    setPlayerRank(rank);

    setPlayerPerformanceBreakdown(playerPerformanceBreakdown);

    let prizeMoney = 0;
    let prizeRp = 0;
    if (rank === 1) {
        prizeMoney = race.prizeMoney;
        prizeRp = race.researchPoints;
    } else if (rank === 2) {
        prizeMoney = Math.floor(race.prizeMoney / 2);
        prizeRp = Math.floor(race.researchPoints / 2);
    } else if (rank === 3) {
        prizeMoney = Math.floor(race.prizeMoney / 4);
        prizeRp = Math.floor(race.researchPoints / 4);
    }

    onRaceFinish(prizeMoney, prizeRp, rank, race.id, playerCarId, playerDriver.id, durabilityRepaired);
    setStatus('finished');
  }, [race, onRaceFinish, playerCarId, playerDriver, durabilityRepaired]);

  const handleSkip = useCallback(() => {
    setLog(prev => [...prev, '레이스를 건너뛰어 결과를 즉시 확인합니다...']);
    setTimeout(finishRace, 100);
  }, [finishRace]);

  const handleActivateSkill = useCallback(() => {
    if (skillUses <= 0 || !raceDataRef.current || playerDriver?.specialSkill !== 'Overdrive') return;

    setSkillUses(prev => prev - 1);
    
    const playerRacer = raceDataRef.current.allRacers.find(r => r.isPlayer);
    if (playerRacer) {
        const boost = playerRacer.performance * 0.15; // 15% boost
        playerRacer.performance += boost;
        setLog(prev => [...prev, `🚀 ${playerDriver.name}이(가) 오버드라이브를 사용합니다! 성능이 대폭 상승합니다!`]);
    }
  }, [skillUses, playerDriver]);

  const handleSchedulePitStop = useCallback(() => {
    if (!pitStopAvailable || pitStopScheduled || mechanicSkill <= 0) return;

    setPitStopAvailable(false);
    setPitStopScheduled(true);
    setLog(prev => [...prev, '🛠️ 피트인 요청! 다음 랩에서 피트 스탑을 진행합니다.']);
  }, [pitStopAvailable, pitStopScheduled, mechanicSkill]);

  useEffect(() => {
    if (status !== 'racing') {
        return;
    }

    // --- Setup Logic ---
    const initialLog: string[] = [];
    
    // --- Course Type Logic ---
    let carBasePerformance;
    let speedWeight = 0.4, accelWeight = 0.3, handlingWeight = 0.3;

    switch(race.courseType) {
        case '고속':
            speedWeight = 0.6;
            handlingWeight = 0.1;
            initialLog.push(`🛣️ 이 코스는 고속 주행이 중요합니다! 스피드가 높은 차량이 유리합니다.`);
            break;
        case '테크니컬':
            speedWeight = 0.2;
            handlingWeight = 0.5;
            initialLog.push(`🔄 연속되는 커브! 테크니컬 코스에서는 핸들링이 관건입니다.`);
            break;
        default: // '밸런스' or undefined
            initialLog.push(`⚖️ 균형잡힌 코스입니다. 차량의 전반적인 성능이 중요합니다.`);
    }
    
    carBasePerformance = (playerCar.speed * speedWeight + playerCar.acceleration * accelWeight + playerCar.handling * handlingWeight);
    
    const playerDriverSkill = playerDriver?.skill || 10;
    const driverBonus = carBasePerformance * (playerDriverSkill / 100);
    const basePerformance = carBasePerformance + driverBonus;
    
    // --- Weather & Tire Logic ---
    let weatherModifier = 1.0;
    const equippedTire = CAR_PARTS.find(p => p.id === playerCar.equippedParts.tire);

    if (race.weather === '비') {
      initialLog.push(`🌧️ 비가 내리기 시작합니다! 트랙이 미끄러워집니다.`);
      if (equippedTire?.id === 204) { // Rain Tire
        weatherModifier = 1.20;
        initialLog.push(`💧 레인 타이어가 빗길에서 엄청난 접지력을 보여줍니다!`);
      } else if (equippedTire?.id === 203) { // Racing Slick
        weatherModifier = 0.60;
        initialLog.push(`😱 슬릭 타이어는 빗길에서 속수무책입니다! 차량이 계속 미끄러집니다.`);
      } else if (equippedTire?.id === 202) { // Sports Tire
        weatherModifier = 0.85;
      } else { // Standard Tire or no tire
        weatherModifier = 0.95;
      }
    } else { // Sunny or no weather
        if (equippedTire?.id === 204) { // Rain Tire
            weatherModifier = 0.8;
            initialLog.push(`☀️ 맑은 날에 레인 타이어는 오히려 독이 됩니다. 속도가 나지 않습니다.`);
        } else if (equippedTire?.id === 203) { // Racing Slick
            weatherModifier = 1.1; // Slight bonus for slicks on sunny day
        }
    }

    // --- Driver Condition Logic ---
    let conditionModifier = 1.0;
    if (playerDriver?.condition) {
        switch (playerDriver.condition) {
            case '최상':
                conditionModifier = 1.15;
                initialLog.push(`😊 드라이버의 컨디션이 최상입니다! 오늘 주행이 기대됩니다!`);
                break;
            case '좋음':
                conditionModifier = 1.05;
                initialLog.push(`🙂 드라이버의 컨디션이 좋습니다.`);
                break;
            case '나쁨':
                conditionModifier = 0.90;
                initialLog.push(`😟 드라이버의 컨디션이 좋지 않습니다... 실수가 잦을 수 있습니다.`);
                break;
            default: // '보통'
                initialLog.push(`😐 드라이버의 컨디션은 보통입니다.`);
        }
    }

    let playerPerformance = basePerformance * weatherModifier * conditionModifier;

    if (playerDriver?.specialSkill === 'Start Dash') {
        playerPerformance *= 1.10; // 10% boost at start
        initialLog.push(`💨 ${playerDriver.name}의 '스타트 대시'! 경쾌하게 출발합니다!`);
    }

    if (playerDriver?.specialSkill === 'Overdrive') {
        setSkillUses(2);
    }

    const playerRacer: Racer = {
      name: '당신',
      emoji: playerCar.emoji,
      performance: playerPerformance,
      isPlayer: true,
    };

    const opponents: Racer[] = Array.from({ length: 7 }, (_, i) => {
        let opponentPerformance = race.difficulty * 20 * (Math.random() * 0.4 + 0.8);
        if(race.weather === '비') {
            opponentPerformance *= 0.85; // Opponents also suffer in rain
        }
        return {
          name: `CPU ${i + 1}`,
          emoji: '🚗',
          performance: opponentPerformance,
          isPlayer: false,
        };
    });

    const allRacers = [...opponents, playerRacer];

    raceDataRef.current = {
      allRacers,
      playerPerformanceBreakdown: {
        carBase: carBasePerformance,
        driverBonus: driverBonus,
        weatherModifier: weatherModifier,
        conditionModifier: conditionModifier,
        total: basePerformance, // Show original total for clarity
      }
    };
    
    let currentLap = 1;
    const totalLaps = 5;
    let raceTime = 0;
    const raceDuration = 12000;
    const logInterval = 1000;

    setLog([`[랩 1/${totalLaps}] 레이스가 시작되었습니다! ${playerCar.emoji}가 굉음을 내며 출발합니다!`, ...initialLog]);

    raceIntervalRef.current = setInterval(() => {
      raceTime += logInterval;
      
      const newLap = Math.floor((raceTime / raceDuration) * totalLaps) + 1;
      let newLogs: string[] = [];

      if (newLap > currentLap && newLap <= totalLaps) {
          currentLap = newLap;
          newLogs.push(`[랩 ${currentLap}/${totalLaps}] 이제 ${currentLap}번째 랩입니다! 선두 경쟁이 치열합니다!`);
          
          if (pitStopScheduled && raceDataRef.current) {
              const playerRacer = raceDataRef.current.allRacers.find(r => r.isPlayer);
              if (playerRacer) {
                  setPitStopScheduled(false);
                  
                  newLogs.push(`🛠️ ${playerRacer.emoji} 피트레인으로 진입합니다! 미케닉들이 분주하게 움직입니다.`);
                  
                  const baseTimePenalty = Math.max(10, 60 - mechanicSkill * 0.4);
                  const timePenalty = baseTimePenalty * (1 - (teamTraitEffects?.pitStopTimeReduction || 0));
                  playerRacer.performance -= timePenalty;
                  
                  const repairAmount = Math.floor(mechanicSkill * 0.5 + 10);
                  setDurabilityRepaired(prev => prev + repairAmount);
                  
                  let boostLog = '';
                  if (Math.random() < mechanicSkill / 250) {
                      const boost = playerRacer.performance * 0.08;
                      playerRacer.performance += boost;
                      boostLog = `✨ 완벽한 피트 작업! 차량 성능이 일시적으로 향상됩니다!`;
                  }
                  
                  let pitStopLog = `🔧 피트 작업 완료! (내구도 +${repairAmount}) 차량이 트랙으로 복귀합니다! ${boostLog}`;
                   if (teamTraitEffects?.pitStopTimeReduction && teamTraitEffects.pitStopTimeReduction > 0) {
                       pitStopLog += ` (전문가 팀 덕에 시간이 단축되었습니다!)`;
                   }
                  newLogs.push(pitStopLog);
              }
          }
      }

      const racerForEvent = Math.random() < 0.4 ? playerRacer : allRacers[Math.floor(Math.random() * allRacers.length)];
      const otherRacer = allRacers.filter(r => r.name !== racerForEvent.name)[Math.floor(Math.random() * (allRacers.length - 1))];
      
      const events = [
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) 코너에서 살짝 미끄러집니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) ${otherRacer.name}의 뒤를 바짝 쫓습니다.`,
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) 완벽한 코너링으로 격차를 줄입니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) 직선 주로에서 가속하며 ${otherRacer.name}을(를) 추월합니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) 선두 자리를 굳건히 지킵니다.`,
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) ${otherRacer.name}을(를) 추월하려다 실패, ${otherRacer.name}이(가) 방어에 성공합니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}의 팀이 완벽한 전략을 지시합니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}이(가) 부스트를 사용하며 순간적으로 속도를 높입니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}과(와) ${otherRacer.name}이(가) 나란히 달리며 치열한 순위 다툼을 벌입니다!`,
          `${racerForEvent.emoji} ${racerForEvent.name}의 타이어에서 연기가 피어오릅니다! 너무 공격적이었나요?`,
      ];
      
      let eventToLog = events[Math.floor(Math.random() * events.length)];
      newLogs.push(eventToLog);
      
      if (playerDriver?.specialSkill === 'Cornering Master' && (eventToLog.includes('코너') || eventToLog.includes('코너링')) && raceDataRef.current) {
        const player = raceDataRef.current.allRacers.find(r => r.isPlayer);
        if (player) {
           const boost = 7; // A nice flat boost for a successful maneuver
           player.performance += boost;
           newLogs.push(`↪️ ${playerDriver.name}의 '코너링 마스터'! 완벽한 코너링으로 가속합니다!`);
        }
      }

      if(newLogs.length > 0){
        setLog(prev => [...prev, ...newLogs.filter(Boolean)]);
      }

      if (raceTime >= raceDuration) {
          setLog(prev => [...prev, `최종 랩! 모든 레이서들이 마지막 스퍼트를 올립니다!`]);
          setTimeout(finishRace, 1500);
      }
    }, logInterval);

    return () => {
      if (raceIntervalRef.current) {
          clearInterval(raceIntervalRef.current);
          raceIntervalRef.current = null;
      }
    };
  }, [status, playerCar, playerDriver, race, finishRace, mechanicSkill, teamTraitEffects]);

  const renderContent = () => {
    switch (status) {
      case 'starting':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-3">
                {race.name}
                {race.weather === '비' ? '🌧️' : race.weather === '맑음' ? '☀️' : ''}
                {race.courseType && courseTypeIcons[race.courseType] && (
                    <span title={`코스 타입: ${race.courseType}`}>{courseTypeIcons[race.courseType]}</span>
                )}
            </h2>
            <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
                {playerDriver.emoji} {playerDriver.name}이(가) {playerCar.emoji} {playerCar.name}에 탑승했습니다!
            </p>
            <Button onClick={() => setStatus('racing')} variant="primary" className="w-full text-lg">
              레이스 시작!
            </Button>
          </div>
        );
      case 'racing':
        return (
          <div className="text-center">
             <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-3">
                레이스 진행 중...
                {race.weather === '비' ? '🌧️' : race.weather === '맑음' ? '☀️' : ''}
                {race.courseType && courseTypeIcons[race.courseType] && (
                    <span title={`코스 타입: ${race.courseType}`}>{courseTypeIcons[race.courseType]}</span>
                )}
            </h2>
            <div 
                ref={logContainerRef}
                className="h-64 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 space-y-2 overflow-y-auto text-left font-mono text-sm border border-gray-200 dark:border-gray-700"
            >
                {log.map((entry, index) => {
                    const isPlayerEvent = entry.includes('당신') || (playerDriver && entry.includes(playerDriver.name));
                    const isSkillEvent = entry.includes('! ');
                    const isWeatherEvent = entry.includes('🌧️') || entry.includes('💧') || entry.includes('😱') || entry.includes('☀️');
                    const isCourseEvent = entry.includes('🛣️') || entry.includes('🔄') || entry.includes('⚖️');
                    const isConditionEvent = entry.includes('😊') || entry.includes('🙂') || entry.includes('😐') || entry.includes('😟');
                    const isPitStopEvent = entry.includes('🛠️') || entry.includes('🔧');

                    let style = 'text-gray-500 dark:text-gray-400';
                    if (isSkillEvent) style = 'text-yellow-400 font-bold';
                    else if(isPitStopEvent) style = 'text-green-400 font-semibold';
                    else if (isConditionEvent) style = 'text-orange-400 font-semibold';
                    else if (isWeatherEvent) style = 'text-sky-400 font-semibold';
                    else if (isCourseEvent) style = 'text-indigo-400 font-semibold';
                    else if (isPlayerEvent) style = 'text-blue-400 font-semibold';

                    return (
                        <p key={index} className={`animate-fade-in ${style}`}>
                           &gt; {entry}
                        </p>
                    );
                })}
            </div>
             <div className="mt-4 flex justify-between items-center gap-2">
                 <div className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>레이스 중계...</span>
                </div>
                <div className="flex items-center gap-2">
                    {playerDriver?.specialSkill === 'Overdrive' && (
                        <Button 
                            onClick={handleActivateSkill} 
                            disabled={skillUses <= 0}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:ring-purple-300 dark:focus:ring-purple-800 disabled:from-gray-500 disabled:to-gray-600"
                        >
                            오버드라이브 ({skillUses})
                        </Button>
                    )}
                    <Button 
                        onClick={handleSchedulePitStop} 
                        disabled={!pitStopAvailable || mechanicSkill <= 0}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:ring-gray-300 dark:focus:ring-gray-800 disabled:from-gray-400 disabled:to-gray-500"
                        title={mechanicSkill <= 0 ? "피트인을 하려면 미케닉이 필요합니다." : !pitStopAvailable ? "피트인은 레이스당 한 번만 가능합니다." : "다음 랩에서 피트인"}
                    >
                        피트인 🛠️
                    </Button>
                    <Button onClick={handleSkip} variant="secondary" className="px-4 py-2 text-sm">
                        결과 바로보기
                    </Button>
                </div>
            </div>
        </div>
        );
      case 'finished':
        const maxPerformance = results.length > 0 ? Math.max(...results.map(r => r.performance)) : 1;
        
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">레이스 결과</h2>
             <div className="text-6xl my-2">
              {playerRank === 1 ? '🏆' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : '🏁'}
            </div>
            <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
              당신은 <span className="font-bold text-blue-500">{playerRank}위</span>로 레이스를 마쳤습니다!
            </p>

            <div className="max-h-[55vh] overflow-y-auto space-y-4 p-1">
              <Card className="text-left bg-gray-100 dark:bg-gray-900/50 p-4">
                <h3 className="font-bold mb-3 text-lg text-center text-gray-800 dark:text-white">최종 순위</h3>
                <div className="space-y-2">
                  {results.map((r, i) => {
                    const rank = i + 1;
                    let rankIndicator: React.ReactNode = `${rank}`;
                    if (rank === 1) rankIndicator = '🥇';
                    if (rank === 2) rankIndicator = '🥈';
                    if (rank === 3) rankIndicator = '🥉';

                    return (
                      <div
                        key={i}
                        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${r.isPlayer ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 scale-105 shadow-lg' : 'bg-white dark:bg-gray-800 shadow-sm'}`}
                      >
                        <div className="flex items-center w-full">
                          <span className="font-bold text-lg w-12 text-center">{rankIndicator}</span>
                          <span className="text-2xl mx-2">{r.emoji}</span>
                          <span className={`font-semibold truncate ${r.isPlayer ? 'text-blue-800 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'}`}>{r.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="text-left bg-gray-100 dark:bg-gray-900/50 p-4">
                <h3 className="font-bold mb-3 text-lg text-center text-gray-800 dark:text-white">퍼포먼스 분석</h3>
                <div className="space-y-3">
                  {results.map(racer => (
                    <div key={racer.name} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-center">{racer.emoji}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                        <div
                          style={{ width: `${(racer.performance / maxPerformance) * 100}%` }}
                          className={`h-6 rounded-full flex items-center justify-between px-2 transition-width duration-1000 ease-out ${racer.isPlayer ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                        >
                          <span className="font-bold text-white text-xs truncate">{racer.name}</span>
                        </div>
                      </div>
                      <span className="w-10 text-right font-mono text-xs">{racer.performance.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {playerPerformanceBreakdown && (
                  <Card className="text-left bg-gray-100 dark:bg-gray-900/50 p-4">
                      <h3 className="font-bold mb-3 text-lg text-center text-gray-800 dark:text-white">내 기록 상세 분석</h3>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 flex overflow-hidden my-2">
                          <div
                              className="bg-green-500 flex items-center justify-center text-white text-xs font-bold transition-width duration-1000 ease-out"
                              style={{ width: `${(playerPerformanceBreakdown.carBase / playerPerformanceBreakdown.total) * 100}%`}}
                              title={`차량 성능: ${playerPerformanceBreakdown.carBase.toFixed(0)}`}
                          >
                          </div>
                          <div
                              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold transition-width duration-1000 ease-out"
                              style={{ width: `${(playerPerformanceBreakdown.driverBonus / playerPerformanceBreakdown.total) * 100}%`}}
                              title={`드라이버 보너스: +${playerPerformanceBreakdown.driverBonus.toFixed(0)}`}
                          >
                          </div>
                      </div>
                       <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>차량 성능 ({playerPerformanceBreakdown.carBase.toFixed(0)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span>드라이버 보너스 (+{playerPerformanceBreakdown.driverBonus.toFixed(0)})</span>
                          </div>
                           <div className="flex items-center gap-1.5">
                               <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <span>컨디션 보정 (x{playerPerformanceBreakdown.conditionModifier.toFixed(2)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                               <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                              <span>날씨 보정 (x{playerPerformanceBreakdown.weatherModifier.toFixed(2)})</span>
                          </div>
                      </div>
                  </Card>
              )}
            </div>

            <Button onClick={onClose} variant="primary" className="w-full text-lg mt-4">
              차고로 돌아가기
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-md">
        {renderContent()}
      </Card>
    </div>
  );
};

export default RaceModal;
