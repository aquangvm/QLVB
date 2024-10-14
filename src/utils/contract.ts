import { BigNumber, Contract, ethers } from 'ethers';
import ABI from '../common/contract-abi.json';
import CollectionABI from '../common/collection-abi.json';
import { COLLECTION_ADDRESS, MANAGER_PROXY_ADDRESS } from './constant';
import getUnixTime from 'date-fns/getUnixTime';

export const connectMetamask = async () => {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  return new ethers.Contract(MANAGER_PROXY_ADDRESS, ABI, signer);
};

export const bscTestnetProvider = new ethers.providers.JsonRpcProvider(
  'https://rpc.holesky.ethpandaops.io/'
);
export const collectionContract = new ethers.Contract(
  COLLECTION_ADDRESS,
  CollectionABI,
  bscTestnetProvider
);

export const createNFT = async (
  contract: Contract,
  studentId: string,
  dipId: string,
  tokenCid: string
): Promise<BigNumber> => {
  const tx = await contract.createNFT(studentId, dipId, tokenCid);
  const wait = await tx.wait();
  const { events } = wait;
  const event = events.find((e: any) => e.event === 'CreateNFTEvent');
  return event.args.tokenId;
};

export const removeNFT = async (
  contract: Contract,
  tokenId: BigNumber
): Promise<void> => {
  const tx = await contract.removeNFT(tokenId);
  await tx.wait();
}

export const findByDipId = async (contract: Contract, dipId: string): Promise<BigNumber> => {
  return await contract.searchWithDipId(dipId);
};

export const findByStudenId = async (
  contract: Contract,
  studentId: string
): Promise<BigNumber[]> => {
  return await contract.searchWithStudentId(studentId);
};

export const getUriById = async (contract: Contract, tokenId: string) => contract.tokenURI(tokenId);
// export const getUriById = async (
//   contract: Contract,
//   tokenId: string
// ): Promise<BigNumber[]> => {
//   return await contract.tokenURI(tokenId);
// };
