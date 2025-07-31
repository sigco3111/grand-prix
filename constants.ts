import { Car, Staff, StaffType, Race, GameState, Part, Contract, ResearchItem, RivalTeam, Aura, TeamTrait } from './types';

export const INITIAL_CARS: Car[] = [
  { id: 1, name: '로드스터', emoji: '🏎️', speed: 10, acceleration: 8, handling: 12, upgrades: 0, maxUpgrades: 5, durability: 100, maxDurability: 100, equippedParts: { engine: null, tire: null, chassis: null } },
];

export const STAFF_POOL: Staff[] = [
  { id: 1, name: 'Ken C', emoji: '👨‍🚀', type: StaffType.Driver, skill: 20, experience: 0, nextLevelExp: 100, salary: 50, isHired: true, specialSkill: 'Start Dash', condition: '보통' },
  { id: 2, name: 'Suki M', emoji: '👩‍🔧', type: StaffType.Mechanic, skill: 25, experience: 0, nextLevelExp: 100, salary: 40, isHired: true },
  { id: 3, name: 'Max V', emoji: '👨‍🚀', type: StaffType.Driver, skill: 45, experience: 0, nextLevelExp: 120, salary: 120, isHired: false, specialSkill: 'Cornering Master', condition: '보통' },
  { id: 4, name: 'Hannah S', emoji: '👩‍🔧', type: StaffType.Mechanic, skill: 55, experience: 0, nextLevelExp: 120, salary: 110, isHired: false },
  { id: 5, name: 'Leo H', emoji: '👨‍🚀', type: StaffType.Driver, skill: 70, experience: 0, nextLevelExp: 150, salary: 250, isHired: false, specialSkill: 'Overdrive', condition: '보통' },
  { id: 6, name: 'Chip F', emoji: '👨‍🔧', type: StaffType.Mechanic, skill: 80, experience: 0, nextLevelExp: 150, salary: 220, isHired: false },
  { id: 7, name: 'Dr. 이블린', emoji: '👩‍🔬', type: StaffType.Mechanic, skill: 120, experience: 0, nextLevelExp: 200, salary: 450, isHired: false, specialSkill: 'Genius Mechanic' },
  { id: 8, name: '카이', emoji: '👨‍🚀', type: StaffType.Driver, skill: 100, experience: 0, nextLevelExp: 200, salary: 500, isHired: false, specialSkill: 'Ace Pilot', condition: '최상' },
];

export const AVAILABLE_RACES: Race[] = [
  { id: 1, name: '로컬 서킷', prizeMoney: 1000, researchPoints: 50, entryFee: 100, requiredRank: 10, difficulty: 1, position: { top: '65%', left: '48%' }, weather: '맑음', courseType: '밸런스' },
  { id: 2, name: '루키 컵', prizeMoney: 2500, researchPoints: 120, entryFee: 250, requiredRank: 3, difficulty: 2, position: { top: '35%', left: '22%' }, weather: '맑음', courseType: '밸런스' },
  { id: 3, name: '아마추어 리그', prizeMoney: 7000, researchPoints: 300, entryFee: 700, requiredRank: 3, difficulty: 4, position: { top: '75%', left: '30%' }, weather: '비', courseType: '테크니컬' },
  { id: 4, name: '프로-암 트로피', prizeMoney: 15000, researchPoints: 600, entryFee: 1500, requiredRank: 2, difficulty: 6, position: { top: '70%', left: '55%' }, weather: '맑음', courseType: '고속' },
  { id: 5, name: '내셔널 GP', prizeMoney: 40000, researchPoints: 1500, entryFee: 4000, requiredRank: 1, difficulty: 8, position: { top: '40%', left: '75%' }, courseType: '고속' },
  { id: 6, name: '월드 그랑프리', prizeMoney: 100000, researchPoints: 5000, entryFee: 10000, requiredRank: 1, difficulty: 10, position: { top: '80%', left: '85%' }, weather: '비', courseType: '테크니컬' },
  { id: 7, name: '아시아 챔피언십', prizeMoney: 250000, researchPoints: 8000, entryFee: 20000, requiredRank: 1, difficulty: 12, position: { top: '15%', left: '60%' }, weather: '맑음', courseType: '밸런스' },
  { id: 8, name: '월드 챔피언십 파이널', prizeMoney: 1000000, researchPoints: 20000, entryFee: 50000, requiredRank: 1, difficulty: 15, position: { top: '10%', left: '10%' }, weather: '비', courseType: '테크니컬' },
];

