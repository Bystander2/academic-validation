"use client";
import Head from "next/head";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import LoginButton from "@components/LoginButton";
import ReviewList from "@components/ReviewList";

import "./reactCOIServiceWorker";

export default function Home() {
  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <GradientBG>
        <main className={styles.main}>
          <div className="w-full">
            <LoginButton />
          </div>
          <div className={styles.center}>
            <p className="text-4xl font-bold">Academic Validation</p>
          </div>
          <ReviewList />
        </main>
      </GradientBG>
    </>
  );
}
