import { Cookies, useCookies } from 'react-cookie';
import { useCallback } from 'react';
import { web3Sign } from '../util';
import { useAccount, useSigner } from 'wagmi';
import { cookieName } from '../helpers/compareSignature';

const tokenExpireMaxAgeSeconds = 60 * 60 * 24 * 7;
export const useTokenCookie = () => {
    const [cookie, setCookie] = useCookies([cookieName]);

    const { address } = useAccount();
    const { data: signer } = useSigner();

    const generateTokenCallback = useCallback(async (): Promise<PrysmToken> => {
        if (!address || !signer) {
            throw new Error('Missing account and provider');
        }
        // Grab the cookie from dom again because useCookies caches cookies and will return an expired cookie.
        const currentCookie = getPrysmToken();
        if (
            currentCookie &&
            currentCookie.account &&
            currentCookie.signature &&
            Object.keys(currentCookie.signature).length > 0 &&
            currentCookie.token &&
            Number.isFinite(parseInt(currentCookie.token)) &&
            currentCookie.account === address &&
            !isPrysmTokenExpired()
        ) {
            // don't generate token if it already exists
            return currentCookie;
        }
        const token = await generatePrysmToken(address, signer);

        console.log('token', token);
        if (!token) {
            throw new Error('User has declined signature request');
        }
        if (token.error && token.error.code === 4001) {
            throw new Error('User has denied signature request');
        }

        setCookie(cookieName, JSON.stringify(token), {
            path: '/',
            maxAge: tokenExpireMaxAgeSeconds, // Expires after 1hr
            sameSite: true,
        });

        return token;
    }, [cookie, address, signer]);

    return { cookie: { token: cookie[cookieName] }, generateToken: generateTokenCallback };
};

export const getPrysmToken = () => {
    return new Cookies().get(cookieName);
};

export const isPrysmTokenExpired = () => {
    const cookie = new Cookies().get(cookieName);
    if (!cookie) {
        return true;
    }
    if (typeof cookie !== 'object') {
        return true;
    }
    const data = cookie;
    if (!data.expires) {
        return true;
    }
    const expires = new Date(data.expires);
    //if the token expires in less than 2 minutes, consider it expired
    if (expires < new Date(Date.now() + 2 * 60 * 1000)) {
        return true;
    }
    return false;
};

export interface PrysmToken {
    account: string;
    token: string;
    signature: string;
    error?: SignatureError;
    expires: string; //iso string
}
export type SignatureError = Error & { code: number };

let requestTokenSignatureLock: Promise<{
    signature: any;
    token: string;
    expires: Date;
}> | null = null;
export const generatePrysmToken = async (
    account: any,
    library: any,
): Promise<PrysmToken | undefined> => {
    try {
        let token: string;
        let expires: Date;
        let signature: any = null;

        if (requestTokenSignatureLock) {
            //wait for an existing signature request to finish
            const lock = requestTokenSignatureLock;
            const res = await lock;
            signature = res.signature;
            token = res.token;
            expires = res.expires;
            requestTokenSignatureLock = null;
        } else {
            // generate a new signature request
            const lockFunc = async () => {
                const token = Math.floor(Math.random() * 100000).toString();
                const expires = new Date(Date.now() + tokenExpireMaxAgeSeconds * 1000);
                const signature = await web3Sign(token, expires, account, library);
                return { signature, token, expires };
            };
            const lock = lockFunc();
            requestTokenSignatureLock = lock;
            const res = await lock;
            signature = res.signature;
            token = res.token;
            expires = res.expires;
            requestTokenSignatureLock = null;
        }

        if (!signature) {
            throw 'User denied signature request';
        }
        let error: (Error & { code: number }) | undefined = undefined;
        if (signature?.code) {
            error = signature;
        }
        if (Object.keys(signature).length === 0) {
            throw new Error('Signature is missing');
        }

        const payload: PrysmToken = {
            account,
            token,
            signature,
            error,
            expires: expires.toISOString(),
        };

        return payload;
    } catch (err) {
        console.log('failed to sign', err.toString());
        if (/returns a signature/.test(err.toString())) {
            return;
        }
        throw err;
    }
};

export const generateTokenIfNeeded = async (account: any, provider: any) => {
    if (isPrysmTokenExpired()) {
        const token = await generatePrysmToken(account, provider);
        console.log('token', token);
        new Cookies().set(cookieName, JSON.stringify(token), {
            path: '/',
            maxAge: tokenExpireMaxAgeSeconds, // Expires after 1hr
            sameSite: true,
        });
        console.log('generated token');
    } else {
        console.log('token not needed');
    }
};
