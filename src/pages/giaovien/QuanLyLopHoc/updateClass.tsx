import React, {  useLayoutEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { ClassroomAPI, Classroom } from '@/services/teacher/ClassroomAPI';

interface UpdateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  _classroom_id: string;
  onClassroomUpdated: (updatedClassroom: Classroom) => void;
}

const UpdateClassModal: React.FC<UpdateClassModalProps> = ({ isOpen, onClose, _classroom_id, onClassroomUpdated }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [classroom, setClassroom] = useState<Classroom>({} as Classroom);

  const fetchClassroom = async () => {
    if (_classroom_id) {
      const data = await ClassroomAPI.getClassroomById(_classroom_id);
      if (data.success) {
        setClassroom(data.classroom);
        form.setFieldsValue({
          title: data.classroom.title,
          teacherId: data.classroom.teacherId,
          password: data.classroom.password,
          status: data.classroom.status,
        });
      }
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      fetchClassroom();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const updateData: Partial<Classroom> = {
        title: values.title,
        teacherId: values.teacherId,
        password: values.password,
        status: values.status,
      };

      const updatedClassroom = await ClassroomAPI.updateClassroom(classroom!._id!, updateData);
      onClassroomUpdated(updatedClassroom);
      message.success('Cập nhật lớp học thành công');
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Lỗi khi cập nhật lớp học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cập Nhật Lớp Học"
      visible={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Cập nhật"
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
      </Form>
    </Modal>
  );
};

export default UpdateClassModal;
