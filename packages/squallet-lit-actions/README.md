# @refactor-labs/squallet-lit-actions

This package contains the build pipeline for transpiling from a typescript lit action to javascript source code.

The lit action source code is then packaged into a module so it can be imported by another package like this.

`import { multiSigActionSource } from '@refactor-labs/squallet-lit-actions'`


# Building

`yarn run build`

Storing signers and threshold template variables to be replaced:


```javascript
const authorizedAddresses = ['%%OWNER_ADDRESS%%']
const threshold = 11337012321
```