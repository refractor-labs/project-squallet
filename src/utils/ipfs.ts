import { create } from "ipfs-http-client";

const projectId = "2LeRQnoqwGBEevYmOWyugMmDQRT";
const projectSecret = "6e5587db2185d495bed44d32fa2d35c5";
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

export const ipfs = create({
  url: "https://ipfs.infura.io:5001",
  headers:{
    authorization
  }
})
