import { Ecies } from '@toruslabs/eccrypto';
import BN from 'bn.js';
export type GetAddressRequest = {
    email: string;
    verifier: string;
};

export type GetAddressResponse = {
    owner: string;
    publicKey: string;
    address: string;
};

export type ShareResponse = {
    share: string;
    threshold: number;
    publicKey: string;
    metadata: {
        [key in keyof Ecies]: string;
    };
};

export type GetPrivateKeyResponse = {
    ethAddress: string;
    privKey: string;
};

export type CommitmentResponse = {
    signature: string;
};


export type ErrorApi = {
    statusCode: string;
    errorMessage?: string;
};

export type GetPrivateKeyRequest = {
    owner: string;
    idToken: string;
    verifier: string;
};
