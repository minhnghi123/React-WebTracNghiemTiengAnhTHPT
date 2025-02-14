import React from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FlashCardAPI } from "@/services/student/FlashCardAPI";
import "./FlashCardcss.css";
export const FlashCardCreate: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    console.log("Received values: ", values);
    try {
      const res = await FlashCardAPI.createFlashCardSet(values);
      if (res.code === 201) {
        message.success("Flashcard được tạo thành công!");
      }
      navigate(`/flashcard/${res.flashCardSet._id}`);
    } catch (error: any) {
      console.error("có lỗi xảy ra", error);
      message.error("Có lỗi xảy ra khi tạo flashcard!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Tạo bộ Flashcard</h1>
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
        <Form.List name="vocabs" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              <div className="table-container">
                <div className="table-header">
                  <span className="table-column"> Từ vựng</span>
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
                    <div className="table-column"
                    style={{  justifyContent: "center", alignItems: "center",marginTop:"auto", marginBottom:"auto", height:"100%" }}    
                    >
                      <div style={{display: "flex",alignItems: "center"}}>
                         
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                      icon={<MinusCircleOutlined />}
                      
                      style={{ border : "1px solid black", width: "100%", justifyContent: "center", alignItems: "center",marginTop:"auto", marginBottom:"auto" }}
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
            Tạo Flashcard Set
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

// Add the following CSS to your stylesheet
