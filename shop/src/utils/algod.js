/* global AlgoSigner */
import { CHAIN_NAME } from '../algosigner.config';

const LAST_ROUND = 'last-round';
const CONFIRMED_ROUND = 'confirmed-round';

export const waitForConfirmation = async function (txId) {
  let response = await AlgoSigner.algod({
    ledger: CHAIN_NAME,
    path: '/v2/status',
  });
  console.log(response);
  let lastround = response[LAST_ROUND];
  while (true) {
    const pendingInfo = await AlgoSigner.algod({
      ledger: CHAIN_NAME,
      path: `/v2/transactions/pending/${txId}`,
    });
    if (
      pendingInfo[CONFIRMED_ROUND] !== null &&
      pendingInfo[CONFIRMED_ROUND] > 0
    ) {
      return pendingInfo;
    }
    lastround++;
    await AlgoSigner.algod({
      ledger: CHAIN_NAME,
      path: `/v2/status/wait-for-block-after/${lastround}`,
    });
  }
};
