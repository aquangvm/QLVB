import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Upload, Select } from 'antd';
import styled from 'styled-components';
import { LockOutlined } from '@ant-design/icons';
import { pinFileToIpfs, pinObject } from '../../utils/ipfs';
import { connectMetamask, createNFT } from '../../utils/contract';
import { toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import moment from 'moment';

const Layout = styled.div`
  padding-top: 0.5rem;
`;

type FormValues = {
  dipId: string;
  name: string;
  studentId: string;
  xeploai: string;
  dateOfBirth: any;
  yearIssued: string;
  createdAt: Date;
  ipfsHash: string;
};

const Manage = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);
      const contract = await connectMetamask();
      

      const { dipId, name, studentId, xeploai, dateOfBirth, yearIssued, createdAt, ipfsHash } = values;
      const dateOfBirthFormatted = moment(dateOfBirth).format('YYYY-MM-DD');
      const dip = {
        dipId: parseInt(dipId),
        name,
        studentId,
        xeploai,
        dateOfBirth: dateOfBirthFormatted,
        yearIssued,
        createdAt: createdAt.toISOString(),
        ipfsHash
      };
      const res = await pinObject(JSON.stringify(dip));
      const { IpfsHash } = res.data;
      console.log(1)
      const tokenId = await createNFT(contract, studentId, dipId, xeploai, dateOfBirthFormatted, yearIssued, IpfsHash);
      console.log(tokenId);

      toast.success('Lưu trữ thành công');
    } catch (e) {
      toast.error('Lưu trữ thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Form form={form} layout={'vertical'} onFinish={onFinish}>
        <Form.Item label="Số hiệu văn bằng" name="dipId" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Họ tên sinh viên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mã sinh viên"
          name="studentId"
          rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Xếp loại"
          name="xeploai"
          rules={[{ required: true, message: 'Vui lòng nhập xếp loại!' }]}
        >
          <Select placeholder="Chọn xếp loại">
            <Select.Option value="Xuất sắc">Xuất sắc</Select.Option>
            <Select.Option value="Giỏi">Giỏi</Select.Option>
            <Select.Option value="Khá">Khá</Select.Option>
            <Select.Option value="Trung bình">Trung bình</Select.Option>
            <Select.Option value="Trung bình khá">Trung bình khá</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Ngày tháng năm sinh"
          name="dateOfBirth"
          rules={[{ required: true, message: 'Vui lòng chọn ngày tháng năm sinh!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Năm cấp văn bằng"
          name="yearIssued"
          rules={[{ required: true, message: 'Vui lòng nhập năm cấp văn bằng!' }]}
        >
          <Input placeholder="Ví dụ: 2024" />
        </Form.Item>

        <Form.Item
          label="Ngày cấp"
          name="createdAt"
          rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="File" name="ipfsHash" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="upload" label="Văn bằng" rules={[{ required: true }]}>
          <Upload
            name="logo"
            beforeUpload={async (file) => {
              try {
                setLoading(true);
                const res = await pinFileToIpfs(file);
                const { IpfsHash } = res.data;
                console.log(IpfsHash);
                form.setFields([
                  {
                    name: 'ipfsHash',
                    value: IpfsHash
                  }
                ]);
              } catch (e) {
              } finally {
                setLoading(false);
              }
              return false;
            }}
            disabled={loading}
          >
            <Button
              type="primary"
              danger
              disabled={loading}
              icon={loading ? <CircularProgress size="20px" /> : <></>}
            >
              Click để Upload
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            icon={<LockOutlined />}
            type="primary"
            danger
            htmlType={'submit'}
            disabled={loading}
          >
            Lưu trữ văn bằng
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default Manage;
