export type ResponseWallet = {
    publicKey: string;
    address: string;
    owner: string;
}

export type Transfer = {
    __typename: string;
    tokenId: string;
}

export type ResponseNftByAddressGraph = {
    data: { transfers: Transfer[] }
}