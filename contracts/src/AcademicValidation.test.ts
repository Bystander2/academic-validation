import { AcademicValidation } from './AcademicValidation';
import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32 } from 'o1js';

describe("AcademicValidation Contract", () => {
    const useProof = false;

    let deployerAccount: Mina.TestPublicKey;
    let deployerKey: PrivateKey;
    let senderAccount: Mina.TestPublicKey;
    let senderKey: PrivateKey;
    let zkAppPrivateKey: PrivateKey;
    let zkAppAddress: PublicKey;
    let zkAppInstance: AcademicValidation;

    beforeAll(async () => {
        // 设置本地Mina网络
        const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
        Mina.setActiveInstance(Local);
        deployerAccount = Local.testAccounts[0];
        deployerKey = deployerAccount.key;
        senderAccount = Local.testAccounts[1];
        senderKey = senderAccount.key;

        // 初始化合约
        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkAppInstance = new AcademicValidation(zkAppAddress);

        // 部署合约
        const deployTxn = Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkAppInstance.deploy();
        });
        await deployTxn.prove();
        await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
    });

    it("should initialize with correct default values", async () => {
        const originality = await zkAppInstance.originality.get();
        const averageScore = await zkAppInstance.getAverageScore();

        expect(originality.toString()).toBe("1");
        expect(averageScore.toString()).toBe("0");
    });

    it("should verify originality successfully", async () => {
        const txn = Mina.transaction(senderAccount, async () => {
            await zkAppInstance.verifyOriginality();
        });
        await txn.prove();
        await txn.sign([senderKey]).send();

        // 如果验证失败，合约会抛出错误，所以没有抛错即验证成功
        expect(true).toBe(true);
    });

    it("should allow scoring paper", async () => {
        const txn1 = await Mina.transaction(senderAccount, async () => {
            await zkAppInstance.scorePaper(UInt32.from(8));
        });
        await txn1.prove();
        await txn1.sign([senderKey]).send();

        const txn2 = await Mina.transaction(senderAccount, async () => {
            await zkAppInstance.scorePaper(UInt32.from(10));
        });
        await txn2.prove();
        await txn2.sign([senderKey]).send();

        const txn3 = await Mina.transaction(senderAccount, async () => {
            await zkAppInstance.scorePaper(UInt32.from(1));
        });
        await txn3.prove();
        await txn3.sign([senderKey]).send();

        // 如果没有报错，打分已成功提交
        expect(true).toBe(true);
    });

    it("should calculate the average score correctly", async () => {
        const txn = Mina.transaction(senderAccount, async () => {
            await zkAppInstance.setAverageScore();
        });
        await txn.prove();
        await txn.sign([senderKey]).send();
    
        const averageScore = await zkAppInstance.getAverageScore();
        expect(averageScore.toString()).toBe("6"); // (8 + 10 + 1) = 6
    });
});