export const CAR_PARTS: Part[] = [
  // Engines
  { id: 101, name: '순정 엔진', emoji: '⚙️', type: 'Engine', stats: { speed: 5, acceleration: 3, handling: 0 } },
  { id: 102, name: 'V6 엔진', emoji: '⚙️', type: 'Engine', stats: { speed: 12, acceleration: 8, handling: 0 } },
  { id: 103, name: '터보 엔진', emoji: '⚙️', type: 'Engine', stats: { speed: 20, acceleration: 15, handling: -2 } },
  { id: 104, name: 'V12 엔진', emoji: '⚙️', type: 'Engine', stats: { speed: 35, acceleration: 25, handling: -5 } },
  // Tires
  { id: 201, name: '표준 타이어', emoji: '🔘', type: 'Tire', stats: { speed: 0, acceleration: 2, handling: 5 }, description: '모든 날씨에 무난한 성능을 보이는 균형잡힌 타이어.' },
  { id: 202, name: '스포츠 타이어', emoji: '🔘', type: 'Tire', stats: { speed: 2, acceleration: 5, handling: 10 }, description: '맑은 날에 뛰어난 성능을 발휘하지만, 빗길에는 다소 약합니다.' },
  { id: 203, name: '레이싱 슬릭', emoji: '🔘', type: 'Tire', stats: { speed: 5, acceleration: -2, handling: 20 }, description: '맑은 날 최고의 성능을 보장하지만, 빗길에서는 거의 제어가 불가능합니다.' },
  { id: 204, name: '레인 타이어', emoji: '💧', type: 'Tire', stats: { speed: -2, acceleration: 2, handling: 15 }, description: '빗길 주행에 특화된 타이어. 맑은 날에는 성능이 저하됩니다.' },
  { id: 205, name: '전천후 타이어', emoji: '🌐', type: 'Tire', stats: { speed: 1, acceleration: 4, handling: 12 }, description: '모든 기상 조건에서 안정적인 성능을 제공합니다.' },
  // Chassis
  { id: 301, name: '경량 섀시', emoji: '🔩', type: 'Chassis', stats: { speed: 2, acceleration: 5, handling: 2 } },
  { id: 302, name: '강철 섀시', emoji: '🔩', type: 'Chassis', stats: { speed: -2, acceleration: 0, handling: 15 } },
  { id: 303, name: '카본 파이버 섀시', emoji: '🔩', type: 'Chassis', stats: { speed: 5, acceleration: 10, handling: 10 } },
  { id: 304, name: '에어로 파츠', emoji: '🌬️', type: 'Chassis', stats: { speed: 8, acceleration: 2, handling: 18 } },
];

export const TEAM_TRAITS: TeamTrait[] = [
  { 
    id: 'tt_pit_expert',
    name: '피트 스탑 전문가',
    emoji: '⏱️',
    description: '미케닉들의 숙련도가 향상되어 레이스 중 피트 스탑 시간이 단축됩니다.',
    pitStopTimeReduction: 0.2, // 20% reduction
  },
  {
    id: 'tt_fuel_efficiency',
    name: '연비 향상 기술',
    emoji: '⛽',
    description: '차량의 연비가 개선되어 레이스 후 내구도 소모량이 10% 감소합니다.',
    durabilityLossModifier: 0.9,
  },
  {
    id: 'tt_sponsor_negotiator',
    name: '스폰서 협상가',
    emoji: '💼',
    description: '스폰서와의 협상력이 향상되어 모든 스폰서 수입이 5% 증가합니다.',
    sponsorPayoutModifier: 1.05,
  },
  {
    id: 'tt_aero_expert',
    name: '공기역학 전문가',
    emoji: '💨',
    description: '모든 차량의 공기역학적 설계가 개선되어 핸들링이 3씩 영구적으로 증가합니다.',
    allCarsHandlingBonus: 3,
  },
];

