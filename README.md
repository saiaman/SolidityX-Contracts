# Setup for a workstation


*Follow this tutorial : https://code.visualstudio.com/docs/devcontainers/tutorial (stop at step Check installation)* 

In few words install an extension inside visual studio code and docker engine

# Quick tasks too help all you need

## Deploy a QRC20 ?

```shell
npx hardhat deploy_ERC20 (--network YOUR_SELECTED_NETWORK ) YourTokenFullName YourTokenACRONYM YourTokenSupply
```

**for example**

```shell
npx hardhat deploy_ERC20 Erc20_Test TERC20 1000000000
```

## Deploy a NFT ?

**this supposes you allready had uploaded metadata and images to a ipfs directory**

```shell
npx hardhat deploy_ERC721 (--network YOUR_SELECTED_NETWORK ) YourNFTCollectionName YourNftAcronym the full ipfs address
```

**for example**

```shell
npx hardhat deploy_ERC721 ERC721_Test E721T "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/"
```

## Mint a nft ?

Ok, you have a smart contract for NFT's .... but how to mint ????

```shell
npx hardhat mint_ERC721 (--network YOUR_SELECTED_NETWORK ) YourNFTContractAddress DestinationAddress
```

# More documentation to come, be patient :)
