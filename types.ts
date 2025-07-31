export interface Car {
  id: number;
  name: string;
  emoji: string;
  speed: number;
  acceleration: number;
  handling: number;
  upgrades: number;
  maxUpgrades: number;
  durability: number;
  maxDurability: number;
  equippedParts: {
    engine: number | null;
    tire: number | null;
    chassis: number | null;
  };
}

export enum StaffType {
  Driver = '드라이버',
  Mechanic = '미케닉',
}

export type SpecialSkill = 'Start Dash' | 'Overdrive' | 'Cornering Master' | 'Genius Mechanic' | 'Ace Pilot';

export interface Staff {
  id: number;
  name: string;
  emoji: string;
  type: StaffType;
  skill: number; // Driving for Driver, Tech for Mechanic
  experience: number;
  nextLevelExp: number;
  salary: number;
  isHired: boolean;
  specialSkill?: SpecialSkill;
  condition?: '최상' | '좋음' | '보통' | '나쁨';
}

export interface Race {
  id:number;
  name: string;
  prizeMoney: number;
  researchPoints: number;
  entryFee: number;
  requiredRank: number; // Player must have won a race of this rank or lower to enter
  difficulty: number; // A factor from 1-10
  position: { top: string; left: string; };
  weather?: '맑음' | '비';
  courseType?: '고속' | '테크니컬' | '밸런스';
}

export interface Contract {
  id: number;
  sponsorName: string;
  sponsorEmoji: string;
  description: string;
  signingBonus: number;
  perRacePayout: number;
  winBonus: number; // Bonus for 1st place
  duration: number; // in number of races
}

export interface ActiveContract {
  id: number;
  sponsorName: string;
  sponsorEmoji: string;
  perRacePayout: number;
  winBonus: number;
  racesRemaining: number;
}

export interface Facilities {
  garage: number;
  researchLab: number;
  trainingCenter: number;
}

export interface RivalTeam {
  id: number;
  name: string;
  emoji: string;
  points: number;
}

export interface Aura {
    id: string;
    name: string;
    emoji: string;
    description: string;
    bonusExpModifier?: number;
    bonusMoneyModifier?: number;
    bonusRpModifier?: number;
    durabilitySaveChance?: number;
}

export interface TeamTrait {
    id: string;
    name: string;
    emoji: string;
    description: string;
    pitStopTimeReduction?: number;
    durabilityLossModifier?: number;
    sponsorPayoutModifier?: number;
    allCarsHandlingBonus?: number;
}

export interface GameState {
  money: number;
  researchPoints: number;
  currentDate: {
    year: number;
    month: number;
  };
  teamName: string;
  cars: Car[];
  staff: Staff[];
  highestRankAchieved: number;
  unlockedPartIds: number[];
  unlockedTeamTraitIds: string[];
  activeContract: ActiveContract | null;
  facilities: Facilities;
  championshipPoints: number;
  rivalTeams: RivalTeam[];
  activeAuraId: string | null;
  yearlyIncome: number;
  yearlyExpenses: number;
}

export type Screen = 'garage' | 'race' | 'research' | 'hire' | 'sponsors' | 'facilities' | 'championship' | 'aura';

export type PartType = 'Engine' | 'Tire' | 'Chassis';

export interface Part {
  id: number;
  name:string;
  emoji: string;
  type: PartType;
  stats: {
    speed: number;
    acceleration: number;
    handling: number;
  };
  description?: string;
}

export interface ResearchItem {
    id: string;
    name: string;
    cost: number;
    partId?: number;
    car?: Car;
    teamTraitId?: string;
    requiredResearchLabLevel?: number;
    requiredResearchIds?: string[];
}