export const RESEARCH_ITEMS: ResearchItem[] = [
    // Level 1
    { id: 'part_101', name: '순정 엔진 개발', cost: 100, partId: 101, requiredResearchLabLevel: 1 },
    { id: 'part_201', name: '표준 타이어 개발', cost: 80, partId: 201, requiredResearchLabLevel: 1 },
    { id: 'part_301', name: '경량 섀시 개발', cost: 120, partId: 301, requiredResearchLabLevel: 1 },
    
    // Level 2
    { id: 'part_102', name: 'V6 엔진 개발', cost: 400, partId: 102, requiredResearchLabLevel: 2, requiredResearchIds: ['part_101'] },
    { id: 'part_202', name: '스포츠 타이어 개발', cost: 350, partId: 202, requiredResearchLabLevel: 2, requiredResearchIds: ['part_201'] },
    { id: 'part_302', name: '강철 섀시 개발', cost: 500, partId: 302, requiredResearchLabLevel: 2, requiredResearchIds: ['part_301'] },
    
    // Level 3
    { id: 'part_204', name: '레인 타이어 개발', cost: 600, partId: 204, requiredResearchLabLevel: 3, requiredResearchIds: ['part_201'] },
    { id: 'new_car_1', name: '신차 개발: "불릿"', cost: 1000, requiredResearchLabLevel: 3, car: { id: 2, name: '불릿', emoji: '🚀', speed: 25, acceleration: 20, handling: 15, upgrades: 0, maxUpgrades: 8, durability: 120, maxDurability: 120, equippedParts: { engine: null, tire: null, chassis: null } }, requiredResearchIds: ['part_102', 'part_202']},
    { id: 'tt_fuel_efficiency', name: '팀 특성: 연비 향상 기술', cost: 1500, requiredResearchLabLevel: 3, teamTraitId: 'tt_fuel_efficiency', requiredResearchIds: ['part_102'] },
    
    // Level 4
    { id: 'part_103', name: '터보 엔진 개발', cost: 1200, partId: 103, requiredResearchLabLevel: 4, requiredResearchIds: ['part_102'] },
    { id: 'part_203', name: '레이싱 슬릭 개발', cost: 1100, partId: 203, requiredResearchLabLevel: 4, requiredResearchIds: ['part_202'] },
    { id: 'part_303', name: '카본 파이버 섀시 개발', cost: 1500, partId: 303, requiredResearchLabLevel: 4, requiredResearchIds: ['part_302'] },
    { 
        id: 'new_car_3', 
        name: '신차 개발: "팬텀"', 
        cost: 3000, 
        requiredResearchLabLevel: 4, 
        car: { id: 4, name: '팬텀', emoji: '👻', speed: 30, acceleration: 40, handling: 38, upgrades: 0, maxUpgrades: 10, durability: 130, maxDurability: 130, equippedParts: { engine: null, tire: null, chassis: null } }, 
        requiredResearchIds: ['part_204', 'part_303'] 
    },
    { id: 'tt_aero_expert', name: '팀 특성: 공기역학 전문가', cost: 2000, requiredResearchLabLevel: 4, teamTraitId: 'tt_aero_expert', requiredResearchIds: ['part_303'] },
    
    // Level 5
    { id: 'part_304', name: '에어로 파츠 개발', cost: 2000, partId: 304, requiredResearchLabLevel: 5, requiredResearchIds: ['part_303'] },
    { id: 'part_205', name: '전천후 타이어 개발', cost: 1800, partId: 205, requiredResearchLabLevel: 5, requiredResearchIds: ['part_202'] },
    { id: 'part_104', name: 'V12 엔진 개발', cost: 2500, partId: 104, requiredResearchLabLevel: 5, requiredResearchIds: ['part_103'] },
    { id: 'new_car_2', name: '신차 개발: "에어로 블레이드"', cost: 5000, requiredResearchLabLevel: 5, car: { id: 3, name: '에어로 블레이드', emoji: '✈️', speed: 40, acceleration: 35, handling: 45, upgrades: 0, maxUpgrades: 12, durability: 150, maxDurability: 150, equippedParts: { engine: null, tire: null, chassis: null } }, requiredResearchIds: ['part_104', 'part_304'] },
    { 
        id: 'new_car_4', 
        name: '신차 개발: "골리앗"', 
        cost: 6000, 
        requiredResearchLabLevel: 5, 
        car: { id: 5, name: '골리앗', emoji: '🦍', speed: 55, acceleration: 30, handling: 25, upgrades: 0, maxUpgrades: 15, durability: 200, maxDurability: 200, equippedParts: { engine: null, tire: null, chassis: null } }, 
        requiredResearchIds: ['part_104', 'part_302'] 
    },
    { id: 'tt_pit_expert', name: '팀 특성: 피트 스탑 전문가', cost: 3000, requiredResearchLabLevel: 5, teamTraitId: 'tt_pit_expert', requiredResearchIds: ['part_103', 'part_203'] },
    { id: 'tt_sponsor_negotiator', name: '팀 특성: 스폰서 협상가', cost: 4000, requiredResearchLabLevel: 5, teamTraitId: 'tt_sponsor_negotiator', requiredResearchIds: ['new_car_1'] },
];

