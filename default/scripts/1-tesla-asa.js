const { executeTransaction, balanceOf } = require('@algo-builder/algob');
const { mkParam } = require('./common/common');

/*
  Create "tesla" Algorand Standard Asset (ASA)
  Accounts are loaded from config
  To use ASA accounts have to opt-in and owner is opt-in by default
  john is transferred some funds to execute opt-in transaction
*/
async function run(runtimeEnv, deployer) {
  console.log('[tesla]: Script has started execution!');

  const masterAccount = deployer.accountsByName.get('master-account');
  const alice = deployer.accountsByName.get('alice');
  const john = deployer.accountsByName.get('john');

  await executeTransaction(
    deployer,
    mkParam(masterAccount, alice.addr, 40e6, { note: 'funding account' })
  );
  await executeTransaction(
    deployer,
    mkParam(masterAccount, john.addr, 40e6, { note: 'funding account' })
  );

  const asaInfo = await deployer.deployASA('tesla', { creator: alice });
  console.log(asaInfo);

  await deployer.optInAcountToASA(asaInfo.assetIndex, 'john', {});

  const assetID = asaInfo.assetIndex;
  await balanceOf(deployer, alice.addr, assetID);

  console.log('[tesla]: Script execution has finished!');
}

module.exports = { default: run };
