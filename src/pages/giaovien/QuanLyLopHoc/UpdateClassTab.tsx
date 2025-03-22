import React from 'react';
import { Form, Input, Button, Select } from 'antd';

interface UpdateClassTabProps {
  updateForm: any;
  handleUpdateSubmit: () => void;
  updating: boolean;
}

const UpdateClassTab: React.FC<UpdateClassTabProps> = ({ updateForm, handleUpdateSubmit, updating }) => {
  return (
    <Form form={updateForm} layout="vertical">
      <Form.Item
        label="Tiêu đề"
        name="title"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
      >
        <Input />
      </Form.Item>
      {/* Nếu cần cập nhật teacherId thì có thể thêm Input hoặc Select */}
      <Form.Item label="Mật khẩu" name="password">
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Trạng thái"
        name="status"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
      >
        <Select>
          <Select.Option value="active">Hoạt động</Select.Option>
          <Select.Option value="inactive">Không hoạt động</Select.Option>
          <Select.Option value="completed">Hoàn thành</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleUpdateSubmit} loading={updating}>
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UpdateClassTab;