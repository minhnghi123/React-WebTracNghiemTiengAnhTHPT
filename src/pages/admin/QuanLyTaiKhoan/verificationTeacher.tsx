import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Tabs, Input, Tag } from 'antd';
import type { TabsProps } from 'antd';
import { AdminAPI, VerificationRequest } from '@/services/admin/Admin';

const { Search } = Input;

const VerificationTeacher: React.FC = () => {
  const [teachers, setTeachers] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getVerificationRequests();
      setTeachers(response);
    } catch (err) {
      setError('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleApprove = async (teacherId: string) => {
    try {
      await AdminAPI.approveTeacher(teacherId);
      message.success('Teacher approved successfully');
      fetchTeachers(); 
    } catch (err) {
      message.error('Failed to approve teacher');
    }
  };

  const handleReject = async (teacherId: string) => {
    try {
      await AdminAPI.rejectTeacher(teacherId);
      message.success('Teacher rejected successfully');
      fetchTeachers(); 
    } catch (err) {
      message.error('Failed to reject teacher');
    }
  };

  const getColumns = () => [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'gold' : status === 'approved' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: VerificationRequest) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleApprove(record._id)}
            disabled={record.status !== 'pending'}
          >
            Chấp nhận
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleReject(record._id)}
            disabled={record.status !== 'pending'}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  // Hàm lọc dữ liệu dựa trên trạng thái và tìm kiếm theo username hoặc email
  const getFilteredData = (status: string) =>
    teachers.filter((teacher) =>
      teacher.status === status &&
      (teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
       teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const tabItems: TabsProps['items'] = [
    {
      key: 'pending',
      label: 'Đang chờ xác thực',
      children: (
        <Table
          dataSource={getFilteredData('pending')}
          columns={getColumns()}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'approved',
      label: 'Đã xác thực',
      children: (
        <Table
          dataSource={getFilteredData('approved')}
          columns={getColumns()}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'rejected',
      label: 'Từ chối',
      children: (
        <Table
          dataSource={getFilteredData('rejected')}
          columns={getColumns()}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Yêu cầu xác thực tài khoản</h1>
      <div className="mb-4">
        <Search
          placeholder="tìm kiếm theo username hoặc email"
          allowClear
          onSearch={(value) => setSearchTerm(value)}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>
      <Tabs defaultActiveKey="pending" items={tabItems} />
    </div>
  );
};

export default VerificationTeacher;
