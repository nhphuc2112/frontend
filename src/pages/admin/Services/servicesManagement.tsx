import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Typography,
  Card,
  Row,
  Col,
  Select,
  Tag,
  InputNumber,
  Upload,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title } = Typography;
const { Option } = Select;

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'available' | 'unavailable';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Debug environment variables
  useEffect(() => {
    console.log('API Token available:', !!process.env.NEXT_PUBLIC_API_TOKEN);
    console.log('API Token value:', process.env.NEXT_PUBLIC_API_TOKEN);
  }, []);

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      
      if (!apiToken) {
        console.error('API Token is not configured!');
        message.error('API configuration error. Please check your environment variables.');
        return;
      }

      console.log('Making API request with token:', apiToken);
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch services');
      }
      
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error(error instanceof Error ? error.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Service) => {
    setEditingService(record);
    form.setFieldsValue(record);
    if (record.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: record.imageUrl,
        },
      ]);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      
      if (!apiToken) {
        console.error('API Token is not configured!');
        message.error('API configuration error. Please check your environment variables.');
        return;
      }

      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }

      message.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      message.error(error instanceof Error ? error.message : 'Failed to delete service');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      
      if (!apiToken) {
        console.error('API Token is not configured!');
        message.error('API configuration error. Please check your environment variables.');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      };
      
      if (editingService) {
        // Update existing service
        const response = await fetch(`/api/services?id=${editingService.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            ...values,
            status: values.status || 'available'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update service');
        }

        message.success('Service updated successfully');
      } else {
        // Create new service
        const response = await fetch('/api/services', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...values,
            status: values.status || 'available'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create service');
        }

        message.success('Service created successfully');
      }

      setIsModalVisible(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save service');
    }
  };

  const columns: ColumnsType<Service> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'available' ? 'green' : 'red'}>
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2}>Service Management</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Service
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
        />

        <Modal
          title={editingService ? 'Edit Service' : 'Add Service'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input service name!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input service description!' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please input service price!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                prefix="$"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please input service category!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select service status!' }]}
            >
              <Select>
                <Option value="available">Available</Option>
                <Option value="unavailable">Unavailable</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="Image URL"
            >
              <Input />
            </Form.Item>

            <Form.Item label="Upload Image">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                maxCount={1}
                beforeUpload={() => false}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ServiceManagement; 