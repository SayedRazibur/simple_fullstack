// src/components/common/OrderSelect.jsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useOrders from '@/hooks/useOrders';
import { format } from 'date-fns';

export default function OrderSelect({
  value,
  onValueChange,
  allowAll = false,
}) {
  const [search, setSearch] = useState('');

  const { data: ordersData } = useOrders({
    page: 1,
    limit: 50,
    search,
  });

  const orders = ordersData?.data?.records || [];

  return (
    <Select
      value={value || (allowAll ? 'ALL' : '')}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Order" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Orders</SelectItem>}
        {orders.map((order) => (
          <SelectItem key={order.id} value={order.id.toString()}>
            #{order.id} - {order.client?.firstName} {order.client?.surname} -{' '}
            {format(new Date(order.date), 'MMM dd, yyyy')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
