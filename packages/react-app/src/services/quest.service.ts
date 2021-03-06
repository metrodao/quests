import { request } from 'graphql-request';
import { noop } from 'lodash-es';
import { log } from 'loglevel';
import { Filter } from 'src/models/filter';
import { QuestData } from 'src/models/quest-data';
import { TokenAmount } from 'src/models/token-amount';
import { QuestEntityQuery } from 'src/queries/quest-entity.query';
import { GQL_MAX_INT, MIN_QUEST_VERSION, QUEST_VERSION, SUBGRAPH_URI, TOKENS } from '../constants';
import { QuestSearchQuery } from '../queries/quest-search.query';
import { wrapError } from '../utils/errors.util';
import { getCurrentAccount, sendTransaction } from '../utils/web3.utils';

let questList: QuestData[] = [];

// #region Private

function mapQuests(quests: any[]): Promise<QuestData[]> {
  return Promise.all(
    quests.map(
      async (questEntity) =>
        ({
          address: questEntity.questAddress,
          title: questEntity.questMetaTitle,
          description: questEntity.questMetaDescription,
          rewardTokenAddress: questEntity.questRewardTokenAddress,
          bounty: { amount: 0, token: TOKENS.honey }, // Fetch amount of honey for this quest or questRewardTokenAddress
          collateralPercentage: questEntity.questMetaCollateralPercentage,
          tags: questEntity.questMetaTags,
          expireTimeMs: questEntity.questExpireTimeSec * 1000, // Sec to Ms
        } as QuestData),
    ),
  );
}

// #endregion

// #region Public

export async function getMoreQuests(
  currentIndex: number,
  count: number,
  filter: Filter,
): Promise<QuestData[]> {
  const currentAccount = await getCurrentAccount();
  if (!currentAccount && (filter.foundedQuests || filter.playedQuests || filter.createdQuests)) {
    throw wrapError(
      'Trying to filter on current account when this account is not enabled nor connected',
      { filter },
    );
  }

  let queryResult;
  if (filter.search) {
    queryResult = (
      await request(SUBGRAPH_URI, QuestSearchQuery, {
        skip: currentIndex,
        first: count,
        search: filter.search,
        minVersion: MIN_QUEST_VERSION,
      })
    ).questSearch;
  } else {
    queryResult = (
      await request(SUBGRAPH_URI, QuestEntityQuery, {
        skip: currentIndex,
        first: count,
        minVersion: MIN_QUEST_VERSION,
        tags: filter.tags,
        expireTimeLower: filter.expire?.start
          ? Math.round(filter.expire.start.getTime() / 1000) // MS to Sec
          : 0,
        expireTimeUpper: filter.expire?.end
          ? Math.round(filter.expire.end.getTime() / 1000) // MS to Sec
          : GQL_MAX_INT, // January 18, 2038 10:14:07 PM  // TODO : Change to a later time when supported by grapql-request
      })
    ).questEntities;
  }

  return mapQuests(queryResult).then((questResult) => {
    questList = questList.concat(questResult);
    return questResult;
  });
}

export async function saveQuest(
  questFactoryContract: any,
  fallbackAddress: string,
  meta: Partial<QuestData>,
  address?: string,
) {
  if (address) throw Error('Saving existing quest is not yet implemented');
  if (questFactoryContract) {
    const tx = await questFactoryContract.createQuest(
      JSON.stringify(meta),
      TOKENS.honey.address,
      Math.round(meta.expireTimeMs! / 1000), // Ms to Sec
      fallbackAddress,
      QUEST_VERSION,
    );
    log('TX HASH', tx.hash);
    const receipt = await tx.wait();
    const questDeployedAddress = receipt?.events[0]?.args[0];
    return questDeployedAddress;
  }

  return null;
}

export async function fundQuest(
  questAddress: string,
  amount: TokenAmount,
  onCompleted: Function = noop,
) {
  const currentAccount = await getCurrentAccount();
  if (!currentAccount)
    throw wrapError('User account not connected when trying to found a quest!', {
      questAddress,
      amount,
    });
  await sendTransaction(questAddress, amount, onCompleted);
}

export async function playQuest(questAddress: string) {
  const currentAccount = await getCurrentAccount();
  if (!currentAccount)
    throw wrapError('User account not connected when trying to play a quest!', {
      questAddress,
    });
}

export function getTagSuggestions() {
  return questList.map((x) => x.tags).flat();
}

// #endregion