export const SPONSOR_OFFERS: Contract[] = [
  { 
    id: 1, 
    sponsorName: '동네 타이어', 
    sponsorEmoji: '🔘',
    description: '시작하는 팀을 위한 안정적인 기본 후원입니다. 꾸준한 수입을 제공합니다.',
    signingBonus: 1500, 
    perRacePayout: 300, 
    winBonus: 600, 
    duration: 5 
  },
  { 
    id: 2, 
    sponsorName: '로켓 연료', 
    sponsorEmoji: '⛽',
    description: '고위험 고수익 계약. 승리 시 막대한 보너스를 지급하지만, 기본 지급액은 적습니다.',
    signingBonus: 500, 
    perRacePayout: 100, 
    winBonus: 2500, 
    duration: 4 
  },
  { 
    id: 3, 
    sponsorName: '골든 스티어링', 
    sponsorEmoji: '🏆', 
    description: '명문 스폰서. 계약금은 높지만, 그만큼의 성과를 기대합니다.',
    signingBonus: 5000, 
    perRacePayout: 500, 
    winBonus: 1000, 
    duration: 8
  },
];

export const FACILITIES_DATA = {
  garage: {
    id: 'garage',
    name: '차고',
    emoji: '🚗',
    maxLevel: 5,
    levels: [
      { level: 1, description: '최대 보유 차량 1대', effect: 1 },
      { level: 2, description: '최대 보유 차량 2대', effect: 2, cost: { money: 8000, rp: 500 } },
      { level: 3, description: '최대 보유 차량 3대', effect: 3, cost: { money: 20000, rp: 1200 } },
      { level: 4, description: '최대 보유 차량 4대', effect: 4, cost: { money: 50000, rp: 3000 } },
      { level: 5, description: '최대 보유 차량 5대', effect: 5, cost: { money: 120000, rp: 8000 } },
    ]
  },
  researchLab: {
    id: 'researchLab',
    name: '연구소',
    emoji: '🧪',
    maxLevel: 5,
    levels: [
      { level: 1, description: '기본 연구 가능', effect: 1 },
      { level: 2, description: 'V6, 스포츠 타이어 등 고급 연구 해금', effect: 2, cost: { money: 5000, rp: 300 } },
      { level: 3, description: '신차, 레인 타이어 등 전문 연구 해금', effect: 3, cost: { money: 15000, rp: 1000 } },
      { level: 4, description: '터보, 슬릭 타이어 등 최고급 연구 해금', effect: 4, cost: { money: 40000, rp: 2500 } },
      { level: 5, description: '최첨단 기술 연구 해금', effect: 5, cost: { money: 100000, rp: 6000 } },
    ]
  },
  trainingCenter: {
    id: 'trainingCenter',
    name: '트레이닝 센터',
    emoji: '🏋️',
    maxLevel: 3,
    levels: [
      { level: 0, description: '건설되지 않음', effect: 0 },
      { level: 1, description: '직원 경험치 획득량 +10%', effect: 1.1, cost: { money: 10000, rp: 400 } },
      { level: 2, description: '직원 경험치 획득량 +25%', effect: 1.25, cost: { money: 30000, rp: 1500 } },
      { level: 3, description: '직원 경험치 획득량 +50%', effect: 1.5, cost: { money: 80000, rp: 4000 } },
    ]
  },
};

