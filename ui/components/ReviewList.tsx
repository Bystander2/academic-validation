/* eslint-disable @typescript-eslint/no-unused-expressions */
import { evaluatedAtom, loadingAtom, reviewAccountAtom } from "@states/index";
import styles from "@styles/Home.module.css";
import { useAtomValue, useSetAtom } from "jotai";
import { fetchAccount, Mina, PublicKey } from "o1js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Add } from "../../contracts/build/src/Add";
// const zkAppAddress = "B62qnTDEeYtBHBePA4yhCt4TCgDtA4L2CGvK7PirbJyX4pKH8bmtWe5";

const ReviewList = () => {
  const useReviewerAccount = useAtomValue(reviewAccountAtom);
  console.log("use:", useReviewerAccount);
  const setActive = useSetAtom(evaluatedAtom);
  const useActive = useAtomValue(evaluatedAtom);
  const setLoading = useSetAtom(loadingAtom);
  const useLoading = useAtomValue(loadingAtom);
  const zkApp = useRef<Add>(new Add(PublicKey.fromBase58(useActive)));

  const [transactionLink, setTransactionLink] = useState<string | null>(null);
  const [contractState, setContractState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // fetch the zkapp state when the page loads
  useEffect(() => {
    (async () => {
      Mina.setActiveInstance(
        Mina.Network("https://api.minascan.io/node/devnet/v1/graphql")
      );
      await fetchAccount({ publicKey: useActive });
      const num = zkApp.current.num.get();
      setContractState(num.toString());

      // Compile the contract so that o1js has the proving key required to execute contract calls
      console.log(
        "Compiling Add contract to generate proving and verification keys"
      );
      await Add.compile();

      setLoading(false);
    })();
  }, [useActive]);

  const updateZkApp = useCallback(async () => {
    setTransactionLink(null);
    setLoading(true);

    try {
      // Retrieve Mina provider injected by browser extension wallet
      const mina = (window as any).mina;
      const walletKey: string = (await mina.requestAccounts())[0];
      console.log("Connected wallet address: " + walletKey);
      console.log("wallet:", useReviewerAccount);
      if (useReviewerAccount) {
        await fetchAccount({
          publicKey: PublicKey.fromBase58(useReviewerAccount),
        });
      }

      //Execute a transaction locally on the browser
      const transaction = await Mina.transaction(async () => {
        console.log("Executing Add.update() locally");
        await zkApp.current.update();
      });

      // Prove execution of the contract using the proving key
      console.log("Proving execution of Add.update()");
      await transaction.prove();

      // Broadcast the transaction to the Mina network
      console.log("Broadcasting proof of execution to the Mina network");
      const { hash } = await mina.sendTransaction({
        transaction: transaction.toJSON(),
      });

      // display the link to the transaction
      const transactionLink = "https://minascan.io/devnet/tx/" + hash;
      setTransactionLink(transactionLink);
    } catch (e: any) {
      console.error(e.message);
      let errorMessage = "";
      if (
        e.message.includes(
          "Cannot read properties of undefined (reading 'requestAccounts')"
        )
      ) {
        errorMessage = "Is Auro installed?";
      } else if (e.message.includes("Please create or restore wallet first.")) {
        errorMessage = "Have you created a wallet?";
      } else if (e.message.includes("User rejected the request.")) {
        errorMessage = "Did you grant the app permission to connect?";
      } else {
        errorMessage = "An unknown error occurred.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const onClickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const id = e.currentTarget.getAttribute("id");
    if (id === useActive) {
      setActive("");
    } else {
      setActive(id);
    }
  };

  const onChangeHandler = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      const value = Number(e.currentTarget.value);
      if (value <= 0 || value > 10) {
        setError("Please enter 0-10");
        setTimeout(() => setError(null), 1000);
      }
    },
    []
  );
  return useReviewerAccount ? (
    <div className={styles.grid}>
      <a
        className={`${styles.card} ${
          useActive ===
          "B62qnTDEeYtBHBePA4yhCt4TCgDtA4L2CGvK7PirbJyX4pKH8bmtWe5"
            ? styles.active
            : ""
        }`}
        onClick={onClickHandler}
        id="B62qnTDEeYtBHBePA4yhCt4TCgDtA4L2CGvK7PirbJyX4pKH8bmtWe5"
      >
        <h2>
          <span>B62qnTDEeYtBHBePA4yhCt4TCgDtA4L2CGvK7PirbJyX4pKH8bmtWe5</span>
        </h2>
        <p>
          An approach to 24-hour electrocardiogram monitoring in sheep
          experimental model
        </p>
      </a>
      {useActive ? (
        <div className={styles.state}>
          <div>
            <div>
              Evaluated: <span className={styles.bold}>{useActive}</span>
            </div>
            {error ? (
              <span className={styles.error}>Error: {error}</span>
            ) : useLoading ? (
              <div>Loading...</div>
            ) : transactionLink ? (
              <a
                href={transactionLink}
                className={styles.bold}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction on MinaScan
              </a>
            ) : (
              <>
                <input
                  className={styles.button}
                  type="number"
                  onChange={onChangeHandler}
                />
                <button onClick={updateZkApp}>Sumbit</button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  ) : (
    <p>Please login first!</p>
  );
};

export default ReviewList;
