export type ResponseWallet = {
    publicKey: string;
    address: string;
    owner: string;
}

export type Transfer = {
    __typename: string;
    tokenId: string;
}

export type ResponseNftTokenId = {
    data: { transfers: Transfer[] }
}

// export type ResponsePromptAllower = {
//     data: { promptBoughts: string[] }
// }