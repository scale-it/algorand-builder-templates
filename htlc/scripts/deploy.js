const algob = require('@algo-builder/algob');
const { types } = require('@algo-builder/runtime');
const jssha256 = require('js-sha256');

let executeTransaction = algob.executeTransaction;
let sha256 = jssha256.sha256;

async function getDeployerAccount(deployer, name) {
  const account = deployer.accountsByName.get(name);
  if (account === undefined) {
    throw new Error(`Account ${name} is not defined`);
  }
  return account;
}

async function run(runtimeEnv, deployer) {
  const masterAccount = await getDeployerAccount(deployer, 'master-account');
  const bob = await getDeployerAccount(deployer, 'bob');
  const alice = await getDeployerAccount(deployer, 'alice');

  const secret = 'hero wisdom green split loop element vote belt';
  const secretHash = Buffer.from(sha256.digest(secret)).toString('base64');

  const scTmplParams = {
    bob: bob.addr,
    alice: alice.addr,
    hash_image: secretHash,
  };

  /** ** firstly we fund Alice and Bob accounts ****/
  const bobFunding = {
    type: types.TransactionType.TransferAlgo,
    sign: types.SignType.SecretKey,
    fromAccount: masterAccount,
    toAccountAddr: bob.addr,
    amountMicroAlgos: 10e6, // 10 Algos
    payFlags: { note: 'funding account' },
  };
  // We need to copy, because the executeTransaction is async
  const aliceFunding = Object.assign({}, bobFunding);
  aliceFunding.toAccountAddr = alice.addr;
  aliceFunding.amountMicroAlgos = 0.1e6; // 0.1 Algo
  await Promise.all([
    executeTransaction(deployer, bobFunding),
    executeTransaction(deployer, aliceFunding),
  ]);

  /** ** now bob creates and deploys the escrow account ****/
  console.log('hash of the secret:', scTmplParams.hash_image);
  // hash: QzYhq9JlYbn2QdOMrhyxVlNtNjeyvyJc/I8d8VAGfGc=

  await deployer.fundLsig(
    'htlc.py',
    { funder: bob, fundingMicroAlgo: 2e6 },
    {},
    [],
    scTmplParams
  );

  // Add user checkpoint
  deployer.addCheckpointKV('User Checkpoint', 'Fund Contract Account');
}

module.exports = { default: run };
