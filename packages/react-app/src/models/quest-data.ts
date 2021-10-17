import { TokenAmount } from './amount';
import { Fund } from './fund';
import { Status } from './status';

export type QuestData = {
  // Meta
  title?: string;
  description?: string;
  address: string;
  bounty: TokenAmount;
  collateralPercentage: number;
  expireTimeMs: number;
  tags: string[];

  creatorAddress?: string;
  rewardTokenAddress?: string;
  fallbackAddress?: string;
  players?: string[];
  funds?: Fund[];
  status?: Status;
  isLoading?: boolean;
};
