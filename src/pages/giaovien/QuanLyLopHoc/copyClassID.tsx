import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message, Button, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

export const ClassCodeCopy: React.FC<{ classCode: string }> = ({ classCode }) => {
  const handleCopySuccess = () => {
    message.success('Đã sao chép mã lớp!');
  };

  return (
    <Space>
      <span><strong> Mã lớp học:</strong> {classCode}</span>
      <CopyToClipboard text={classCode} onCopy={handleCopySuccess}>
        <Button icon={<CopyOutlined />} />
      </CopyToClipboard>
    </Space>
  );
};
