import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Card,
  Space,
  Spin,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import "./FlashCardcss.css";

export const FlashCardUpdate: React.FC = () => {
  const [form] = Form.useForm();
  const { _id } = useParams<{ _id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    values.idSet = _id;
    try {
      const res = await FlashCardAPI.updateFlashCardSet(
        _id!,
        values as FlashCardSet
      );
      if (res.code === 200) {
        message.success("Flashcard được cập nhật thành công!");
        navigate(`/flashcard/${_id}`);
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật flashcard:", error);
      message.error("Có lỗi xảy ra khi cập nhật flashcard!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flashcard-loading">
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flashcard-create-page">
      {/* Hero Section */}
      <div className="flashcard-hero compact">
        <div className="hero-background"></div>
        <div className="hero-content">
          <BookOutlined className="hero-icon" />
          <h1 className="hero-title">Chỉnh sửa bộ từ vựng</h1>
          <p className="hero-subtitle">Cập nhật thông tin và từ vựng của bạn</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="flashcard-form-container">
        <Card className="form-card" bordered={false}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/flashcard/${_id}`)}
            className="back-btn-form"
            type="text"
          >
            Quay lại
          </Button>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="flashcard-form"
          >
            <div className="form-header-section">
              <Form.Item
                name="title"
                label="Tiêu đề bộ từ vựng"
                rules={[
                  { required: true, message: "Tiêu đề không được trống!" },
                ]}
              >
                <Input
                  placeholder="VD: Từ vựng Tiếng Anh lớp 10"
                  size="large"
                  className="form-input"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Mô tả không được trống!" }]}
              >
                <Input.TextArea
                  placeholder="Mô tả ngắn gọn về bộ từ vựng này..."
                  rows={4}
                  className="form-textarea"
                />
              </Form.Item>
            </div>

            <div className="vocabs-section">
              <h3 className="section-title">
                <BookOutlined />
                Danh sách từ vựng
              </h3>

              <Form.List name="vocabs">
                {(fields, { add, remove }) => (
                  <>
                    <div className="vocab-list">
                      {fields.map(({ key, name }, index) => (
                        <Card key={key} className="vocab-card" size="small">
                          <div className="vocab-card-header">
                            <span className="vocab-number">
                              Từ vựng {index + 1}
                            </span>
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(name)}
                                className="remove-btn"
                              >
                                Xóa
                              </Button>
                            )}
                          </div>

                          <div className="vocab-fields">
                            <Form.Item
                              name={[name, "term"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Từ vựng không được trống",
                                },
                              ]}
                              className="vocab-field"
                            >
                              <Input
                                placeholder="Nhập từ vựng (VD: Hello)"
                                size="large"
                              />
                            </Form.Item>

                            <Form.Item
                              name={[name, "definition"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Định nghĩa không được trống",
                                },
                              ]}
                              className="vocab-field"
                            >
                              <Input
                                placeholder="Nhập định nghĩa (VD: Xin chào)"
                                size="large"
                              />
                            </Form.Item>

                            <Form.Item
                              name={[name, "image"]}
                              className="vocab-field"
                            >
                              <Input
                                placeholder="URL hình ảnh (tùy chọn)"
                                size="large"
                              />
                            </Form.Item>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                      className="add-vocab-btn"
                    >
                      Thêm từ vựng
                    </Button>
                  </>
                )}
              </Form.List>
            </div>

            <div className="form-options-section">
              <h3 className="section-title">Tùy chọn</h3>

              <Space
                direction="vertical"
                size="middle"
                className="options-group"
              >
                <Form.Item name="public" valuePropName="checked" noStyle>
                  <Checkbox className="custom-checkbox">
                    <span className="checkbox-label">
                      Công khai bộ từ vựng
                      <span className="checkbox-desc">
                        Cho phép người khác xem và sử dụng
                      </span>
                    </span>
                  </Checkbox>
                </Form.Item>

                <Form.Item name="editable" valuePropName="checked" noStyle>
                  <Checkbox className="custom-checkbox">
                    <span className="checkbox-label">
                      Có thể chỉnh sửa
                      <span className="checkbox-desc">
                        Cho phép chỉnh sửa sau này
                      </span>
                    </span>
                  </Checkbox>
                </Form.Item>
              </Space>

              <Form.Item
                name="password"
                label="Mật khẩu bảo vệ (tùy chọn)"
                className="password-field"
              >
                <Input.Password
                  placeholder="Nhập mật khẩu nếu muốn bảo vệ bộ từ vựng"
                  size="large"
                />
              </Form.Item>
            </div>

            <div className="form-actions">
              <Button
                type="default"
                size="large"
                onClick={() => navigate(`/flashcard/${_id}`)}
                className="cancel-btn"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={submitting}
                className="submit-btn"
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};
