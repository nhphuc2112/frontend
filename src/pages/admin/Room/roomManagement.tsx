import { Button, Card, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import Table, { ColumnsType } from 'antd/es/table';
import { Room, RoomStatus } from '../../../data/rooms';

const { Title } = Typography;

const RoomsManagement = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isEditingRoom, setIsEditingRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch rooms
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

            if (!apiToken) { message.error('API not configured'); return; }
            const response = await fetch("/api/rooms", {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch rooms!");
            }

            const data = await response.json();
            setRooms(data);
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Failed to fetch rooms!');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = () => {
        setIsEditingRoom(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditRoom = (record: Room) => {
        setIsEditingRoom(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    }

    const handleDeleteRoom = async (id: number) => {
        try {
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

            if (!apiToken) { message.error('API not configured'); return; }

            const response = await fetch(`/api/rooms?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete room!");
            }

            message.success('Room deleted successfully!');
            fetchRooms();
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Failed to delete room!');
        }
    }

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

            if (!apiToken) { message.error('API not configured'); return; }

            // Convert price to number and ensure status is set
            const roomData = {
                ...values,
                price: Number(values.price),
                status: values.status || RoomStatus.available
            };

            if (isEditingRoom) {
                // Update existing room
                const response = await fetch(`/api/rooms?id=${isEditingRoom?.roomId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiToken}`,
                    },
                    body: JSON.stringify(roomData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to update room!");
                }

                message.success('Room updated successfully!');
            } else {
                // Create new room
                const response = await fetch(`/api/rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiToken}`,
                    },
                    body: JSON.stringify(roomData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to create room!");
                }

                message.success('Room created successfully!');
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchRooms();
        } catch (error) {
            console.error('Error saving room:', error);
            message.error(error instanceof Error ? error.message : 'Failed to save room!');
        }
    };

    const columns: ColumnsType<Room> = [
        {
            title: 'Room Number',
            dataIndex: 'roomNum',
            key: 'roomNum'
        },
        {
            title: 'Room Type',
            dataIndex: 'roomType',
            key: 'roomType'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `$${price.toFixed(2)}`
        },
        {
            title: 'Room Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: RoomStatus) => {
                const statusMap = {
                    [RoomStatus.available]: { text: 'Available', color: 'green' },
                    [RoomStatus.booked]: { text: 'Booked', color: 'red' },
                    [RoomStatus.maintenance]: { text: 'Maintenance', color: 'orange' }
                };
                return <span style={{ color: statusMap[status].color }}>{statusMap[status].text}</span>;
            }
        },
        {
            title: 'Room Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) =>
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditRoom(record)}
                    >Edit</Button>
                    <Popconfirm
                        title="Are you sure you want to delete this room?"
                        onConfirm={() => handleDeleteRoom(record.roomId)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                </Space>
        }
    ]

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Title level={2}>Room Management</Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddRoom}
                        >Add Room</Button>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={rooms}
                    rowKey="roomId"
                    loading={loading}
                />
                <Modal
                    title={isEditingRoom ? "Edit Room" : "Add Room"}
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={() => setIsModalVisible(false)}
                >
                    <Form
                        form={form}
                        layout='vertical'
                    >
                        <Form.Item
                            name="roomNum"
                            label="Room Number"
                            rules={[
                                { required: true, message: 'Please input room number!' },
                                { pattern: /^[A-Za-z0-9]+$/, message: 'Room number can only contain letters and numbers!' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="roomType"
                            label="Room Type"
                            rules={[
                                { required: true, message: 'Please input room type!' },
                                { whitespace: true, message: 'Room type cannot be empty!' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Price"
                            rules={[
                                { required: true, message: 'Please input room price!' },
                                { 
                                    validator: (_, value) => {
                                        if (value === undefined || value === '') {
                                            return Promise.reject('Please input room price!');
                                        }
                                        const numValue = Number(value);
                                        if (isNaN(numValue)) {
                                            return Promise.reject('Price must be a number!');
                                        }
                                        if (numValue <= 0) {
                                            return Promise.reject('Price must be greater than 0!');
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input 
                                type="number" 
                                step="0.01" 
                                min="0.01"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        form.setFieldValue('price', undefined);
                                    } else {
                                        form.setFieldValue('price', Number(value));
                                    }
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select room status!' }]}
                        >
                            <Select options={[
                                {value: RoomStatus.available, label: 'Available'},
                                {value: RoomStatus.booked, label: 'Booked'},
                                {value: RoomStatus.maintenance, label: 'Maintenance'}
                            ]} />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Room Description"
                            rules={[
                                { required: true, message: 'Please input room description!' },
                                { whitespace: true, message: 'Description cannot be empty!' }
                            ]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    )
}

export default RoomsManagement;