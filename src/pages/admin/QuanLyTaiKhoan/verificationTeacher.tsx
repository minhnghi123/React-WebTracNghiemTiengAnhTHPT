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
    setError(null); // Reset error state before fetching
    try {
      const response = await AdminAPI.getVerificationRequests();
      setTeachers(response);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Không thể tải danh sách giáo viên. Vui lòng thử lại sau.");
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
      message.success("Phê duyệt giáo viên thành công");
      setTimeout(fetchTeachers, 500); // Add delay to ensure backend updates are reflected
    } catch (err) {
      console.error("Error approving teacher:", err);
      message.error("Không thể phê duyệt giáo viên. Vui lòng thử lại sau.");
    }
  };

  const handleReject = async (teacherId: string) => {
    try {
      await AdminAPI.rejectTeacher(teacherId);
      message.success("Từ chối giáo viên thành công");
      setTimeout(fetchTeachers, 500); // Add delay to ensure backend updates are reflected
    } catch (err) {
      console.error("Error rejecting teacher:", err);
      message.error("Không thể từ chối giáo viên. Vui lòng thử lại sau.");
    }
  };

  const getColumns = () => [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'pending' ? 'gold' : status === 'approved' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) =>
        text
          ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(text)) +
            ` (${new Date(text).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false, // Use 24-hour format
            })})`
          : "N/A",
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) =>
        text
          ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(text)) +
            ` (${new Date(text).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false, // Use 24-hour format
            })})`
          : "N/A",
    },
    {
      title: 'Hành động',
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
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Display error in red for better visibility
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
