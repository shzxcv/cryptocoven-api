import {
  Transfer as TransferEvent,
  Token as TokenContract
} from '../generated/Token/Token'
import { json, Bytes, dataSource, log } from '@graphprotocol/graph-ts'

import {
Token, User, TokenMetadata
} from '../generated/schema'

import {
  TokenMetadata as TokenMetadataTemplate
  } from '../generated/templates'

const ipfshash = "QmaXzZhcYnsisuue5WRdQDH6FDvqkLQX1NckLqBYeYYEfm"

export function handleTransfer(event: TransferEvent): void {
  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenID = event.params.tokenId;

    token.tokenURI = "/" + "995" + ".json";
    const tokenIpfsHash = ipfshash + token.tokenURI
    token.ipfsURI = tokenIpfsHash;
    log.error("Create token metadata : {}",[tokenIpfsHash.toString()])
    TokenMetadataTemplate.create(tokenIpfsHash);
  }

  token.updatedAtTimestamp = event.block.timestamp;
  token.owner = event.params.to.toHexString();
  token.save();

  let user = User.load(event.params.to.toHexString());
  if (!user) {
    user = new User(event.params.to.toHexString());
    user.save();
  }
 }

 export function handleMetadata(content: Bytes): void {
  let tokenMetadata = new TokenMetadata(dataSource.stringParam());
  log.error("handleMetadata : {}",[dataSource.stringParam()])
  const value = json.fromBytes(content).toObject()
  if (value) {
    const image = value.get('image')
    const name = value.get('name')
    const description = value.get('description')
    if (name) {
      tokenMetadata.name = name.toString()
    }
    if (image) {
      tokenMetadata.image = image.toString()
    }
    if (description) {
      tokenMetadata.description = description.toString()
    }
    tokenMetadata.save()
  }
 }

