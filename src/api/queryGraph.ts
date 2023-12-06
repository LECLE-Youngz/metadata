export const queryNftsByAddress = `
query getNFT($address: String, $collectionAddr: String) {
  transfersTo: transfers(where: {to: $address, contract: $collectionAddr}) {
    tokenId
  }
  transfersFrom: transfers(where: {from: $address, contract: $collectionAddr}) {
    tokenId
  }
}
`;

export const queryAllNfts = `
query getAllNFT {
  transfers(where: { from: "0x0000000000000000000000000000000000000000" }) {
    tokenId
  }
}`;

export const queryPromptBoughts = `
query getPromptBoughts($address: String, $tokenId: String) {
    promptBoughts(where: {nftAddress: $address, tokenId: $tokenId}) {
        buyer
    }
    itemBoughts(where: {nftAddress: $address, tokenId: $tokenId}) {
        buyer
    }
    transfers(where: {from: "0x0000000000000000000000000000000000000000", contract: $address, tokenId: $tokenId}) {
        to
    }
  }
`;
// Query all nft by collection address
export const queryAllCollectionByAddress = `
query getAllCollectionByAddress($address: String) {
    transfersTo: transfers(where: {to: $address}) {
        contract
        tokenId
    }

    transfersFrom: transfers(where: {from: $address}) {
        contract
        tokenId
    }
  }
`;

/* address = collectionAddress
   tokenId
   return: ownerAddres of that NFT 
*/
export const queryOwnerByIdNCollection = `
query getOwnerByIdNCollection($address: String, $tokenId: String) {
    transfers(where: {contract: $collectionAddr, tokenId: tokenId}
      orderDirection: desc) {
      to
    }
  }
`;


// query all prompt buyers
export const queryPromptBuyers = `
query queryPromptBuyers($address: String, $tokenId: String) {
    promptBoughts(where: {nftAddress: $address, tokenId: $tokenId}) {
        buyer
    }
  }
`;

export const queryPromptAllowsByAddress = `
query getPromptBoughts($address: String) {
  promptBoughts(where: {buyer: $address}) {
    nftAddress
    tokenId
  }
  itemBoughts(where: {buyer: $address}) {
    nftAddress
    tokenId
  }
  transfers(where: {from: "0x0000000000000000000000000000000000000000", to: $address}) {
    contract
    tokenId
  }
  }
`;

export const queryAllCollection = `
query getAllCollection {
    erc721TokenCreateds {
        tokenAddress
    }
  }
`;

// get list tokenId and address deployer by address collection

export const queryDeployerByCollection = ` 
query getDeployerByCollection($address: String) {
    erc721TokenCreateds(where: {tokenAddress: $address}) {
        owner
    }
}
`

// get all collection by deployer
export const queryAllCollectionByDeployer = `
query getAllCollectionByDeployer($address: String) {
    erc721TokenCreateds(where: {owner: $address}) {
        tokenAddress
        owner
    }
}
`

export const queryDeplpoyerByCollection = `
query getDeployerByCollection($address: String) {
    erc721TokenCreateds(where: {tokenAddress: $address}) {
        owner
    }
}
`


export const getAllSubscriber = `
query getAllSubscriber($creatorAddr: String) {
  premiumMemberSubscribeds(where: {creator: $creatorAddr}) {
    subscriber
  }
}
`
export const getAllSubscribing = `
query getAllSubscribing($userAddr: String) {
  premiumNFTTransfers(where: {to: $userAddr}) {
    contract
    tokenId
  }
}
`