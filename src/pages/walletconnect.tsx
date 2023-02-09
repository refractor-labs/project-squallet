// @flow
import * as React from 'react';
import {useState} from "react";
export const Walletconnect = () => {
    const [uri, setUri] = useState('')
    const [loading, setLoading] = useState(false)
    async function onConnect(uri: string) {
        try {
            setLoading(true)
            const { version } = parseUri(uri)

            // Route the provided URI to the v1 SignClient if URI version indicates it, else use v2.
            if (version === 1) {
                createLegacySignClient({ uri })
            } else {
                await signClient.pair({ uri })
            }
        } catch (err: unknown) {
            alert(err)
        } finally {
            setUri('')
            setLoading(false)
        }
    }

    return (
        <div>

        </div>
    );
};