import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Tabs } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import ManageForm from './ManageForm';
import { connectMetamask } from '../../utils/contract';
import ListForm from './ListForm';
import Header from '../../components/Header';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Toastify from '../../components/Toastify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { TabPane } = Tabs;

const ContentLayout = styled.div``;

type TabName = 'list' | 'find' | 'manage';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState<TabName>('list');
  useEffect(() => {
    (async () => {
      await connectMetamask();
    })();
  }, []);

  return (
    <>
      <Header />

      <Box
        sx={{
          backgroundImage: `url(
              "https://i.pinimg.com/originals/6d/d1/15/6dd11523d1b76662509e9a9c5909b2ca.png"
            )`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <Container sx={{ padding: '20px' }} maxWidth="xl">
          <Grid container>
            <Grid item xs={12}>
              <Typography sx={{ color: '#fff' }}>Admin</Typography>

              <ContentLayout>
                <Card>
                  <Tabs
                    size={'small'}
                    activeKey={selectedTab}
                    onChange={(tab) => setSelectedTab(tab as TabName)}
                  >
                    <TabPane key={'list'} tab={<span>Danh sách văn bằng</span>} />
                    <TabPane
                      key={'manage'}
                      tab={
                        <span>
                          {' '}
                          <LockOutlined /> Quản lý văn bằng
                        </span>
                      }
                    />
                  </Tabs>

                  <div>
                    {selectedTab === 'list' && <ListForm />}
                    {selectedTab === 'manage' && <ManageForm />}
                  </div>
                </Card>
              </ContentLayout>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Admin;
