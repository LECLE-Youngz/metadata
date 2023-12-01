export type ResponseWallet = {
    publicKey: string;
    address: string;
    owner: string;
}

export type Transfer = {
    __typename: string;
    tokenId: string;
    to: string;
}

export type ResponseNftTokenId = {
    data: { transfers: Transfer[] }
}

export type PromptBought = {
    __typename: string;
    buyer: string;
}

export type ItemBought = {
    __typename: string;
    buyer: string;
}

export type QueryResponseBought = {
    promptBoughts: PromptBought[];
    itemBoughts: ItemBought[];
    transfers: Transfer[];
}