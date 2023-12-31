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
export type ResponseListCollectionAndOwner = {
    data: {
        erc721TokenCreateds: {
            tokenAddress: string;
        }[],
    }
}

export type ExportCollectionAndOwner = {
    tokenAddress: string;
    owner: string;
}

export type ExportOwner = {
    owner: string;
}

export type ResponseOwner = {
    data: {
        erc721TokenCreateds: [{
            owner: string;
        }]
    }
}
// subscriber and subscribing

export type ResponseListSubscriber = {
    data: {
        premiumMemberSubscribeds: {
            subscriber: string;
        }[]
    }
}

export type ResponseListSubscribing = {
    data: {
        premiumNFTTransfers: {
            contract: string;
            tokenId: string;
        }[]
    }
}

export type ExportSubscribing = {
    contract: string;
    tokenId: string;
}

export type ResponseCreatorStatus = {
    data: {
        premiumTokenCreateds: {
            tokenAddress: string;
        }[]
    }
}
export type ResponseExclusiveNFTCreateds = {
    data: {
        exclusiveNFTCreateds: {
            tokenAddress: string;
        }[]
    }
}

export type ResponseVerifyTransferNft = {
    data: {
        itemBoughts: any,
        itemListeds: any,
    }
}

export type ResponseVerifyTransferPrompt = {
    data: {
        promptBoughts: any,
        itemListeds: any
    }
}


export type ResponseCollectionByAddress = {
    data: {
        nfttransfers: Array<{
            tokenId: string;
            contract: string;
        }>
    }
}

export type ResponseEvent = {
    data: {
        mysteryEventCreateds: Array<{
            tokenAddress: string;
        }>,
        luckyTokenCreateds: Array<{
            tokenAddress: string;
        }>
    }
}

export type ResponseEventByAddress = {
    data: {
        eventTransfers: Array<{
            tokenId: string;
        }>
    }
}

export type ResponseEventDeployer = {
    data: {
        eventCreateds: Array<{
            owner: string;
        }>,
    }
}

export type ResponseTags = {
    data: {
        mysteryBoxCreateds: Array<{
            id: string;
        }>,
        luckyTokenCreateds: Array<{
            id: string;
        }>,
        mysteryEventCreateds: Array<{
            id: string;
        }>,
        luckyTreasuryCreateds: Array<{
            id: string;
        }>
    }
}

export type ResponseMysteryByAddress = {
    data: {
        mysteryEventCreateds: Array<{
            tokenAddress: string;
        }>
    }
}

export type ResponseEventByDeployer = {
    data: {
        mysteryBoxCreateds: Array<{
            tokenAddress: string;
        }>,
        mysteryEventCreateds: Array<{
            tokenAddress: string;
        }>,
        luckyTokenCreateds: Array<{
            tokenAddress: string;
        }>,
    }
}