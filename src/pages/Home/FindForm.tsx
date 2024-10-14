import React, { useState } from 'react';
import { Button, Form, Input, Table } from 'antd';
import styled from 'styled-components';
import { FileSearchOutlined, QrcodeOutlined } from '@ant-design/icons';

import { UserOutlined } from '@ant-design/icons';
import {
  connectMetamask,
  findByStudenId,
  getUriById,
  removeNFT,
  findByDipId
} from '../../utils/contract';
import { getIpfsUrl } from '../../utils/ipfs';
import { BigNumber } from 'ethers';
import { Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import moment from 'moment';
import axios from 'axios';

const Layout = styled.div`
  padding-top: 0.5rem;
`;

const InputIcon = styled(FileSearchOutlined)`
  opacity: 0.5;
`;

type FormValues = {
  dipId: string;
};

const FindForm = () => {
  //const [form] = Form.useForm<FormValues>();

  const [form] = Form.useForm<FormValues>();

  const [diplomas, setDiplomas] = useState<any[]>([]);

  const [statusCallBC, setStatusCallBC] = useState<boolean>(false);

  const columns = [
    {
      title: 'Số hiệu',
      dataIndex: 'dipId',
      key: 'dipId'
    },
    {
      title: 'Tên sinh viên',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: any, { createdAt }: any) => moment(createdAt).format("YYYY/MM/DD")
    },
    {
      title: 'Văn bằng',
      dataIndex: 'ipfsHash',
      key: 'ipfsHash',
      render: (text: any, { ipfsHash }: any) => (
        <a href={getIpfsUrl(ipfsHash)} target="_blank" rel="noopener noreferrer">
          Download
        </a>
      )
    }
  ];

  const onFinish = async (values: FormValues) => {
    setStatusCallBC(true);
    try {
      const contract = await connectMetamask();

      const { dipId } = values;

      const ids = await findByDipId(contract, dipId);

      const newArray = [BigNumber.from(ids).toString()];

      const tokens = await Promise.all(
        newArray.map(async (id) => ({
          id: id.toString(),
          uri: await getUriById(contract,id.toString())
        }))
      );

      // const dips = await Promise.all(
      //   tokens.map(async ({ id, uri }) => ({
      //     id,
      //     ...(await fetch(uri).then((res) => res.json()))
      //   }))
      // );

      let arr: any[] = []

      for (let i = 0; i < tokens.length; i++) {
        const element = tokens[i];


        const data = await axios.get("https://magenta-repulsive-beetle-354.mypinata.cloud/ipfs/" + element.uri)




        arr.push({ ...data.data, id: element.id })  

      }

      const dips = await Promise.all(
        arr
      );
      setDiplomas(dips);

      setStatusCallBC(false);
      toast.success('thành công');
    } catch (error) {
      toast.error('lỗi');
      setStatusCallBC(false);
    }
  };

  return (
    <Layout>
      <Form form={form} layout={'vertical'} onFinish={onFinish}>
        <Form.Item label="Số hiệu văn bằng" required={true} name={'dipId'}>
          <Input prefix={<InputIcon />} placeholder="Nhập số hiệu văn bằng" />
        </Form.Item>
        {/* <Form.Item>
          <Button icon={<QrcodeOutlined />}>Quét mã QR</Button>
        </Form.Item> */}
        <div style={{ textAlign: 'center' }}>
          <Form.Item>
            <Button type="primary" htmlType={'submit'}>
              Tìm kiếm
            </Button>
          </Form.Item>
        </div>
      </Form>

      {statusCallBC && (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress color="error" />
        </Box>
      )}

      {!statusCallBC && <Table columns={columns} dataSource={diplomas} />}
    </Layout>
  );
};

export default FindForm;
