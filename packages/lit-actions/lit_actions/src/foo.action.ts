/**
 * NAME: foo
 *
 * ⬆️ Replace "_" with "M" to pass the schema validation
 *
 */
import { ethers } from "ethers";

const foo = () => {
  // @ts-ignore
  console.log("bignumber", ethers.utils.BigNumber.from("0x1"));

  return "bar";
};
foo();
