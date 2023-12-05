export type ResponseWallet = {
    publicKey: string;
    address: string;
    owner: string;
}

export type Transfer = {
    __typename: string;
    tokenId: string;
    to: string;
    contract: string;
}

export type ResponseNftTokenId = {
    data: {
        transfers: Transfer[],
        transfersTo: Transfer[],
        transfersFrom: Transfer[],
    }
}

export type PromptBought = {
    __typename: string;
    buyer: string;
    tokenId: string;
    nftAddress: string;
}

export type ItemBought = {
    __typename: string;
    buyer: string;
    tokenId: string;
    nftAddress: string;
}

export type QueryResponseBought = {
    data: {
        promptBoughts: PromptBought[];
        itemBoughts: ItemBought[];
        transfers: Transfer[];
    }
}

export type ResponseListOwner = {
    data: {
        transfers: Transfer[],
    }

}

export type QueryResponseListOwner = {
    transfers: Transfer[];
}

export type ResponseListNftAndCollection = {
    data: {
        transfersTo: Transfer[],
        transfersFrom: Transfer[],
    }
}

export type ResponseListPromptByAddress = {

    data: {
        promptBoughts: PromptBought[],
        itemBoughts: ItemBought[],
        transfers: Transfer[],
    }

}

export type ExportNftCollection = {
    tokenId: number;
    contract: string;
}

export type ResponseListCollection = {
    data: {
        erc721TokenCreateds: {
            tokenAddress: string;
        }[]
    }
}