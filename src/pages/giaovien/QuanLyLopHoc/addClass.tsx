import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ClassroomAPI, Classroom } from '@/services/teacher/ClassroomAPI';
import { useAuthContext } from '@/contexts/AuthProvider';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomAdded: (classroom: Classroom) => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onClassroomAdded }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { user }= useAuthContext();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const newClassroom: Classroom = {
        title: values.title,
        teacherId: user?._id || '',
        students: [],
        password: values.password,
        exams: [],
        status: "active",
      };

      const createdClassroom = await ClassroomAPI.createClassroom(newClassroom);
      if(createdClassroom.success)
      {
        onClassroomAdded(createdClassroom);
        message.success('Tạo lớp học thành công');
        form.resetFields();
        onClose();

      }
      else message.error(createdClassroom.message);
     
    } catch (error) {
      message.error('Lỗi khi tạo lớp học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm Lớp Học Mới"
      visible={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Mật khẩu" name="password">
          <Input.Password />
        </Form.Item>
        
      </Form>
    </Modal>
  );
};

export default AddClassModal;
