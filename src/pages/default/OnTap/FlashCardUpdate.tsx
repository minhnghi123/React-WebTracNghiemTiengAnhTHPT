import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, message, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import "./FlashCardcss.css";

export const FlashCardUpdate: React.FC = () => {
  const [form] = Form.useForm();
  const { _id } = useParams<{ _id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  console.log(" _id: ", _id); 
    
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const res = await FlashCardAPI.getFlashCardSetDetail(_id!);
        if (res.flashCardSet) {
          form.setFieldsValue({
            title: res.flashCardSet.title,
            description: res.flashCardSet.description,
            vocabs: res.flashCardSet.vocabs,
            public: res.flashCardSet.public,
            editable: res.flashCardSet.editable,
            password: res.flashCardSet.password,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy flashcard set:", error);
        message.error("Không thể tải dữ liệu flashcard!");
      } finally {
        setLoading(false);
      }
    };

    if (_id) {
      fetchFlashcardSet();
    }
  }, [_id, form]);

  const onFinish = async (values: any) => {
    values.idSet = _id;
    try {
      const res = await FlashCardAPI.updateFlashCardSet(_id!, values as FlashCardSet);
      if (res.code === 200) {
        message.success("Flashcard được cập nhật thành công!");
      }
      window.location.href = `/flashcard/${_id}`;
    } catch (error: any) {
      console.error("Lỗi khi cập nhật flashcard:", error);
      message.error("Có lỗi xảy ra khi cập nhật flashcard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Cập nhật bộ Flashcard</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Tiêu đề không được trống!" }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Mô tả không được trống!" }]}
        >
          <Input.TextArea placeholder="Nhập mô tả ngắn gọn về flashcard" rows={4} />
        </Form.Item>
        <Form.List name="vocabs">
          {(fields, { add, remove }) => (
            <>
              <div className="table-container">
                <div className="table-header">
                  <span className="table-column">Từ vựng</span>
                  <span className="table-column">Định nghĩa</span>
                  <span className="table-column">Hình ảnh (nếu có)</span>
                  <span className="table-column">Hành động</span>
                </div>
                {fields.map(({ key, name }) => (
                  <div key={key} className="table-row">
                    <Form.Item
                      name={[name, "term"]}
                      rules={[{ required: true, message: "Từ vựng không được trống" }]}
                      className="table-column"
                    >
                      <Input placeholder="Nhập từ vựng" />
                    </Form.Item>
                    <Form.Item
                      name={[name, "definition"]}
                      rules={[{ required: true, message: "Định nghĩa không được trống" }]}
                      className="table-column"
                    >
                      <Input placeholder="Nhập định nghĩa" />
                    </Form.Item>
                    <Form.Item
                      name={[name, "image"]}
                      className="table-column"
                    >
                      <Input placeholder="Có thể nhập url (tùy chọn)" />
                    </Form.Item>
                    <div
                      className="table-column"
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "auto",
                        marginBottom: "auto",
                        height: "100%"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Button
                          type="link"
                          danger
                          onClick={() => remove(name)}
                          icon={<MinusCircleOutlined />}
                          style={{
                            border: "1px solid black",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "auto",
                            marginBottom: "auto"
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm từ vựng
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item name="public" valuePropName="checked">
          <Checkbox>Công khai bộ từ vựng</Checkbox>
        </Form.Item>
        <Form.Item name="editable" valuePropName="checked">
          <Checkbox>Có thể sửa</Checkbox>
        </Form.Item>
        <Form.Item name="password" label="Password (nếu cần)">
          <Input placeholder="Nhập password (tùy chọn)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Cập nhật Flashcard Set
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
