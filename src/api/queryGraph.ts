export const queryNftsByAddress = `
query getNFT($address: String) {
  transfers(where: {to: $address}) {
    tokenId
  }
}`;

export const queryAllNfts = `
query getAllNFT {
  transfers(where: { from: "0x0000000000000000000000000000000000000000" }) {
    tokenId
  }
}`;

export const queryListPromptAllower = `
query getListPromptAllower($tokenId: String) {
    promptBoughts(where: { tokenId: $tokenId }) {
        buyer
  }
}`;