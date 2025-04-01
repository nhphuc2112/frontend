import { Button, Card, Col, Form, DatePicker, message, Modal, Popconfirm, Row, Select, Space, Typography, Tag, Input } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import Table, { ColumnsType } from 'antd/es/table';
import { BookingStatus } from '../../../data/bookings';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Booking {
    bookingId: number;
    customerId: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
    status: string;
}

interface RoomData {
    roomId: number;
    roomNum: string;
    roomType: string;
    price: number;
    status: string;
    description: string;
}

const BookingsManagement: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [availableRooms, setAvailableRooms] = useState<RoomData[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

            if (!apiToken) {
                console.error('API Token is not configured!');
                message.error('API configuration error. Please check your environment variables.');
                return;
            }

            const response = await fetch('/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch bookings');
            }

            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            message.error(error instanceof Error ? error.message : 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    // Fetch available rooms
    const fetchRooms = async () => {
        try {
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
            if (!apiToken) return;

            const response = await fetch('/api/rooms?status=available', {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch available rooms');
            }

            const data = await response.json();
            setAvailableRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
            if (!apiToken) return;

            const response = await fetch('/api/customers', {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }

            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchRooms();
        fetchCustomers();
    }, []);

    const handleAdd = () => {
        setEditingBooking(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: Booking) => {
        setEditingBooking(record);
        form.setFieldsValue({
            ...record,
            checkInDate: dayjs(record.checkInDate),
            checkOutDate: dayjs(record.checkOutDate),
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
            if (!apiToken) return;

            const response = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            message.success('Booking deleted successfully');
            fetchBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            message.error('Failed to delete booking');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
            if (!apiToken) return;

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`,
            };

            const bookingData = {
                ...values,
                checkInDate: values.checkInDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                checkOutDate: values.checkOutDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            };

            if (editingBooking) {
                const response = await fetch(`/api/bookings?id=${editingBooking.bookingId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(bookingData),
                });

                if (!response.ok) {
                    throw new Error('Failed to update booking');
                }

                message.success('Booking updated successfully');
            } else {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(bookingData),
                });

                if (!response.ok) {
                    throw new Error('Failed to create booking');
                }

                message.success('Booking created successfully');
            }

            setIsModalVisible(false);
            fetchBookings();
        } catch (error) {
            console.error('Error saving booking:', error);
            message.error('Failed to save booking');
        }
    };

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.pending:
                return 'orange';
            case BookingStatus.confirmed:
                return 'blue';
            case BookingStatus.checked_in:
                return 'green';
            case BookingStatus.completed:
                return 'purple';
            case BookingStatus.cancelled:
                return 'red';
            default:
                return 'default';
        }
    };

    const columns: ColumnsType<Booking> = [
        {
            title: 'Booking ID',
            dataIndex: 'bookingId',
            key: 'bookingId',
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (_, record) => {
                const customer = customers.find(c => c.id === record.customerId.toString());
                return customer ? customer.name : 'Unknown Customer';
            },
        },
        {
            title: 'Room',
            key: 'room',
            render: (_, record) => {
                const room = availableRooms.find(r => r.roomId === record.roomId);
                return room ? room.roomNum : 'Unknown Room';
            },
        },
        {
            title: 'Check In',
            dataIndex: 'checkInDate',
            key: 'checkInDate',
            render: (text) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Check Out',
            dataIndex: 'checkOutDate',
            key: 'checkOutDate',
            render: (text) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Total Price',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price: number) => `$${Number(price).toFixed(2)}`
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: BookingStatus) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
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
                        title="Are you sure you want to delete this booking?"
                        onConfirm={() => handleDelete(record.bookingId)}
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
                        <Title level={2}>Booking Management</Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Add Booking
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="bookingId"
                    loading={loading}
                />

                <Modal
                    title={editingBooking ? 'Edit Booking' : 'Add Booking'}
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={() => setIsModalVisible(false)}
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Form.Item
                            name="customerId"
                            label="Customer"
                            rules={[{ required: true, message: 'Please select a customer!' }]}
                        >
                            <Select>
                                {customers.map(customer => (
                                    <Select.Option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="roomId"
                            label="Room"
                            rules={[{ required: true, message: 'Please select a room!' }]}
                        >
                            <Select>
                                {availableRooms.map(room => (
                                    <Select.Option key={room.roomId} value={room.roomId}>
                                        {room.roomNum} - {room.roomType}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="checkInDate"
                            label="Check In Date"
                            rules={[{ required: true, message: 'Please select check-in date!' }]}
                        >
                            <DatePicker showTime />
                        </Form.Item>

                        <Form.Item
                            name="checkOutDate"
                            label="Check Out Date"
                            rules={[{ required: true, message: 'Please select check-out date!' }]}
                        >
                            <DatePicker showTime />
                        </Form.Item>

                        <Form.Item
                            name="totalPrice"
                            label="Total Price"
                            rules={[{ required: true, message: 'Please input total price!' }]}
                        >
                            <Input type="number" min={0} step={0.01} />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status!' }]}
                        >
                            <Select>
                                {Object.values(BookingStatus).map(status => (
                                    <Select.Option key={status} value={status}>
                                        {status.toUpperCase()}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default BookingsManagement;