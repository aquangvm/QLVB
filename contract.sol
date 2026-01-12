// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721, Ownable {
    string public constant URI = "http://ipfs/ipfs/";
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    constructor()
        ERC721("QLVB", "QLVB")
        Ownable(msg.sender)
    {}

    struct DiplomaData {
        uint256 tokenId;
        string studentId;
        string dipId;
        string xeploai;
        string dateOfBirth;
        string yearIssued;
        string nftCID;
    }
    mapping(uint256 => string) public tokenURIs;
    mapping(string => DiplomaData) public listDataDipWithDipId;
    mapping(string => DiplomaData) public listDataDipWithStudenId;
    mapping(uint256 => DiplomaData) public listDataDipWithTokenId;
    mapping(string => uint256[]) public listDataDipWithXeploai;
    mapping(string => uint256[]) public listDataDipWithDateOfBirth;
    mapping(string => uint256[]) public listDataDipWithYearIssued;

    event CreateNFTEvent(uint256 tokenId, string studenId, string dipId, string nftCID);

    function createNFT(string memory studentId, string memory dipId, string memory xeploai, string memory dateOfBirth, string memory yearIssued, string memory nftCID) public onlyOwner {  
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
        tokenURIs[tokenId] = nftCID;

        DiplomaData memory newDiploma = DiplomaData(tokenId, studentId, dipId, xeploai, dateOfBirth, yearIssued, nftCID);

        listDataDipWithDipId[dipId] = newDiploma;
        
        listDataDipWithStudenId[studentId] = newDiploma;
        listDataDipWithTokenId[tokenId] = newDiploma;
        listDataDipWithXeploai[xeploai].push(tokenId);
        listDataDipWithDateOfBirth[dateOfBirth].push(tokenId);
        listDataDipWithYearIssued[yearIssued].push(tokenId);
        
        emit CreateNFTEvent(tokenId, studentId, dipId, nftCID);
    
    }


    function removeNFT(uint256 tokenId) public onlyOwner {
       
        string memory studentID = listDataDipWithTokenId[tokenId].studentId;
        string memory dipId = listDataDipWithTokenId[tokenId].dipId;
        string memory xeploai = listDataDipWithTokenId[tokenId].xeploai;
        string memory dateOfBirth = listDataDipWithTokenId[tokenId].dateOfBirth;
        string memory yearIssued = listDataDipWithTokenId[tokenId].yearIssued;
        delete listDataDipWithDipId[dipId];
        delete listDataDipWithStudenId[studentID];
        delete listDataDipWithTokenId[tokenId];
        
        // Remove from arrays
        uint256[] storage xeploaiList = listDataDipWithXeploai[xeploai];
        for (uint i = 0; i < xeploaiList.length; i++) {
            if (xeploaiList[i] == tokenId) {
                xeploaiList[i] = xeploaiList[xeploaiList.length - 1];
                xeploaiList.pop();
                break;
            }
        }
        
        uint256[] storage dateList = listDataDipWithDateOfBirth[dateOfBirth];
        for (uint i = 0; i < dateList.length; i++) {
            if (dateList[i] == tokenId) {
                dateList[i] = dateList[dateList.length - 1];
                dateList.pop();
                break;
            }
        }
        
        uint256[] storage yearList = listDataDipWithYearIssued[yearIssued];
        for (uint i = 0; i < yearList.length; i++) {
            if (yearList[i] == tokenId) {
                yearList[i] = yearList[yearList.length - 1];
                yearList.pop();
                break;
            }
        }
    }


    function searchWithDipId(string memory dipId) public view returns (uint256) {
        return listDataDipWithDipId[dipId].tokenId; 
    }

    function searchWithStudentId(string memory studenId) public view returns (uint256) {
        return listDataDipWithStudenId[studenId].tokenId;
    }

    function searchXeploai(string memory xeploai) public view returns (uint256[] memory) {
        return listDataDipWithXeploai[xeploai];
    }

    function searchDateOfBirth(string memory dateOfBirth) public view returns (uint256[] memory) {
        return listDataDipWithDateOfBirth[dateOfBirth];
    }

    function searchYearIssued(string memory yearIssued) public view returns (uint256[] memory) {
        return listDataDipWithYearIssued[yearIssued];
    }

    function tokenURI(uint256 tokenId) public override  view returns(string memory) {
        return tokenURIs[tokenId];
    }

}