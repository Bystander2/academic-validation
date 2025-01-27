import { AccountUpdate, Mina, PrivateKey, UInt32 } from "o1js";
import { AcademicValidation } from "./AcademicValidation.js";

const useProof = false;

// 配置网络和账户
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;

// 在Local部署合约
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new AcademicValidation(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  await zkAppInstance.deploy();
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// 获取初始论文原创值和平均评分
const originality0 = zkAppInstance.originality.get();
const averageScore0 = await zkAppInstance.getAverageScore();
console.log('初始论文原创值:', originality0.toString());
console.log('初始论文平均评分:', averageScore0.toString());

// 应该验证通过
const txn1 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.verifyOriginality();
});
await txn1.prove();
await txn1.sign([senderKey]).send();

// 测试打分方法
const txn2 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.scorePaper(UInt32.from(8));
});
await txn2.prove();
await txn2.sign([senderKey]).send();

const txn3 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.scorePaper(UInt32.from(10));
});
await txn3.prove();
await txn3.sign([senderKey]).send();

const txn4 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.scorePaper(UInt32.from(1));
});
await txn4.prove();
await txn4.sign([senderKey]).send();

const txn5 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.setAverageScore();
});
await txn5.prove();
await txn5.sign([senderKey]).send();

// 获取平均评分
const averageScore1 = await zkAppInstance.getAverageScore();
console.log('打分之后的平均评分:', averageScore1.toString());
