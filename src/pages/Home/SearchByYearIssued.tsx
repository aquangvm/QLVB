import React, { useState } from 'react';
import { Button, Form, Input, Table } from 'antd';
import styled from 'styled-components';
import { FileSearchOutlined } from '@ant-design/icons';

import {
  connectMetamask,
  getUriById,
  findByYearIssued,
  getDiplomaDataByTokenId
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
  yearIssued: string;
};

const SearchByYearIssued = () => {
  const [form] = Form.useForm<FormValues>();

  const [diplomas, setDiplomas] = useState<any[]>([]);

  const [statusCallBC, setStatusCallBC] = useState<boolean>(false);

  const columns = [
    {
      title: 'Số hiệu',
      dataIndex: 'dipId',
      key: 'dipId',
      render: (text: any) => text != null ? String(text) : ''
    },
    {
      title: 'Tên sinh viên',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Năm cấp văn bằng',
      dataIndex: 'yearIssued',
      key: 'yearIssued'
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

      const { yearIssued } = values;

      const ids = await findByYearIssued(contract, yearIssued);

      const newArray = ids.map((id: BigNumber) => id.toString());

      const tokens = await Promise.all(
        newArray.map(async (id) => ({
          id: id.toString(),
          uri: await getUriById(contract, id.toString())
        }))
      );

      let arr: any[] = []

      for (let i = 0; i < tokens.length; i++) {
        const element = tokens[i];

        const data = await axios.get("https://magenta-repulsive-beetle-354.mypinata.cloud/ipfs/" + element.uri)
        
        // Lấy dipId từ contract để đảm bảo luôn có giá trị
        const contractData = await getDiplomaDataByTokenId(contract, element.id);
        
        arr.push({ 
          ...data.data, 
          id: element.id,
          dipId: contractData.dipId || data.data.dipId || ''
        })  

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
        <Form.Item label="Năm cấp văn bằng" required={true} name={'yearIssued'}>
          <Input prefix={<InputIcon />} placeholder="Nhập năm cấp văn bằng (ví dụ: 2024)" />
        </Form.Item>
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

export default SearchByYearIssued;
