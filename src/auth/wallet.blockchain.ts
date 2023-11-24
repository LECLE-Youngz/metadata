import * as EC from 'elliptic';

const ec = new EC.ec('secp256k1');

export type KeyPair = {
    publicKey: string,
    privateKey: string,
    address: string,
};

export const generateKeyPair = (): KeyPair => {
    const keyPair = ec.genKeyPair();
    const publicKey = keyPair.getPublic('hex');
    const privateKey = keyPair.getPrivate('hex');
    const address = keyPair.getPublic().encode('hex', true); // Use 'hex' with compressed flag
    return { publicKey, privateKey, address };
};

export const hashPrivateKeyWithIdTokenOauth2 = (privateKey: string, idToken: string): string => {
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const derivedKey = key.derive(idToken);
    return derivedKey.getPrivate('hex');
};

export const deHashPrivateKeyWithIdTokenOauth2 = (privateKeyHash: string, idToken: string): string => {
    const key = ec.keyFromPrivate(privateKeyHash, 'hex');
    const derivedKey = key.derive(idToken);
    return derivedKey.getPrivate('hex');
};

// test
const idToken = "..."; // Your idToken here
const keyPair = generateKeyPair();
console.log(keyPair);
console.log(hashPrivateKeyWithIdTokenOauth2(keyPair.privateKey, idToken));
console.log(deHashPrivateKeyWithIdTokenOauth2(hashPrivateKeyWithIdTokenOauth2(keyPair.privateKey, idToken), idToken));
