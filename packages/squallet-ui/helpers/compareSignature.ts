import { ethers } from 'ethers';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

export const tokenContents = (token: string, expiryDateString: string) => {
    const hash = `Sign-in\nOne-Time Key : ${token}\n${expiryDateString}`;
    return hash;
};

export function compareSignatures(req: NextApiRequest | NextRequest) {
    try {
        let tokenCookie: string | undefined = undefined;
        if ('geo' in req) {
            tokenCookie = req.cookies.get(cookieName)?.value;
        } else {
            tokenCookie = req.cookies[cookieName];
        }
        const signedData = tokenCookie ? JSON.parse(tokenCookie) : null;

        if (!signedData) throw 'User has not signed request';

        const { account, token, signature, expires } = signedData;
        const expiresDate = new Date(expires);
        if (!expires || !expiresDate) {
            throw new Error('Missing expires timestamp');
        }
        if (expiresDate < new Date()) {
            throw new Error('Token expired');
        }

        const hash = tokenContents(token, expiresDate.toISOString());

        const recoveredAddress = ethers.verifyMessage(hash, signature);

        if (recoveredAddress !== account) {
            throw 'Signatures do not match';
        }

        return {
            recoveredAddress,
        };
    } catch (e) {
        console.log(e);
        return {
            error: e,
        };
    }
}

export const cookieName = 'token';
