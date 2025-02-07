"use client";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { reviewAccountAtom } from "@states/index";

declare global {
  interface Window {
    mina?: {
      requestAccounts: () => Promise<string[]>;
    };
  }
}

const LoginButton = () => {
  const setReviewerAccount = useSetAtom(reviewAccountAtom);
  const reviewerAccount = useAtomValue(reviewAccountAtom);

  useEffect(() => {
    if (!window.mina) {
      console.log("Auro Wallet must be installed!");
    }
  }, []);

  const onClickHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.mina) {
      console.log("Auro Wallet is not installed!");
      return;
    }

    try {
      const accounts = await window.mina.requestAccounts();
      if (accounts.length > 0) {
        setReviewerAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <button className="float-right w-[200px] truncate" onClick={onClickHandler}>
      {reviewerAccount ? reviewerAccount : "Login"}
    </button>
  );
};

export default LoginButton;
