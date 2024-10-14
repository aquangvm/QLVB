import React, { useState } from 'react';
import { Button, Form, Input, Table } from 'antd';
import styled from 'styled-components';
import { UserOutlined } from '@ant-design/icons';
import { connectMetamask, findByStudenId, getUriById, removeNFT } from '../../utils/contract';
import { getIpfsUrl } from '../../utils/ipfs';
import { BigNumber } from 'ethers';
import { toast } from 'react-toastify';
import { Box } from '@mui/system';
import { CircularProgress } from '@mui/material';
import moment from 'moment';
import axios from 'axios';

const Layout = styled.div`
  padding-top: 0.5rem;
`;

const UserIcon = styled(UserOutlined)`
  opacity: 0.5;
`;

type FormValues = {
  studentId: string;
};

const ListForm = () => {
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
    // {
    //   title: 'Quản lý',
    //   render: (text: any, record: any) => (
    //     <Button
    //       type="link"
    //       danger
    //       onClick={async () => {
    //         console.log(record);
    //         const { id, studentId, dipId, ipfsHash } = record;
    //         const contract = await connectMetamask();
    //         await removeNFT(contract, BigNumber.from(id));
    //         console.log(id);
    //       }}
    //     >
    //       Thu hồi
    //     </Button>
    //   )
    // }
  ];

  const onFinish = async (values: FormValues) => {
    setStatusCallBC(true);
    try {
      const contract = await connectMetamask();
      const { studentId } = values;
      const ids = await findByStudenId(contract, studentId);

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
      setStatusCallBC(false);
      toast.error('lỗi');
    }
  };

  return (
    <Layout>
      <Form form={form} layout={'vertical'} onFinish={onFinish}>
        <Form.Item label="Mã sinh viên" required={true} name={'studentId'}>
          <Input prefix={<UserIcon />} placeholder="Nhập mã sinh viên" />
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

export default ListForm;
