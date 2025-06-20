import { create } from 'ipfs-http-client';

const projectId = process.env.IPFS_PROJECT_ID || '';
const projectSecret = process.env.IPFS_PROJECT_SECRET || '';
const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

export const ipfs = create({
    url: 'https://ipfs.infura.io:5001',
    headers: {
        authorization,
    },
});
// const helia = await createHelia();
// const s = strings(helia);

// const myImmutableAddress = await s.add("hello world");

// console.log(await s.get(myImmutableAddress));

const ipfsWrapper = async (code: string) => {
    const ipfsResp = await ipfs.add(code);
    return { cid: ipfsResp.cid.toString() };
};
export { ipfsWrapper };
