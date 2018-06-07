pragma solidity ^0.4.24;

import './ItemFactory.sol';
import '../../libs/math/SafeMath.sol';

contract ItemAuction is ItemFactory {

  struct Auction {
    address seller;
    uint128 price;
  }

  mapping (uint256 => Auction) public tokenIdToAuction;

  /// @dev Function to create an auction.
  /// @dev The caller transfers the token to the ERC721 contract
  /// @dev which will hold the token until an acceptable bid has been laid.
  /// @dev Check function: bid
  /// @param _tokenId id of the token to be auctioned
  /// @param _price price of which the item is to be sold for
  function createAuction(uint256 _tokenId, uint128 _price) public {
    require(
      msg.sender == erc721.ownerOf(_tokenId),
      'REVERT: createAuction - function caller is not the token owner.'
    );
    erc721.transferFrom(msg.sender, ERC721_TOKEN_ADDRESS, _tokenId);
    Auction memory _auction = Auction({
      seller: msg.sender,
      price: _price
    });

    tokenIdToAuction[_tokenId] = _auction;
  }

  /// @dev Function to bid on an auction.
  /// @dev Will transfer ERC20 tokens from the function caller to the auction creator,
  /// @dev and finally the ERC721 token from the ERC721 contract address to the bidder.
  /// @param _tokenId id of the ERC721 token that is to be bid on.
  function bid(uint256 _tokenId) public {
    Auction memory _auction = tokenIdToAuction[_tokenId];
    require(
      spaceLeagueToken.balanceOf(msg.sender) >= _auction.price,
      'REVERT: bid - function caller has as too low balance'
    );

    delete tokenIdToAuction[_tokenId];
    spaceLeagueToken.transferFrom(msg.sender, _auction.seller, _auction.price);
    erc721.transferFrom(ERC721_TOKEN_ADDRESS, msg.sender, _tokenId);
  }

  /// @dev Function to cancel an auction.
  /// @dev Reverts if msg.sender does not equal the auction creator.
  /// @param _tokenId id of the ERC721 token
  function cancel(uint256 _tokenId) public {
    Auction memory _auction = tokenIdToAuction[_tokenId];
    require(
      _auction.seller == msg.sender,
      'REVERT: cancel - function caller is not the auction creator.'
    );

    delete tokenIdToAuction[_tokenId];

    erc721.transferFrom(ERC721_TOKEN_ADDRESS, msg.sender, _tokenId);
  }

}