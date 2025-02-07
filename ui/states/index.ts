import { atom } from "jotai";

//评审者账号地址
const reviewAccountAtom = atom<string>("");

//被评审人账号地址
const evaluatedAtom = atom<string>(
  "B62qnTDEeYtBHBePA4yhCt4TCgDtA4L2CGvK7PirbJyX4pKH8bmtWe5"
);

//同步账号更新loading
const loadingAtom = atom<boolean>(false);

export { reviewAccountAtom, evaluatedAtom, loadingAtom };