export const RIVAL_TEAMS: RivalTeam[] = [
  { id: 101, name: 'Team Supersonic', emoji: '💨', points: 0 },
  { id: 102, name: 'Aqua Racers', emoji: '💧', points: 0 },
  { id: 103, name: 'Titan Racing', emoji: '🔩', points: 0 },
  { id: 104, name: 'Crimson Comet', emoji: '☄️', points: 0 },
  { id: 105, name: 'Emerald Drive', emoji: '✳️', points: 0 },
];

export const CHAMPIONSHIP_POINT_SYSTEM = [10, 6, 4, 3, 2, 1]; // Points for 1st to 6th

export const CHAMPIONSHIP_END_OF_SEASON_PRIZE = {
  money: 200000,
  rp: 10000,
};

export const AVAILABLE_AURAS: Aura[] = [
    { id: 'growth', name: '성장의 오라', emoji: '🌱', description: '드라이버가 레이스에서 20% 더 많은 경험치를 얻습니다.', bonusExpModifier: 1.2 },
    { id: 'wealth', name: '부의 오라', emoji: '💰', description: '레이스에서 10% 더 많은 상금을 획득합니다.', bonusMoneyModifier: 1.1 },
    { id: 'knowledge', name: '지식의 오라', emoji: '🧠', description: '레이스에서 10% 더 많은 연구 포인트를 획득합니다.', bonusRpModifier: 1.1 },
    { id: 'preservation', name: '보존의 오라', emoji: '🛡️', description: '레이스 종료 시 15% 확률로 차량 내구도가 소모되지 않습니다.', durabilitySaveChance: 0.15 },
];

export const INITIAL_GAME_STATE: GameState = {
  money: 5000,
  researchPoints: 100,
  currentDate: { year: 1, month: 3 },
  teamName: '이모지 레이서즈',
  cars: INITIAL_CARS,
  staff: STAFF_POOL.filter(s => s.isHired),
  highestRankAchieved: 10, // Start with a high number, lower is better
  unlockedPartIds: [],
  unlockedTeamTraitIds: [],
  activeContract: null,
  facilities: {
    garage: 1,
    researchLab: 1,
    trainingCenter: 0,
  },
  championshipPoints: 0,
  rivalTeams: RIVAL_TEAMS.map(team => ({ ...team, points: 0 })), // Ensure points are reset
  activeAuraId: null,
  yearlyIncome: 0,
  yearlyExpenses: 0,
};

export const UPGRADE_COST_BASE = 500;
export const UPGRADE_COST_MULTIPLIER = 1.5;
export const REPAIR_COST_PER_POINT = 15;