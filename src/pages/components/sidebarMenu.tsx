import {
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { Menu, message, Badge } from "antd";
import type { MenuProps } from "antd";
import dynamic from "next/dynamic";

import {
  CustomerServiceOutlined,
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  BellOutlined,
  SettingOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import BookingsManagement from "@/src/pages/admin/Booking/bookingsManagement";

const UsersManagement = dynamic(
  () => import("@/src/pages/admin/Users/userManagement"),
  { ssr: false }
);
const CustomersManagement = dynamic(
  () => import("@/src/pages/admin/Customers/customersManagement"),
  { ssr: false }
);
const Dashboards = dynamic(() => import("@/src/pages/admin/dashboards"), {
  ssr: false,
});
const ServicesManagement = dynamic(
  () => import("@/src/pages/admin/Services/servicesManagement"),
  { ssr: false }
);
const InvoiceManagement = dynamic(
  () => import("@/src/pages/admin/Invoices/invoiceManagement"),
  { ssr: false }
);
const RoomManagement = dynamic(
  () => import("@/src/pages/admin/Room/roomManagement"),
  { ssr: false }
);
const RoomBookings = dynamic(
  () => import("@/src/pages/admin/Booking/bookingsManagement"),
  { ssr: false }
);
type MenuItem = {
  key: string;
  label: string;
  icon?: string;
  baotri?: string;
  disabled?: boolean;
  type?: "group" | "divider";
  badge?: number;
  children?: MenuItem[];
};

const iconMap: Record<string, ReactNode> = {
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  UserOutlined: <UserOutlined />,
  VideoCameraOutlined: <VideoCameraOutlined />,
  HomeOutlined: <HomeOutlined />,
  BellOutlined: <BellOutlined />,
  SettingOutlined: <SettingOutlined />,
  LineChartOutlined: <LineChartOutlined />,
};

interface SidebarMenuProps {
  setActiveComponent: Dispatch<SetStateAction<ReactNode>>;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ setActiveComponent }) => {
  const [menuItems, setMenuItems] = useState<MenuProps["items"]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
  useEffect(() => {
    fetch("/api/adminMenu", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const formattedMenu = convertMenuItems(data.menu);
        setMenuItems(formattedMenu);
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const clickedItem = findMenuItem(menuItems, e.key);
    if (clickedItem) {
      if (clickedItem.baotri === "1") {
        message.warning(`🔧 ${clickedItem.label} đang bảo trì!`);
        return;
      }

      switch (e.key) {
        case "999":
          setActiveComponent(<Dashboards />);
          break;
        case "1":
          setActiveComponent(<CustomersManagement />);
          break;
        case "2":
          setActiveComponent(<UsersManagement />);
          break;
        case "5":
          setActiveComponent(<RoomManagement />);
          break;
        case "6":
          setActiveComponent(<BookingsManagement />);
          break;
        case "9":
          setActiveComponent(<ServicesManagement />);
          break;
        case "10":
          setActiveComponent(<InvoiceManagement />);
          break;
        case "11":
          message.info(
            "Analytics Management component will be implemented soon"
          );
          break;
        case "12":
          message.info("Report Management component will be implemented soon");
          break;
        case "13":
          message.info("Settings component will be implemented soon");
          break;
        case "14":
          message.info("Logging out...");

          break;
        default:
          setActiveComponent(null);
          message.info(`🚀 ${clickedItem.label}`);
      }
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const findMenuItem = (items: MenuProps["items"], key: string): any => {
    for (const item of items || []) {
      if ((item as any)?.key === key) return item;
      if ((item as any)?.children) {
        const found = findMenuItem((item as any)?.children, key);
        if (found) return found;
      }
    }
    return undefined;
  };

  const convertMenuItems = (items: MenuItem[]): MenuProps["items"] =>
    items.map((item) => {
      const menuItem: any = {
        key: item.key,
        label: (
          <span>
            <Badge
              count={item.badge}
              offset={[10, 0]}
              style={{
                width: "20px",
                margin: "5px 0 0 20px",
                fontSize: "10px",
              }}
            >
              <span style={{ marginLeft: 5, marginRight: 10, color: "white" }}>
                {item.label}
              </span>
            </Badge>
          </span>
        ),
        icon: item.icon ? iconMap[item.icon] : undefined,
        disabled: item.disabled,
        type: item.type,
      };

      if (item.children) {
        menuItem.children = convertMenuItems(item.children);
      }

      return menuItem;
    });

  return (
    <div>
      <Menu
        onClick={handleMenuClick}
        theme="dark"
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        mode="inline"
        items={menuItems}
      />
    </div>
  );
};

export default SidebarMenu;
