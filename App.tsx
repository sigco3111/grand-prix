


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Screen, Car, Staff, Race, StaffType, PartType, Part, Contract, ActiveContract, ResearchItem, RivalTeam, Aura, TeamTrait } from './types';
import { INITIAL_GAME_STATE, STAFF_POOL, AVAILABLE_RACES, UPGRADE_COST_BASE, UPGRADE_COST_MULTIPLIER, RESEARCH_ITEMS, CAR_PARTS, REPAIR_COST_PER_POINT, SPONSOR_OFFERS, FACILITIES_DATA, RIVAL_TEAMS, CHAMPIONSHIP_POINT_SYSTEM, CHAMPIONSHIP_END_OF_SEASON_PRIZE, AVAILABLE_AURAS, TEAM_TRAITS } from './constants';
import { Card, Button, StatDisplay } from './components/common';
import RaceModal from './components/RaceModal';
import CarSelectionModal from './components/CarSelectionModal';
import DriverSelectionModal from './components/DriverSelectionModal';
import PartSelectionModal from './components/PartSelectionModal';
import HelpModal from './components/HelpModal';

// --- Type Definitions ---
interface SeasonStanding {
  name: string;
  emoji: string;
  points: number;
  isPlayer: boolean;
}
interface EndOfSeasonReportData {
  finalStandings: SeasonStanding[];
  champion: SeasonStanding;
  income: number;
  expenses: number;
}
type CarWithStats = Car & {
  partBonuses: { speed: number; acceleration: number; handling: number; };
  totalStats: { speed: number; acceleration: number; handling: number; };
  equippedPartsMap: { engine?: Part; tire?: Part; chassis?: Part; };
};


// --- Helper Components (defined outside App to prevent re-creation) ---

interface HeaderProps {
  gameState: GameState;
  onSave: () => void;
  onLoad: () => void;
  isLoadable: boolean;
}
const Header: React.FC<HeaderProps> = ({ gameState, onSave, onLoad, isLoadable }) => (
  <header className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 mb-6">
    <div className="flex flex-wrap justify-between items-center gap-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white">{gameState.teamName} 🏁</h1>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <span className="font-bold text-lg text-yellow-500">💰 {gameState.money.toLocaleString()}</span>
        <span className="font-bold text-lg text-purple-500">🔬 {gameState.researchPoints.toLocaleString()}</span>
        <span className="font-semibold text-md text-gray-600 dark:text-gray-300">📅 {gameState.currentDate.year}년 {gameState.currentDate.month}월</span>
         <div className="flex items-center gap-2">
            <button onClick={onSave} className="text-lg bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" title="게임 저장">💾</button>
            <button onClick={onLoad} disabled={!isLoadable} className="text-lg bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed" title="게임 불러오기">📂</button>
        </div>
      </div>
    </div>
  </header>
);

