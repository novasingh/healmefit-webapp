import { Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

const ThreeDotsDropdown = ({ onEdit, onDelete }) => {
  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={onEdit}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={onDelete}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <EllipsisOutlined style={{ fontSize: '24px', cursor: 'pointer', rotate: '90deg' }} />
    </Dropdown>
  );
};
export default ThreeDotsDropdown