# Quai Hardhat With abstract contracts and QRC's factory

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# Quick tasks too help all you need

## Deploy a QRC20 ?

```shell
npx harhat deploy_ERC20 (--network YOUR_SELECTED_NETWORK ) YourTokenFullName YourTokenACRONYM YourTokenSupply
```

**for example**

```shell
npx harhat deploy_ERC20 Erc20_Test TERC20 1000000000
```

## Deploy a NFT ?

**this supposes you allready had uploaded metadata and images to a ipfs directory**

```shell
npx harhat deploy_ERC721 (--network YOUR_SELECTED_NETWORK ) YourNFTCollectionName YourNftAcronym the full ipfs address
```

**for example**

```shell
npx harhat deploy_ERC721 ERC721_Test E721T "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/"
```

# More documentation to come, be patient :)
