// src/components/common/ProductSelect.jsx
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useProducts from '@/hooks/useProducts';

export default function ProductSelect({
  value,
  onValueChange,
  allowAll = false,
  onSelect,
  selectedProduct,
  supplierId,
}) {
  const [search, setSearch] = useState('');

  const { data: productsData } = useProducts({
    page: 1,
    limit: 50,
    search,
    supplierId,
  });

  const products = productsData?.data?.records || [];

  // Ensure selected product is in the list
  const displayProducts = useMemo(() => {
    if (!selectedProduct) return products;
    const exists = products.find((p) => p.id === selectedProduct.id);
    if (exists) return products;
    return [selectedProduct, ...products];
  }, [products, selectedProduct]);

  const handleValueChange = (val) => {
    onValueChange(val);
    if (onSelect && val !== 'ALL') {
      const product = products.find((p) => p.id.toString() === val);
      if (product) onSelect(product);
    }
  };

  return (
    <Select
      value={value || (allowAll ? 'ALL' : '')}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Product" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Products</SelectItem>}
        {displayProducts.map((product) => (
          <SelectItem key={product.id} value={product.id.toString()}>
            {product.name} (PLU: {product.plu}) (Unit:{' '}
            {product?.batches?.[0]?.unit?.unitType})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
