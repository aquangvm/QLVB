import axios from 'axios';

const IPFS_GATEWAY = 'https://magenta-repulsive-beetle-354.mypinata.cloud/ipfs/';
const IPFS_PIN_HOST = 'https://api.pinata.cloud/pinning/';
const API_KEY = 'b1cb9dbae83bf49998da';
const API_SECRET = 'f6e9c90c1ecd0114f42c9d6d05891783c70ef17e64220825cd8c03628d94dabc';

export const getIpfsUrl = (hash: string) => {
  return `${IPFS_GATEWAY}${hash}`;
};

export const pinObject = async (object: any) => {
  const url = `${IPFS_PIN_HOST}pinJSONToIPFS`;

  return axios.post(url, JSON.parse(object), {
    headers: {
      pinata_api_key: API_KEY,
      pinata_secret_api_key: API_SECRET
    }
  });
};

export const pinFileToIpfs = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${IPFS_PIN_HOST}pinFileToIPFS`;

  return axios.post(url, formData, {
    headers: {
      pinata_api_key: API_KEY,
      pinata_secret_api_key: API_SECRET,
      'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`
    }
  });
};