interface NavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}
const Nav: React.FC<NavProps> = ({ activeScreen, setActiveScreen }) => {
    const navItems: { id: Screen; label: string; icon: string }[] = [
        { id: 'garage', label: '차고', icon: '🔧' },
        { id: 'race', label: '레이스', icon: '🏆' },
        { id: 'championship', label: '챔피언십', icon: '📈' },
        { id: 'research', label: '연구', icon: '🔬' },
        { id: 'sponsors', label: '스폰서', icon: '🤝' },
        { id: 'facilities', label: '시설', icon: '🏗️' },
        { id: 'aura', label: '오라', icon: '✨' },
        { id: 'hire', label: '고용', icon: '📝' },
    ];
    return (
        <nav className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-6">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveScreen(item.id)}
                    className={`px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-bold rounded-lg transition-all duration-200 ${activeScreen === item.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    <span className="mr-2">{item.icon}</span>{item.label}
                </button>
            ))}
        </nav>
    );
};

const getDurabilityColor = (durability: number, maxDurability: number): string => {
    const ratio = durability / maxDurability;
    if (ratio > 0.5) return 'text-green-500';
    if (ratio > 0.2) return 'text-yellow-500';
    return 'text-red-500';
};

const StatDisplayWithBonus: React.FC<{ icon: string; label: string; baseValue: number; bonusValue: number; color: string; }> = ({ icon, label, baseValue, bonusValue, color }) => (
    <div className="flex items-center space-x-2">
        <span className="text-xl">{icon}</span>
        <span className="font-medium text-gray-600 dark:text-gray-400">{label}:</span>
        <span className={`font-bold text-lg ${color}`}>{baseValue + bonusValue}</span>
        {bonusValue > 0 && <span className="text-sm font-medium text-green-500">(+{bonusValue})</span>}
        {bonusValue < 0 && <span className="text-sm font-medium text-red-500">({bonusValue})</span>}
    </div>
);

interface GarageScreenProps {
    carsWithStats: CarWithStats[];
    gameState: GameState;
    onUpgradeCar: (carId: number) => void;
    onRepairCar: (carId: number) => void;
    onOpenPartSelection: (carId: number, partType: PartType) => void;
    mechanicEffects: { costReductionPercent: number; additionalUpgradePower: number; };
    unlockedTeamTraits: TeamTrait[];
}
const GarageScreen: React.FC<GarageScreenProps> = ({ carsWithStats, gameState, onUpgradeCar, onRepairCar, onOpenPartSelection, mechanicEffects, unlockedTeamTraits }) => {
    const garageCapacity = FACILITIES_DATA.garage.levels.find(l => l.level === gameState.facilities.garage)?.effect || 1;
    const conditionEmojis: { [key: string]: string } = { '최상': '😊', '좋음': '🙂', '보통': '😐', '나쁨': '😟' };

    return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">보유 차량 🏎️</h2>
              <span className="font-bold text-gray-500 dark:text-gray-400">
                {gameState.cars.length} / {garageCapacity}
              </span>
            </div>
            <div className="space-y-4">
                {carsWithStats.map(car => {
                    const upgradeBaseCost = UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, car.upgrades);
                    const upgradeFinalCost = Math.round(upgradeBaseCost * (1 - mechanicEffects.costReductionPercent));
                    const canAffordUpgrade = gameState.money >= upgradeFinalCost && car.upgrades < car.maxUpgrades;

                    const pointsToRepair = car.maxDurability - car.durability;
                    const repairBaseCost = pointsToRepair * REPAIR_COST_PER_POINT;
                    const repairFinalCost = Math.round(repairBaseCost * (1 - mechanicEffects.costReductionPercent));
                    const canAffordRepair = gameState.money >= repairFinalCost && pointsToRepair > 0;

                    return (
                        <Card key={car.id} className="bg-gray-50 dark:bg-gray-700">
                            <h3 className="text-xl font-bold mb-2">{car.emoji} {car.name}</h3>
                            <div className="space-y-2 text-sm">
                               <StatDisplayWithBonus icon="⚡️" label="속도" baseValue={car.speed} bonusValue={car.partBonuses.speed} color="text-red-500" />
                                <StatDisplayWithBonus icon="💨" label="가속" baseValue={car.acceleration} bonusValue={car.partBonuses.acceleration} color="text-blue-500" />
                                <StatDisplayWithBonus icon="🔄" label="핸들링" baseValue={car.handling} bonusValue={car.partBonuses.handling} color="text-green-500" />
                                <StatDisplay icon="🛡️" label="내구도" value={`${car.durability} / ${car.maxDurability}`} color={getDurabilityColor(car.durability, car.maxDurability)} />
                            </div>
                            <div className="mt-4">
                                {mechanicEffects.additionalUpgradePower > 0 && car.upgrades < car.maxUpgrades && (
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center mb-2">
                                        🔧 미케닉 보너스: 스탯 +{mechanicEffects.additionalUpgradePower} & 비용 할인!
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => onUpgradeCar(car.id)} disabled={!canAffordUpgrade} className="w-full text-sm">
                                        업그레이드 ({car.upgrades}/{car.maxUpgrades}) -{' '}
                                        {mechanicEffects.costReductionPercent > 0 && upgradeBaseCost.toFixed(0) !== upgradeFinalCost.toFixed(0) ? (
                                            <>
                                                <span className="line-through opacity-70 mr-1">💰{upgradeBaseCost.toFixed(0)}</span>
                                                <span>💰{upgradeFinalCost.toFixed(0)}</span>
                                            </>
                                        ) : (
                                            `💰${upgradeBaseCost.toFixed(0)}`
                                        )}
                                    </Button>
                                    <Button onClick={() => onRepairCar(car.id)} disabled={!canAffordRepair} variant="secondary" className="w-full text-sm">
                                        수리하기 -{' '}
                                        {mechanicEffects.costReductionPercent > 0 && repairBaseCost > 0 ? (
                                             <>
                                                <span className="line-through opacity-70 mr-1">💰{repairBaseCost.toFixed(0)}</span>
                                                <span>💰{repairFinalCost.toFixed(0)}</span>
                                            </>
                                        ) : (
                                            `💰${repairFinalCost.toFixed(0)}`
                                        )}
                                    </Button>
                                </div>
                            </div>
                             <div className="mt-6">
                                <h4 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">장착 파츠</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['Engine', 'Tire', 'Chassis'] as PartType[]).map(partType => {
                                        const equippedPart = car.equippedPartsMap[partType.toLowerCase() as keyof typeof car.equippedPartsMap];
                                        return (
                                            <button key={partType} onClick={() => onOpenPartSelection(car.id, partType)} className="w-full text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors flex items-center gap-3">
                                                <span className="text-xl">{equippedPart?.emoji || 'EMPTY'}</span>
                                                <span className="font-semibold">{partType === 'Engine' ? '엔진' : partType === 'Tire' ? '타이어' : '섀시'}:</span>
                                                <span className="ml-auto font-medium text-gray-700 dark:text-gray-300">{equippedPart?.name || '없음'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                 {gameState.cars.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 pt-8">보유한 차량이 없습니다. 연구를 통해 신차를 개발하세요.</p>}
            </div>
        </Card>
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">직원 🧑‍🔧</h2>
                <div className="space-y-4">
                    {gameState.staff.map(staff => (
                        <Card key={staff.id} className="bg-gray-50 dark:bg-gray-700">
                            <h3 className="text-xl font-bold mb-2">{staff.emoji} {staff.name}</h3>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">{staff.type}</p>
                            <div className="space-y-2 text-sm mt-2">
                                <StatDisplay icon="⭐" label="기술" value={staff.skill} color="text-yellow-500" />
                                {staff.specialSkill && (
                                <StatDisplay icon="✨" label="특수 스킬" value={staff.specialSkill} color="text-cyan-400" />
                                )}
                                {staff.type === StaffType.Driver && staff.condition && (
                                    <StatDisplay icon={conditionEmojis[staff.condition]} label="컨디션" value={staff.condition} color="text-orange-500" />
                                )}
                                <StatDisplay icon="💵" label="월급" value={staff.salary} color="text-green-500" />
                            </div>
                            {staff.type === StaffType.Driver && (
                                <div className="mt-3">
                                    <div className="flex justify-between mb-1 text-xs">
                                        <span className="font-medium text-gray-600 dark:text-gray-400">경험치</span>
                                        <span className="text-gray-500 dark:text-gray-400">{staff.experience} / {staff.nextLevelExp}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full" style={{ width: `${(staff.experience / staff.nextLevelExp) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </Card>
            {unlockedTeamTraits.length > 0 && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">팀 특성 🌟</h2>
                    <div className="space-y-3">
                        {unlockedTeamTraits.map(trait => (
                            <div key={trait.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <span className="text-2xl mt-1">{trait.emoji}</span>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">{trait.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{trait.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    </div>
);
}
interface RaceScreenProps {
    gameState: GameState;
    onSelectRace: (race: Race) => void;
}
const RaceScreen: React.FC<RaceScreenProps> = ({ gameState, onSelectRace }) => {
    const courseTypeIcons: { [key: string]: string } = {
        '고속': '🛣️',
        '테크니컬': '🔄',
        '밸런스': '⚖️',
    };
    
    return (
    <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">월드 투어 🗺️</h2>
        <div className="relative w-full h-[60vh] bg-blue-200 dark:bg-gray-800/80 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <svg width="100%" height="100%" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full text-blue-300 dark:text-gray-700 opacity-60">
                <path d="M73.8,251.2c-23.2-3.2-25.2-32.3-25.2-32.3c-1-17,4.8-27.2,4.8-27.2c-11.8-19-11.2-42-11.2-42c4.2-20.3,28.8-22.3,28.8-22.3l12.4,3.5l14.9-5.1c0,0,16.4-3.5,23.3,0c6.9,3.5,12.7,13,12.7,13l13,2.8l15.9-10.2c0,0,10.2-7.8,20.5-2.8s15.4,12,15.4,12l7.3,8.1l15.9-2.8c0,0,15.9-2.3,22.3,5.1c6.4,7.3,5.9,20,5.9,20l-2.8,19.5l14,3.3l12-3.3l13.5,8.9l-2.3,10.7l-14,2.8l-12.5,13.5l-6.8-5.6l-11.2,5.1l-10.7-1.7l-15.4-8.9l-12,5.1l-10.7-5.1l-13.5,3.3l-8.4,14.5l8.4,12l-1.7,4.5l-11.2,3.3l-10.7-5.6c0,0,15.4-8.4-28.8,1.7c-13.5,10.2-12.5,23.4-12.5,23.4l1.7,16.4l-10.2,6.2l-11.2-7.3l-9.6,2.8l-1.7,7.3l9.6,9.6l-1.7,7.8l-10.7-1.1l-3.3-11.2l-13-1.7l-4.5-8.4l-7.3,0.6l-2.8-5.1l3.3-8.9l-4.5-5.6l-6.2-1.1L73.8,251.2z M278.4,435.4c-13-10.7-5.1-24.5-5.1-24.5l10.2-22.3l-1.7-17.8l-13-11.2l-10.2,4.5l-3.3-12.5l10.2-10.7l-1.7-14l-11.2,1.7l-1.7-11.2l-12.5-3.3l-8.9-12.5l7.3-12l-3.3-7.8l-11.2-1.7l-8.4,7.3l-8.4-1.7l-12,12l-8.4-1.7l-7.3-8.9l-11.2-1.7l-10.7,5.6l-14.5-8.4l-13,10.7l-2.8-13.5l-12-1.7l-10.2,10.7l1.7,8.4l-10.2,7.3l-4,17.3l14,16.4l-1.7,7.3L135,394.5l-1.7,13.5l13.5,16.4l13.5-1.7l15.4,12l10.7-8.4l12,1.7l12.5,11.2l20.5-3.3l2.8,8.4l12,1.7l10.7,10.2l14.5-1.7L278.4,435.4z M934.5,450.4c-4-15.4-15.4-18.7-15.4-18.7l-17.3-2.8l-16.4,8.4l-1.7-11.2l-11.2-3.3l-11.2,5.1l-4-5.1l-10.7-1.7l-11.2,3.3l-13.5-8.4l-13.5,5.1l-8.4-12l-12,5.1l-12.5-14.5l-10.2,1.7l-7.3,8.4l-1.7-17.3l-12-14l-12.5,1.7l-13.5-11.2l-12.5,1.7l-14.5-7.3l-12.5,8.4l-12-12l-15.4,1.7l-10.7,13.5l-2.8-8.4l-12.5-11.2l-13.5-1.7l-12,10.2l-11.2-8.4l-12.5-1.7l-12.5,8.4l-16.4-8.4l-15.4,11.2l-8.4-10.2l-12.5-3.3l-12.5-11.2l-12.5-12l-8.4,5.1l-14.5-10.2l-12.5-15.4l1.7-20l12-13l13-2.8l10.7,3.3l13-8.4l13.5,2.8l11.2-13.5l11.2-3.3l14.5,8.4l10.2-10.2l12.5,5.1l12-5.1l13-11.2l13.5-1.7l12.5,10.2l12.5-1.7l13.5,10.2l12-8.4l12.5,5.1l11.2-12l12.5-3.3l13.5-8.4l11.2,1.7l12,11.2l13.5,1.7l12-10.2l13-1.7l12.5,12l12-3.3l12.5-10.2l13-1.7l11.2,12.5l13.5,1.7l12.5-12.5l13,5.1l12-1.7l13.5-10.2l12.5-1.7l12,12l13.5-1.7l12.5,12l13.5-1.7l12-12.5l13,5.1l12.5-1.7l12.5-12l13.5-1.7l12.5,12l13-1.7l12-12z" fill="currentColor"></path>
            </svg>

            {AVAILABLE_RACES.map(race => {
                const isLocked = gameState.highestRankAchieved > race.requiredRank;
                const canAfford = gameState.money >= race.entryFee;
                const hasRaceReadyCars = gameState.cars.some(c => c.durability > 0);
                const isDisabled = isLocked || !canAfford || !hasRaceReadyCars;
                
                let buttonText = `참가 (💰${race.entryFee})`;
                if (!hasRaceReadyCars) buttonText = '🏎️ 수리 필요';
                else if (!canAfford) buttonText = '💰 부족';

                return (
                    <div
                        key={race.id}
                        className="absolute group transform -translate-x-1/2 -translate-y-1/2"
                        style={{ top: race.position.top, left: race.position.left }}
                    >
                         <div className={`relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ${isLocked ? 'bg-gray-500' : 'bg-red-500 animate-pulse hover:scale-110'}`}>
                            <span className="text-lg drop-shadow-lg">{isLocked ? '🔒' : '📍'}</span>
                        </div>
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-0 
                                       opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-10">
                             <Card className="!p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm !shadow-2xl border border-gray-300 dark:border-gray-600">
                                <h3 className="text-xl font-bold">{race.name}</h3>
                                <div className="text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-4">
                                  <span className="flex items-center gap-1">난이도: {'🔥'.repeat(race.difficulty)}</span>
                                  {race.weather && (
                                      <span className="text-lg" title={`날씨: ${race.weather}`}>{race.weather === '비' ? '🌧️' : '☀️'}</span>
                                  )}
                                  {race.courseType && courseTypeIcons[race.courseType] && (
                                      <span className="text-lg" title={`코스 타입: ${race.courseType}`}>
                                          {courseTypeIcons[race.courseType]}
                                      </span>
                                  )}
                                </div>
                                <div className="mt-3 flex justify-between text-sm">
                                    <p className="text-green-500 font-bold">상금: 💰{race.prizeMoney.toLocaleString()}</p>
                                    <p className="text-purple-500 font-bold">RP: 🔬{race.researchPoints.toLocaleString()}</p>
                                </div>
                                {isLocked && <p className="text-xs text-red-500 mt-2 font-bold text-center">{race.requiredRank}위 이상 달성 필요</p>}
                                <Button className="mt-3 w-full" onClick={() => onSelectRace(race)} disabled={isDisabled}>
                                    {buttonText}
                                </Button>
                            </Card>
                        </div>
                    </div>
                );
            })}
        </div>
    </Card>
)};

interface ChampionshipScreenProps {
  gameState: GameState;
}
const ChampionshipScreen: React.FC<ChampionshipScreenProps> = ({ gameState }) => {
    const playerStanding: SeasonStanding = {
      name: gameState.teamName,
      emoji: '🧑‍🚀',
      points: gameState.championshipPoints,
      isPlayer: true
    };
    const standings = [...gameState.rivalTeams.map(r => ({...r, isPlayer: false})), playerStanding]
        .sort((a,b) => b.points - a.points);
        
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">챔피언십 순위 📈</h2>
            <div className="space-y-2">
                {standings.map((team, index) => {
                    const rank = index + 1;
                    let rankIndicator: React.ReactNode = `${rank}`;
                    if (rank === 1) rankIndicator = '🥇';
                    if (rank === 2) rankIndicator = '🥈';
                    if (rank === 3) rankIndicator = '🥉';

                    return (
                        <div key={team.name} className={`flex items-center p-3 rounded-lg transition-all duration-200 ${team.isPlayer ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 scale-105 shadow-lg' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
                            <span className="font-bold text-lg w-12 text-center">{rankIndicator}</span>
                            <span className="text-2xl mx-2">{team.emoji}</span>
                            <span className={`flex-1 font-semibold truncate ${team.isPlayer ? 'text-blue-800 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'}`}>{team.name}</span>
                            <span className="font-bold text-lg text-purple-500">{team.points} pts</span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};


interface ResearchScreenProps {
    gameState: GameState;
    researchedIds: Set<string>;
    onResearch: (item: ResearchItem) => void;
    mechanicEffects: { costReductionPercent: number };
}
const ResearchScreen: React.FC<ResearchScreenProps> = ({ gameState, researchedIds, onResearch, mechanicEffects }) => {
    const visibleResearchItems = RESEARCH_ITEMS.filter(item => 
        (item.requiredResearchLabLevel || 1) <= gameState.facilities.researchLab
    );

    return (
    <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">연구 & 개발 🔬</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleResearchItems.map(item => {
                const isResearched = researchedIds.has(item.id) || (item.partId && gameState.unlockedPartIds.includes(item.partId)) || (item.teamTraitId && gameState.unlockedTeamTraitIds.includes(item.teamTraitId));
                const baseCost = item.cost;
                const finalCost = Math.round(baseCost * (1 - mechanicEffects.costReductionPercent));
                const canAfford = gameState.researchPoints >= finalCost;

                const unmetPrereqs = item.requiredResearchIds?.filter(id => !researchedIds.has(id)) || [];
                const arePrerequisitesMet = unmetPrereqs.length === 0;

                const unmetPrereqNames = unmetPrereqs.map(id => RESEARCH_ITEMS.find(i => i.id === id)?.name).filter(Boolean);
                const lockReason = !arePrerequisitesMet ? `선행 연구 필요: ${unmetPrereqNames.join(', ')}` : '';
                
                let description = '';
                if (item.partId) {
                    const part = CAR_PARTS.find(p => p.id === item.partId);
                    if (part) {
                        const stats = Object.entries(part.stats).filter(([, val]) => val !== 0)
                            .map(([key, val]) => `${key === 'speed' ? '속도' : key === 'acceleration' ? '가속' : '핸들링'} ${val > 0 ? '+' : ''}${val}`).join(', ');
                        description = `${part.emoji} ${stats}`;
                    }
                } else if (item.car) {
                    description = `${item.car.emoji} ${item.car.name} 해금`;
                } else if (item.teamTraitId) {
                    const trait = TEAM_TRAITS.find(t => t.id === item.teamTraitId);
                    if (trait) {
                        description = `${trait.emoji} ${trait.description}`;
                    }
                }

                return (
                    <Card key={item.id} className={`flex flex-col justify-between transition-opacity ${isResearched ? 'bg-gray-200 dark:bg-gray-900 opacity-60' : 'bg-gray-50 dark:bg-gray-700'} ${!isResearched && !arePrerequisitesMet ? 'opacity-75' : ''}`}>
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold">{item.name}</h3>
                                {!arePrerequisitesMet && <span className="text-xl" title={lockReason}>🔒</span>}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 min-h-[3rem]">
                                {description}
                            </p>
                            {!arePrerequisitesMet && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-2">
                                  {lockReason}
                                </p>
                            )}
                            {mechanicEffects.costReductionPercent > 0 && !isResearched && arePrerequisitesMet && (
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">
                                  🔧 미케닉 비용 할인 적용!
                                </p>
                            )}
                        </div>
                        <Button className="mt-4" onClick={() => onResearch(item)} disabled={isResearched || !canAfford || !arePrerequisitesMet} title={lockReason}>
                             {isResearched ? '연구 완료' : (
                                mechanicEffects.costReductionPercent > 0 && baseCost !== finalCost ? (
                                    <>
                                        <span className="line-through opacity-70 mr-1.5">🔬 {baseCost} RP</span>
                                        <span>🔬 {finalCost} RP</span>
                                    </>
                                ) : (
                                    `🔬 ${baseCost} RP`
                                )
                            )}
                        </Button>
                    </Card>
                );
            })}
        </div>
        {visibleResearchItems.length < RESEARCH_ITEMS.length && (
            <div className="text-center mt-6 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                <p className="font-semibold text-gray-700 dark:text-gray-300">더 높은 수준의 연구를 진행하려면 연구소를 업그레이드하세요.</p>
            </div>
        )}
    </Card>
)};

interface SponsorsScreenProps {
  gameState: GameState;
  onSignContract: (contract: Contract) => void;
}
const SponsorsScreen: React.FC<SponsorsScreenProps> = ({ gameState, onSignContract }) => (
    <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">스폰서 계약 🤝</h2>
        {gameState.activeContract ? (
             <Card className="bg-blue-50 dark:bg-blue-900/50 text-center">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">현재 계약</h3>
                <div className="my-4 text-4xl">{gameState.activeContract.sponsorEmoji}</div>
                <p className="text-2xl font-bold">{gameState.activeContract.sponsorName}</p>
                <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                    <p>레이스당 지급: <span className="font-bold text-green-500">💰{gameState.activeContract.perRacePayout.toLocaleString()}</span></p>
                    <p>승리 보너스: <span className="font-bold text-yellow-500">💰{gameState.activeContract.winBonus.toLocaleString()}</span></p>
                    <p>남은 계약 레이스: <span className="font-bold text-purple-500">{gameState.activeContract.racesRemaining}</span></p>
                </div>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SPONSOR_OFFERS.map(offer => (
                    <Card key={offer.id} className="bg-gray-50 dark:bg-gray-700 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2">{offer.sponsorEmoji} {offer.sponsorName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-16">{offer.description}</p>
                            <div className="space-y-1 text-sm">
                                <p><strong>계약 보너스:</strong> <span className="text-green-500">💰{offer.signingBonus.toLocaleString()}</span></p>
                                <p><strong>레이스당 지급:</strong> <span className="text-green-500">💰{offer.perRacePayout.toLocaleString()}</span></p>
                                <p><strong>승리 보너스:</strong> <span className="text-yellow-500">💰{offer.winBonus.toLocaleString()}</span></p>
                                <p><strong>계약 기간:</strong> <span className="text-purple-500">{offer.duration} 레이스</span></p>
                            </div>
                        </div>
                        <Button onClick={() => onSignContract(offer)} variant="primary" className="w-full mt-4">
                            계약 수락
                        </Button>
                    </Card>
                ))}
            </div>
        )}
    </Card>
);

interface FacilitiesScreenProps {
  gameState: GameState;
  onUpgradeFacility: (facilityId: keyof GameState['facilities']) => void;
}
const FacilitiesScreen: React.FC<FacilitiesScreenProps> = ({ gameState, onUpgradeFacility }) => {
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">시설 투자 🏗️</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(FACILITIES_DATA).map(facility => {
                    const currentLevel = gameState.facilities[facility.id as keyof GameState['facilities']];
                    const isMaxLevel = currentLevel >= facility.maxLevel;
                    const nextLevelInfo = facility.levels.find(l => l.level === currentLevel + 1);
                    const canAfford = nextLevelInfo?.cost ? gameState.money >= nextLevelInfo.cost.money && gameState.researchPoints >= nextLevelInfo.cost.rp : false;

                    let buttonText = '업그레이드';
                    if (currentLevel === 0) buttonText = '건설';
                    if (isMaxLevel) buttonText = '최대 레벨';

                    return (
                        <Card key={facility.id} className="bg-gray-50 dark:bg-gray-700 flex flex-col">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold mb-2">{facility.emoji} {facility.name}</h3>
                                <p className="text-sm font-semibold text-blue-500 mb-3">현재 레벨: {currentLevel}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-12">
                                    {facility.levels.find(l => l.level === currentLevel)?.description}
                                </p>
                                {!isMaxLevel && nextLevelInfo && (
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                        <p className="font-bold text-md text-gray-800 dark:text-gray-200">다음 레벨: {nextLevelInfo.level}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{nextLevelInfo.description}</p>
                                        {nextLevelInfo.cost && (
                                          <div className="mt-3 text-sm font-semibold">
                                            <span className="mr-4">💰 {nextLevelInfo.cost.money.toLocaleString()}</span>
                                            <span>🔬 {nextLevelInfo.cost.rp.toLocaleString()}</span>
                                          </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={() => onUpgradeFacility(facility.id as keyof GameState['facilities'])}
                                disabled={isMaxLevel || !canAfford}
                                variant="secondary"
                                className="w-full mt-4"
                            >
                                {buttonText}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </Card>
    );
};

interface HireScreenProps {
    gameState: GameState;
    onHire: (staffId: number) => void;
}
const HireScreen: React.FC<HireScreenProps> = ({ gameState, onHire }) => {
    const hiredIds = new Set(gameState.staff.map(s => s.id));
    const availableStaff = STAFF_POOL.filter(s => !hiredIds.has(s.id));

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">고용 센터 📝</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableStaff.map(staff => (
                    <Card key={staff.id} className="bg-gray-50 dark:bg-gray-700 flex flex-col justify-between">
                         <div>
                            <h3 className="text-xl font-bold mb-2">{staff.emoji} {staff.name}</h3>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">{staff.type}</p>
                            <div className="space-y-2 text-sm mt-2">
                                <StatDisplay icon="⭐" label="기술" value={staff.skill} color="text-yellow-500" />
                                {staff.specialSkill && (
                                  <StatDisplay icon="✨" label="특수 스킬" value={staff.specialSkill} color="text-cyan-400" />
                                )}
                                <StatDisplay icon="💵" label="월급" value={staff.salary} color="text-green-500" />
                            </div>
                        </div>
                        <Button className="mt-4" onClick={() => onHire(staff.id)}>
                            고용
                        </Button>
                    </Card>
                ))}
                {availableStaff.length === 0 && <p className="text-gray-500 dark:text-gray-400">고용할 수 있는 사람이 없습니다.</p>}
            </div>
        </Card>
    );
};

interface AuraScreenProps {
  activeAuraId: string | null;
  onSelectAura: (auraId: string) => void;
}
const AuraScreen: React.FC<AuraScreenProps> = ({ activeAuraId, onSelectAura }) => (
  <Card>
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">오라 선택 ✨</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">팀에 적용할 오라를 하나 선택하세요. 오라는 팀 전체에 이로운 효과를 부여하며, 언제든지 변경할 수 있습니다.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {AVAILABLE_AURAS.map(aura => {
        const isActive = activeAuraId === aura.id;
        return (
          <Card 
            key={aura.id} 
            className={`flex flex-col justify-between cursor-pointer transition-all duration-200 ${isActive ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 scale-105' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`} 
            onClick={() => onSelectAura(aura.id)}
            role="button"
            aria-pressed={isActive}
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectAura(aura.id)}
          >
            <div>
              <h3 className="text-xl font-bold mb-2">{aura.emoji} {aura.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 min-h-[40px]">{aura.description}</p>
            </div>
            <div className="text-center mt-auto">
              <span className={`font-bold text-sm py-1 px-3 rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
                {isActive ? '활성 중' : '선택하기'}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  </Card>
);


const GameOverScreen: React.FC<{ onRestart: () => void; }> = ({ onRestart }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4 z-[100] animate-fade-in" style={{ backdropFilter: 'blur(4px)' }}>
        <Card className="text-center max-w-md w-full">
            <h2 className="text-5xl font-extrabold mb-4 text-red-500">게임 오버</h2>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                자금이 부족하여 팀을 더 이상 운영할 수 없습니다.
            </p>
            <Button onClick={onRestart} variant="primary" className="text-lg w-full">
                다시 시작하기
            </Button>
        </Card>
    </div>
);

interface EndOfSeasonReportModalProps {
  report: EndOfSeasonReportData;
  onContinue: () => void;
}
const EndOfSeasonReportModal: React.FC<EndOfSeasonReportModalProps> = ({ report, onContinue }) => {
  const { finalStandings, champion, income, expenses } = report;
  const playerResult = finalStandings.find(s => s.isPlayer);
  const playerRank = finalStandings.findIndex(s => s.isPlayer) + 1;
  const netProfit = income - expenses;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[100] animate-fade-in" style={{ backdropFilter: 'blur(4px)' }}>
      <Card className="w-full max-w-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">시즌 결산</h2>
          <p className="text-lg mb-6 text-gray-500 dark:text-gray-400">올해의 챔피언십이 종료되었습니다!</p>
          
          <div className="my-6">
            <div className="text-6xl animate-bounce">🏆</div>
            <p className="text-xl mt-2">올해의 챔피언</p>
            <p className="text-3xl font-bold text-yellow-500">{champion.emoji} {champion.name}</p>
          </div>
          
          {playerResult && champion.name === playerResult.name && (
            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg mb-6">
              <p className="font-bold text-green-800 dark:text-green-200">챔피언 등극을 축하합니다!</p>
              <p className="text-green-600 dark:text-green-300">
                특별 보너스 💰{CHAMPIONSHIP_END_OF_SEASON_PRIZE.money.toLocaleString()}와 🔬{CHAMPIONSHIP_END_OF_SEASON_PRIZE.rp.toLocaleString()}가 지급됩니다!
              </p>
            </div>
          )}

          <div className="max-h-[45vh] overflow-y-auto space-y-4 p-1">
            <Card className="text-left bg-gray-100 dark:bg-gray-800 p-4">
              <h3 className="font-bold text-lg mb-2 text-center">최종 순위</h3>
              {finalStandings.map((team, index) => {
                  const rank = index + 1;
                  let rankIndicator: React.ReactNode = `${rank}`;
                  if (rank === 1) rankIndicator = '🥇';
                  if (rank === 2) rankIndicator = '🥈';
                  if (rank === 3) rankIndicator = '🥉';

                  return (
                      <div key={team.name} className={`flex items-center p-3 rounded-lg ${team.isPlayer ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <span className="font-bold text-lg w-12 text-center">{rankIndicator}</span>
                          <span className="text-2xl mx-2">{team.emoji}</span>
                          <span className="flex-1 font-semibold truncate text-left">{team.name}</span>
                          <span className="font-bold text-lg text-purple-500">{team.points} pts</span>
                      </div>
                  );
              })}
            </Card>

            <Card className="text-left bg-gray-100 dark:bg-gray-800 p-4">
              <h3 className="font-bold text-lg mb-3 text-center">시즌 재정 보고서 💰</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                  <span className="font-medium text-green-700 dark:text-green-300">총 수입:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">+{income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/30 rounded-md">
                  <span className="font-medium text-red-700 dark:text-red-300">총 지출:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">-{expenses.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 my-2 pt-2 flex justify-between font-bold text-base">
                  <span>순이익:</span>
                  <span className={netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}>
                    {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
          
          <Button onClick={onContinue} variant="primary" className="w-full text-lg mt-6">
            다음 시즌으로
          </Button>
        </div>
      </Card>
    </div>
  );
};


// --- Main App Component ---

const SAVE_KEY = 'grandPrixStorySaveData';

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [activeScreen, setActiveScreen] = useState<Screen>('garage');
  const [notification, setNotification] = useState<string | null>(null);
  
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedCarForRace, setSelectedCarForRace] = useState<Car | null>(null);
  const [selectedDriverForRace, setSelectedDriverForRace] = useState<Staff | null>(null);
  const [raceForCarSelection, setRaceForCarSelection] = useState<Race | null>(null);
  const [raceAndCarForDriverSelection, setRaceAndCarForDriverSelection] = useState<{ race: Race; car: CarWithStats } | null>(null);
  const [partSelection, setPartSelection] = useState<{ carId: number; partType: PartType } | null>(null);

  const [researchedIds, setResearchedIds] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [isLoadable, setIsLoadable] = useState(false);
  
  const [endOfSeasonReport, setEndOfSeasonReport] = useState<EndOfSeasonReportData | null>(null);
  const stateToApplyAfterReport = useRef<GameState | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    const savedJSON = localStorage.getItem(SAVE_KEY);
    setIsLoadable(!!savedJSON);

    if (savedJSON) {
        try {
            const saveData = JSON.parse(savedJSON);
            // Merge with initial state to handle new properties added in updates
            const loadedGameState = { ...INITIAL_GAME_STATE, ...saveData.gameState };

            setGameState(loadedGameState);
            setResearchedIds(new Set(saveData.researchedIds || []));
            setActiveScreen('garage');
            setGameOver(false); // Reset game over state
            setNotification("저장된 게임을 자동으로 불러왔습니다.");
          } catch(error) {
             console.error("Failed to auto-load game:", error);
             setNotification("저장 파일 불러오기에 실패했습니다. 새 게임을 시작합니다.");
             localStorage.removeItem(SAVE_KEY);
             setIsLoadable(false);
          }
    }
  }, []);

  const teamTraitEffects = useMemo(() => {
      const effects = {
          pitStopTimeReduction: 0,
          durabilityLossModifier: 1,
          sponsorPayoutModifier: 1,
          allCarsHandlingBonus: 0,
      };
      
      if (!gameState.unlockedTeamTraitIds) return effects;

      for (const traitId of gameState.unlockedTeamTraitIds) {
          const trait = TEAM_TRAITS.find(t => t.id === traitId);
          if (trait) {
              if (trait.pitStopTimeReduction) effects.pitStopTimeReduction += trait.pitStopTimeReduction;
              if (trait.durabilityLossModifier) effects.durabilityLossModifier *= trait.durabilityLossModifier;
              if (trait.sponsorPayoutModifier) effects.sponsorPayoutModifier *= trait.sponsorPayoutModifier;
              if (trait.allCarsHandlingBonus) effects.allCarsHandlingBonus += trait.allCarsHandlingBonus;
          }
      }
      return effects;
  }, [gameState.unlockedTeamTraitIds]);

  const carsWithCalculatedStats = useMemo(() => {
    return gameState.cars.map(car => {
      const partBonuses = { speed: 0, acceleration: 0, handling: 0 };
      const equippedPartsMap: { engine?: Part, tire?: Part, chassis?: Part } = {};

      const engine = CAR_PARTS.find(p => p.id === car.equippedParts.engine);
      const tire = CAR_PARTS.find(p => p.id === car.equippedParts.tire);
      const chassis = CAR_PARTS.find(p => p.id === car.equippedParts.chassis);

      if (engine) {
          partBonuses.speed += engine.stats.speed;
          partBonuses.acceleration += engine.stats.acceleration;
          partBonuses.handling += engine.stats.handling;
          equippedPartsMap.engine = engine;
      }
      if (tire) {
          partBonuses.speed += tire.stats.speed;
          partBonuses.acceleration += tire.stats.acceleration;
          partBonuses.handling += tire.stats.handling;
          equippedPartsMap.tire = tire;
      }
      if (chassis) {
          partBonuses.speed += chassis.stats.speed;
          partBonuses.acceleration += chassis.stats.acceleration;
          partBonuses.handling += chassis.stats.handling;
          equippedPartsMap.chassis = chassis;
      }

      partBonuses.handling += teamTraitEffects.allCarsHandlingBonus;
      
      const carWithStats: CarWithStats = {
        ...car,
        partBonuses,
        totalStats: {
          speed: car.speed + partBonuses.speed,
          acceleration: car.acceleration + partBonuses.acceleration,
          handling: car.handling + partBonuses.handling,
        },
        equippedPartsMap
      };
      return carWithStats;
    });
  }, [gameState.cars, teamTraitEffects]);

  const mechanicEffects = useMemo(() => {
    const totalMechanicSkill = gameState.staff
      .filter(s => s.type === StaffType.Mechanic)
      .reduce((acc, s) => acc + s.skill, 0);

    const costReductionPercent = Math.min(0.5, totalMechanicSkill / 400); 
    const additionalUpgradePower = Math.floor(totalMechanicSkill / 50);

    return { costReductionPercent, additionalUpgradePower };
  }, [gameState.staff]);

  const activeAura = useMemo(() => {
    if (!gameState.activeAuraId) return null;
    return AVAILABLE_AURAS.find(a => a.id === gameState.activeAuraId) || null;
  }, [gameState.activeAuraId]);

  const totalMechanicSkill = useMemo(() => {
    return gameState.staff
      .filter(s => s.type === StaffType.Mechanic)
      .reduce((acc, s) => acc + s.skill, 0);
  }, [gameState.staff]);

  const handleSave = useCallback(() => {
    if (gameOver) return;
    try {
        const saveData = {
            gameState,
            researchedIds: Array.from(researchedIds),
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        setIsLoadable(true);
        setNotification("게임이 저장되었습니다.");
    } catch (error) {
        console.error("Failed to save game:", error);
        setNotification("게임 저장에 실패했습니다.");
    }
  }, [gameState, researchedIds, gameOver]);

  const handleLoad = useCallback(() => {
      const savedJSON = localStorage.getItem(SAVE_KEY);
      if (savedJSON) {
          try {
            const saveData = JSON.parse(savedJSON);
            // Merge with initial state to handle new properties added in updates
            const loadedGameState = { ...INITIAL_GAME_STATE, ...saveData.gameState };

            setGameState(loadedGameState);
            setResearchedIds(new Set(saveData.researchedIds || []));
            setActiveScreen('garage');
            setGameOver(false); // Reset game over state
            setNotification("게임을 불러왔습니다.");
          } catch(error) {
             console.error("Failed to load game:", error);
             setNotification("게임 불러오기에 실패했습니다. 저장 파일이 손상되었을 수 있습니다.");
             localStorage.removeItem(SAVE_KEY);
             setIsLoadable(false);
          }
      } else {
          setNotification("저장된 게임이 없습니다.");
      }
  }, []);

  useEffect(() => {
    if (!gameOver && gameState.money < 0) {
        setGameOver(true);
        setSelectedRace(null);
        setRaceForCarSelection(null);
        setNotification("게임 오버! 자금이 부족합니다.");
        setGameState(prev => ({ ...prev, money: 0 }));
    }
  }, [gameState.money, gameOver]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const handleRestart = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
    setActiveScreen('garage');
    setResearchedIds(new Set());
    setGameOver(false);
    setNotification('새로운 게임을 시작합니다!');
  }, []);
  
  const handleUpgradeCar = useCallback((carId: number) => {
    if (gameOver) return;
    setGameState(prev => {
        const car = prev.cars.find(c => c.id === carId);
        if (!car) return prev;
        
        const baseCost = UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULTIPLIER, car.upgrades);
        const finalCost = Math.round(baseCost * (1 - mechanicEffects.costReductionPercent));

        if (prev.money < finalCost || car.upgrades >= car.maxUpgrades) {
            setNotification("차량을 업그레이드할 수 없습니다!");
            return prev;
        }

        const bonus = mechanicEffects.additionalUpgradePower;
        const updatedCars = prev.cars.map(c => 
            c.id === carId ? {
                ...c,
                speed: c.speed + 3 + bonus,
                acceleration: c.acceleration + 2 + bonus,
                handling: c.handling + 2 + bonus,
                upgrades: c.upgrades + 1
            } : c
        );
        
        let notificationMessage = `${car.name} 업그레이드 완료!`;
        if (bonus > 0) {
            notificationMessage += ` (미케닉 보너스 +${bonus}!)`
        }
        setNotification(notificationMessage);
        return { ...prev, cars: updatedCars, money: prev.money - finalCost, yearlyExpenses: prev.yearlyExpenses + finalCost };
    });
  }, [gameOver, mechanicEffects]);

  const handleRepairCar = useCallback((carId: number) => {
    if (gameOver) return;
    setGameState(prev => {
      const car = prev.cars.find(c => c.id === carId);
      if (!car || car.durability >= car.maxDurability) return prev;

      const pointsToRepair = car.maxDurability - car.durability;
      const baseCost = pointsToRepair * REPAIR_COST_PER_POINT;
      const finalCost = Math.round(baseCost * (1 - mechanicEffects.costReductionPercent));

      if (prev.money < finalCost) {
        setNotification("수리 비용이 부족합니다!");
        return prev;
      }

      const updatedCars = prev.cars.map(c => c.id === carId ? { ...c, durability: c.maxDurability } : c);
      setNotification(`${car.name} 수리 완료! 내구도가 완전히 회복되었습니다.`);
      return { ...prev, cars: updatedCars, money: prev.money - finalCost, yearlyExpenses: prev.yearlyExpenses + finalCost };
    });
  }, [gameOver, mechanicEffects]);

  const startRace = useCallback((race: Race, car: CarWithStats, driver: Staff) => {
      setGameState(prev => ({...prev, money: prev.money - race.entryFee, yearlyExpenses: prev.yearlyExpenses + race.entryFee}));
      setSelectedRace(race);
      setSelectedCarForRace({
          ...car,
          speed: car.totalStats.speed,
          acceleration: car.totalStats.acceleration,
          handling: car.totalStats.handling,
      });
      setSelectedDriverForRace(driver);
  }, []);

  const proceedToDriverSelection = useCallback((race: Race, car: CarWithStats) => {
      const availableDrivers = gameState.staff.filter(s => s.type === StaffType.Driver);
      if (availableDrivers.length > 1) {
          setRaceAndCarForDriverSelection({ race, car });
      } else if (availableDrivers.length === 1) {
          startRace(race, car, availableDrivers[0]);
      } else {
          setNotification("레이스를 진행할 드라이버가 없습니다!");
      }
  }, [gameState.staff, startRace]);
  
  const handleSelectRace = useCallback((race: Race) => {
    if (gameOver) return;
    if (gameState.money < race.entryFee) {
        setNotification("레이스 참가 비용이 부족합니다!");
        return;
    }
    const raceReadyCars = carsWithCalculatedStats.filter(c => c.durability > 0);
    if (raceReadyCars.length === 0) {
        setNotification("참가할 수 있는 차량이 없습니다! 수리가 필요합니다.");
        return;
    }

    if (raceReadyCars.length > 1) {
        setRaceForCarSelection(race);
    } else {
        const car = raceReadyCars[0];
        proceedToDriverSelection(race, car);
    }
  }, [gameOver, gameState.money, carsWithCalculatedStats, proceedToDriverSelection]);

  const handleCarSelectedForRace = useCallback((car: Car) => {
    if (gameOver || !raceForCarSelection) return;

    const carWithStats = carsWithCalculatedStats.find(c => c.id === car.id);
    if (!carWithStats) return;

    proceedToDriverSelection(raceForCarSelection, carWithStats);
    setRaceForCarSelection(null);
  }, [gameOver, raceForCarSelection, carsWithCalculatedStats, proceedToDriverSelection]);

  const handleDriverSelectedForRace = useCallback((driver: Staff) => {
      if (gameOver || !raceAndCarForDriverSelection) return;

      startRace(raceAndCarForDriverSelection.race, raceAndCarForDriverSelection.car, driver);
      setRaceAndCarForDriverSelection(null);
  }, [gameOver, raceAndCarForDriverSelection, startRace]);
  
  const handleRaceFinish = useCallback((prizeMoney: number, prizeRp: number, rank: number, raceId: number, carId: number, driverId: number, durabilityRepaired: number) => {
    if (gameOver) return;
    const race = AVAILABLE_RACES.find(r => r.id === raceId);
    if (!race) return;

    const showNotification = (message: string, delay = 0) => {
        setTimeout(() => setNotification(message), delay);
    };
    let notificationDelay = 100;

    const newState: GameState = JSON.parse(JSON.stringify(gameState));

    // --- Update Highest Rank Achieved ---
    if (rank > 0 && rank < newState.highestRankAchieved) {
        newState.highestRankAchieved = rank;
        showNotification(`🏆 최고 기록 갱신! ${rank}위 달성!`, notificationDelay);
        notificationDelay += 3000;
    }

    // --- Aura Effects on Prizes ---
    let finalPrizeMoney = prizeMoney;
    let finalPrizeRp = prizeRp;

    if (activeAura?.bonusMoneyModifier && finalPrizeMoney > 0) {
      finalPrizeMoney = Math.floor(finalPrizeMoney * activeAura.bonusMoneyModifier);
    }
    if (activeAura?.bonusRpModifier && finalPrizeRp > 0) {
      finalPrizeRp = Math.floor(finalPrizeRp * activeAura.bonusRpModifier);
    }

    // --- Prize Money & RP ---
    newState.money += finalPrizeMoney;
    newState.researchPoints += finalPrizeRp;
    newState.yearlyIncome += finalPrizeMoney;

    let raceResultNotification = `레이스 종료!`;
    if (finalPrizeMoney > 0 || finalPrizeRp > 0) {
      raceResultNotification += ` 💰${finalPrizeMoney.toLocaleString()} 와 🔬${finalPrizeRp.toLocaleString()}를 획득했습니다!`;
    } else {
      raceResultNotification += ` 아쉽지만 다음 기회에...`;
    }
    if (activeAura && (finalPrizeMoney > prizeMoney || finalPrizeRp > prizeRp)) {
        raceResultNotification += ` (오라 보너스!)`
    }
    showNotification(raceResultNotification, notificationDelay);
    notificationDelay += 3000;

    // --- Sponsor Logic ---
    if (newState.activeContract) {
        let sponsorMessageParts: string[] = [];
        const perRace = Math.floor(newState.activeContract.perRacePayout * teamTraitEffects.sponsorPayoutModifier);
        newState.money += perRace;
        newState.yearlyIncome += perRace;
        sponsorMessageParts.push(`지원금 +💰${perRace.toLocaleString()}`);

        if (rank === 1) {
            const winBonus = Math.floor(newState.activeContract.winBonus * teamTraitEffects.sponsorPayoutModifier);
            newState.money += winBonus;
            newState.yearlyIncome += winBonus;
            sponsorMessageParts.push(`승리 보너스 +💰${winBonus.toLocaleString()}`);
        }
        
        let sponsorNotification = `${newState.activeContract.sponsorName}: ${sponsorMessageParts.join(', ')}`;
        if (teamTraitEffects.sponsorPayoutModifier > 1) {
            sponsorNotification += ` (협상가 보너스!)`;
        }
        showNotification(sponsorNotification, notificationDelay);
        notificationDelay += 3000;

        newState.activeContract.racesRemaining -= 1;
        if (newState.activeContract.racesRemaining <= 0) {
            showNotification(`${newState.activeContract.sponsorName}와의 계약이 만료되었습니다!`, notificationDelay);
            notificationDelay += 3000;
            newState.activeContract = null;
        }
    }

    // --- Car Durability ---
    const baseDurabilityLoss = race.difficulty * 5 + Math.floor(Math.random() * 5);
    const modifiedDurabilityLoss = Math.round(baseDurabilityLoss * teamTraitEffects.durabilityLossModifier);
    let finalDurabilityLoss = Math.max(0, modifiedDurabilityLoss - durabilityRepaired);
    let durabilityMessage = '';

    if (activeAura?.durabilitySaveChance && Math.random() < activeAura.durabilitySaveChance) {
        finalDurabilityLoss = 0;
        durabilityMessage = `🛡️ ${activeAura.name}의 효과! 차량 내구도가 소모되지 않았습니다!`;
    } else {
        let carName = '';
        newState.cars = newState.cars.map(c => {
            if (c.id === carId) {
                carName = c.name;
                const newDurability = Math.max(0, c.durability - finalDurabilityLoss);
                return { ...c, durability: newDurability };
            }
            return c;
        });
        durabilityMessage = `${carName}의 내구도가 ${finalDurabilityLoss} 감소했습니다.`;
        if(teamTraitEffects.durabilityLossModifier < 1 && baseDurabilityLoss > modifiedDurabilityLoss) {
            durabilityMessage += ` (기술 보너스!)`
        }
        if (durabilityRepaired > 0) {
          durabilityMessage += ` (피트인으로 ${durabilityRepaired} 회복!)`;
        }
        durabilityMessage += ` (현재: ${newState.cars.find(c => c.id === carId)!.durability})`;
    }
    showNotification(durabilityMessage, 500);

    // --- Driver EXP, Level Up, and Condition ---
    const driver = newState.staff.find(s => s.id === driverId);
    if (driver) {
        // Condition Update
        const conditions: ('최상' | '좋음' | '보통' | '나쁨')[] = ['나쁨', '보통', '좋음', '최상'];
        const currentConditionIndex = driver.condition ? conditions.indexOf(driver.condition) : 1;
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newIndex = Math.max(0, Math.min(conditions.length - 1, currentConditionIndex + change));
        driver.condition = conditions[newIndex];

        // EXP Gain
        let expGained = Math.ceil((race.difficulty * 25) / (rank > 0 ? rank : 1));
        const trainingCenterLevel = newState.facilities.trainingCenter;
        if (trainingCenterLevel > 0) {
            const trainingBonus = FACILITIES_DATA.trainingCenter.levels.find(l => l.level === trainingCenterLevel)?.effect || 1;
            expGained = Math.floor(expGained * trainingBonus);
        }
        if (activeAura?.bonusExpModifier) {
          expGained = Math.floor(expGained * activeAura.bonusExpModifier);
        }
        driver.experience += expGained;

        // Level Up
        while (driver.experience >= driver.nextLevelExp) {
            driver.experience -= driver.nextLevelExp;
            const skillGain = Math.floor(Math.random() * 2) + 2;
            driver.skill += skillGain;
            driver.nextLevelExp = Math.floor(driver.nextLevelExp * 1.5);
            showNotification(`${driver.emoji} ${driver.name} 레벨 업! 기술 +${skillGain}`, notificationDelay);
            notificationDelay += 3000;
        }
    }
    
    // --- Championship Points ---
    const playerPoints = CHAMPIONSHIP_POINT_SYSTEM[rank - 1] || 0;
    newState.championshipPoints += playerPoints;
    newState.rivalTeams = newState.rivalTeams.map(rival => {
        const rivalRank = Math.floor(Math.random() * 8) + 1; // Simple simulation for rival ranks
        const rivalPoints = CHAMPIONSHIP_POINT_SYSTEM[rivalRank - 1] || 0;
        return { ...rival, points: rival.points + rivalPoints };
    });

    // --- Time Pass & Salaries ---
    const salaries = newState.staff.reduce((acc, s) => acc + s.salary, 0);
    newState.money -= salaries;
    newState.yearlyExpenses += salaries;
    showNotification(`한 달이 지나 월급으로 💰${salaries.toLocaleString()}가 지불되었습니다.`, notificationDelay);

    const isEndOfSeason = newState.currentDate.month === 12;

    // Update date
    newState.currentDate.month = isEndOfSeason ? 1 : newState.currentDate.month + 1;
    newState.currentDate.year = isEndOfSeason ? newState.currentDate.year + 1 : newState.currentDate.year;

    // --- Final state update logic ---
    if (isEndOfSeason) {
        const playerStanding: SeasonStanding = {
            name: newState.teamName,
            emoji: '🧑‍🚀',
            points: newState.championshipPoints,
            isPlayer: true
        };
        const rivalStandings: SeasonStanding[] = newState.rivalTeams.map(r => ({ ...r, isPlayer: false }));
        const finalStandings = [...rivalStandings, playerStanding].sort((a, b) => b.points - a.points);
        const champion = finalStandings[0];
        
        stateToApplyAfterReport.current = newState;
        setEndOfSeasonReport({ finalStandings, champion, income: newState.yearlyIncome, expenses: newState.yearlyExpenses });
    } else {
        setGameState(newState);
    }
    
  }, [gameOver, gameState, activeAura, teamTraitEffects]);
  
  const handleContinueFromReport = useCallback(() => {
    if (!endOfSeasonReport || !stateToApplyAfterReport.current) return;
    
    const newState = stateToApplyAfterReport.current;
    
    // Add championship prize if player won
    if (endOfSeasonReport.champion.isPlayer) {
        const prizeMoney = CHAMPIONSHIP_END_OF_SEASON_PRIZE.money;
        newState.money += prizeMoney;
        newState.researchPoints += CHAMPIONSHIP_END_OF_SEASON_PRIZE.rp;
        // The prize is for the new year, so it's not part of the *last* year's income.
        setNotification(`🏆 챔피언십 우승 보너스 획득! (💰${prizeMoney.toLocaleString()}, 🔬${CHAMPIONSHIP_END_OF_SEASON_PRIZE.rp.toLocaleString()})`);
    }

    // Reset points and financial data for new season
    newState.championshipPoints = 0;
    newState.rivalTeams.forEach(rival => rival.points = 0);
    newState.yearlyIncome = 0;
    newState.yearlyExpenses = 0;

    setGameState(newState);
    setEndOfSeasonReport(null);
    stateToApplyAfterReport.current = null;
  }, [endOfSeasonReport]);

  const handleResearch = useCallback((item: ResearchItem) => {
      if (gameOver) return;
      const finalCost = Math.round(item.cost * (1 - mechanicEffects.costReductionPercent));
      
      const arePrerequisitesMet = !item.requiredResearchIds || item.requiredResearchIds.every(id => researchedIds.has(id));

      if (researchedIds.has(item.id) || gameState.researchPoints < finalCost || !arePrerequisitesMet) {
          setNotification("연구를 진행할 수 없습니다!");
          return;
      }

      if(item.car) {
          const garageCapacity = FACILITIES_DATA.garage.levels.find(l => l.level === gameState.facilities.garage)?.effect || 1;
          if (gameState.cars.length >= garageCapacity) {
              setNotification("차고가 가득 찼습니다! 시설을 업그레이드하세요.");
              return;
          }
      }

      setGameState(prev => ({...prev, researchPoints: prev.researchPoints - finalCost}));
      setResearchedIds(prev => new Set(prev).add(item.id));
      
      if (item.partId) {
          setGameState(prev => ({
              ...prev,
              unlockedPartIds: [...prev.unlockedPartIds, item.partId],
          }));
          const part = CAR_PARTS.find(p => p.id === item.partId);
          setNotification(`파츠 개발 완료: ${part?.emoji} ${part?.name}!`);
      } else if (item.car) {
          setGameState(prev => ({...prev, cars: [...prev.cars, item.car]}));
          setNotification(`신차 개발: ${item.car.emoji} ${item.car.name}!`);
      } else if (item.teamTraitId) {
          setGameState(prev => ({
              ...prev,
              unlockedTeamTraitIds: [...prev.unlockedTeamTraitIds, item.teamTraitId],
          }));
          const trait = TEAM_TRAITS.find(t => t.id === item.teamTraitId);
          setNotification(`팀 특성 연구 완료: ${trait?.emoji} ${trait?.name}!`);
      }
  }, [gameOver, gameState.researchPoints, researchedIds, mechanicEffects, gameState.cars, gameState.facilities.garage]);

  const handleHire = useCallback((staffId: number) => {
      if (gameOver) return;
      const staffToHire = STAFF_POOL.find(s => s.id === staffId);
      if (!staffToHire) return;
      setGameState(prev => ({...prev, staff: [...prev.staff, staffToHire]}));
      setNotification(`${staffToHire.emoji} ${staffToHire.name}님을 고용했습니다!`);
  }, [gameOver]);

  const handleSignContract = useCallback((contract: Contract) => {
    if (gameOver || gameState.activeContract) {
      setNotification("이미 스폰서 계약이 체결되어 있습니다!");
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: prev.money + contract.signingBonus,
      yearlyIncome: prev.yearlyIncome + contract.signingBonus,
      activeContract: {
        id: contract.id,
        sponsorName: contract.sponsorName,
        sponsorEmoji: contract.sponsorEmoji,
        perRacePayout: contract.perRacePayout,
        winBonus: contract.winBonus,
        racesRemaining: contract.duration,
      },
    }));
    
    setNotification(`${contract.sponsorName}와(과) 계약했습니다! 계약 보너스 💰${contract.signingBonus.toLocaleString()}를 받았습니다.`);
  }, [gameOver, gameState.activeContract]);

  const handleEquipPart = useCallback((carId: number, partType: PartType, partId: number | null) => {
      if (gameOver) return;
      setGameState(prev => ({
          ...prev,
          cars: prev.cars.map(car => {
              if (car.id === carId) {
                  const updatedCar = { ...car, equippedParts: { ...car.equippedParts }};
                  updatedCar.equippedParts[partType.toLowerCase() as keyof typeof car.equippedParts] = partId;
                  return updatedCar;
              }
              return car;
          })
      }));
      const partName = CAR_PARTS.find(p => p.id === partId)?.name || "없음";
      setNotification(`${partType}을(를) ${partName}(으)로 교체했습니다.`);
      setPartSelection(null);
  }, [gameOver]);

  const handleUpgradeFacility = useCallback((facilityId: keyof GameState['facilities']) => {
    if (gameOver) return;
    
    setGameState(prev => {
        const facilityData = FACILITIES_DATA[facilityId];
        const currentLevel = prev.facilities[facilityId];

        if (currentLevel >= facilityData.maxLevel) {
            setNotification("이미 최대 레벨입니다.");
            return prev;
        }

        const nextLevelInfo = facilityData.levels.find(l => l.level === currentLevel + 1);
        if (!nextLevelInfo || !nextLevelInfo.cost) {
            return prev;
        }

        if (prev.money < nextLevelInfo.cost.money || prev.researchPoints < nextLevelInfo.cost.rp) {
            setNotification("자원이 부족하여 업그레이드할 수 없습니다.");
            return prev;
        }
        
        const newFacilities = {
            ...prev.facilities,
            [facilityId]: currentLevel + 1
        };

        setNotification(`${facilityData.name}을(를) 레벨 ${currentLevel + 1}(으)로 업그레이드했습니다!`);

        return {
            ...prev,
            money: prev.money - nextLevelInfo.cost.money,
            researchPoints: prev.researchPoints - nextLevelInfo.cost.rp,
            yearlyExpenses: prev.yearlyExpenses + nextLevelInfo.cost.money,
            facilities: newFacilities,
        };
    });
  }, [gameOver]);

  const handleSelectAura = useCallback((auraId: string) => {
      if (gameOver) return;
      setGameState(prev => ({...prev, activeAuraId: auraId}));
      const aura = AVAILABLE_AURAS.find(a => a.id === auraId);
      setNotification(`${aura?.emoji} ${aura?.name} 활성화!`);
  }, [gameOver]);

  const unlockedTeamTraits = useMemo(() => {
    return TEAM_TRAITS.filter(trait => gameState.unlockedTeamTraitIds?.includes(trait.id));
  }, [gameState.unlockedTeamTraitIds]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'garage': return <GarageScreen carsWithStats={carsWithCalculatedStats} gameState={gameState} onUpgradeCar={handleUpgradeCar} onRepairCar={handleRepairCar} mechanicEffects={mechanicEffects} onOpenPartSelection={(carId, partType) => setPartSelection({ carId, partType })} unlockedTeamTraits={unlockedTeamTraits} />;
      case 'race': return <RaceScreen gameState={gameState} onSelectRace={handleSelectRace} />;
      case 'championship': return <ChampionshipScreen gameState={gameState} />;
      case 'research': return <ResearchScreen gameState={gameState} researchedIds={researchedIds} onResearch={handleResearch} mechanicEffects={mechanicEffects} />;
      case 'sponsors': return <SponsorsScreen gameState={gameState} onSignContract={handleSignContract} />;
      case 'facilities': return <FacilitiesScreen gameState={gameState} onUpgradeFacility={handleUpgradeFacility} />;
      case 'aura': return <AuraScreen activeAuraId={gameState.activeAuraId} onSelectAura={handleSelectAura} />;
      case 'hire': return <HireScreen gameState={gameState} onHire={handleHire} />;
      default: return <GarageScreen carsWithStats={carsWithCalculatedStats} gameState={gameState} onUpgradeCar={handleUpgradeCar} onRepairCar={handleRepairCar} mechanicEffects={mechanicEffects} onOpenPartSelection={(carId, partType) => setPartSelection({ carId, partType })} unlockedTeamTraits={unlockedTeamTraits} />;
    }
  };

  const unlockedParts = useMemo(() => CAR_PARTS.filter(p => gameState.unlockedPartIds.includes(p.id)), [gameState.unlockedPartIds]);

  return (
    <div className={`min-h-screen text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 ${gameOver ? 'grayscale' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <Header gameState={gameState} onSave={handleSave} onLoad={handleLoad} isLoadable={isLoadable}/>
        <Nav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        <main>
            {renderScreen()}
        </main>
      </div>

      <button
        onClick={() => setIsHelpModalOpen(true)}
        className="fixed bottom-5 left-5 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 z-40"
        aria-label="게임 도움말 열기"
      >?</button>

      {notification && (
          <div className="fixed bottom-5 right-5 bg-gray-900 text-white py-2 px-4 rounded-lg shadow-xl animate-fade-in-out z-50">
              {notification}
          </div>
      )}

      {raceForCarSelection && !gameOver && (
        <CarSelectionModal
          raceName={raceForCarSelection.name}
          cars={carsWithCalculatedStats.filter(c => c.durability > 0)}
          onSelect={handleCarSelectedForRace}
          onClose={() => setRaceForCarSelection(null)}
        />
      )}

      {raceAndCarForDriverSelection && !gameOver && (
          <DriverSelectionModal
              raceName={raceAndCarForDriverSelection.race.name}
              drivers={gameState.staff.filter(s => s.type === StaffType.Driver)}
              onSelect={handleDriverSelectedForRace}
              onClose={() => setRaceAndCarForDriverSelection(null)}
          />
      )}

      {selectedRace && selectedCarForRace && selectedDriverForRace && !gameOver && (
        <RaceModal 
            race={selectedRace}
            playerCar={selectedCarForRace}
            playerCarId={selectedCarForRace.id}
            playerDriver={selectedDriverForRace}
            mechanicSkill={totalMechanicSkill}
            teamTraitEffects={teamTraitEffects}
            onClose={() => {
              setSelectedRace(null);
              setSelectedCarForRace(null);
              setSelectedDriverForRace(null);
            }}
            onRaceFinish={handleRaceFinish}
        />
      )}

      {partSelection && !gameOver && (
        <PartSelectionModal
            partType={partSelection.partType}
            unlockedParts={unlockedParts}
            onClose={() => setPartSelection(null)}
            onEquip={(partId) => handleEquipPart(partSelection.carId, partSelection.partType, partId)}
            currentlyEquippedPartId={gameState.cars.find(c => c.id === partSelection.carId)?.equippedParts[partSelection.partType.toLowerCase() as keyof Car['equippedParts']] || null}
        />
      )}
      
      {endOfSeasonReport && (
        <EndOfSeasonReportModal
            report={endOfSeasonReport}
            onContinue={handleContinueFromReport}
        />
      )}

      {isHelpModalOpen && (
        <HelpModal 
            onClose={() => setIsHelpModalOpen(false)}
        />
      )}

      {gameOver && <GameOverScreen onRestart={handleRestart} />}
    </div>
  );
}

export default App;