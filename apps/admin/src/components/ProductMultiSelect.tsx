import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  type FlatProduct,
  formatProductDisplayName,
  getProductsByIds,
  useFlatProducts,
} from "@/api/productsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ProductMultiSelectProps {
  selectedProductIds: string[];
  onSelectionChange: (productIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ProductMultiSelect = ({
  selectedProductIds,
  onSelectionChange,
  placeholder = "Select products (empty = all products)",
  className = "",
  disabled = false,
}: ProductMultiSelectProps) => {
  const { data: products, isLoading } = useFlatProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group filtered products by category
  const groupedProducts = filteredProducts.reduce(
    (acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    },
    {} as Record<string, FlatProduct[]>,
  );

  const selectedProducts = getProductsByIds(products, selectedProductIds);

  const handleProductToggle = (productId: string) => {
    const newSelection = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId];

    onSelectionChange(newSelection);
  };

  const handleRemoveProduct = (productId: string) => {
    onSelectionChange(selectedProductIds.filter((id) => id !== productId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleSelectAll = () => {
    onSelectionChange(products.map((p) => p._id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border border-gray-200 rounded-md">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="space-y-2">
        {/* Selected Products Display */}
        <div
          className={`min-h-[40px] p-3 border border-gray-200 rounded-md cursor-pointer bg-white ${
            disabled ? "bg-gray-50 cursor-not-allowed" : "hover:border-gray-300"
          } ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedProducts.length === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <Badge
                  key={product._id}
                  variant="secondary"
                  className="text-xs"
                >
                  {formatProductDisplayName(product)}
                  {!disabled && (
                    <button
                      type="button"
                      className="ml-1 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProduct(product._id);
                      }}
                    >
                      <XIcon size={12} />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          )}
          {!disabled && (
            <ChevronDownIcon
              size={20}
              className={`absolute right-3 top-3 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          )}
        </div>

        {/* Applicability Status */}
        {selectedProducts.length === 0 && (
          <p className="text-xs text-blue-600 font-medium">
            ✓ This coupon will apply to ALL available products
          </p>
        )}
        {selectedProducts.length > 0 && (
          <p className="text-xs text-gray-600">
            Coupon applies to {selectedProducts.length} selected product
            {selectedProducts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Header with search and controls */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <SearchIcon size={16} className="text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Products List */}
          <div className="max-h-64 overflow-y-auto">
            {Object.keys(groupedProducts).length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No products found
              </div>
            ) : (
              Object.entries(groupedProducts).map(
                ([category, categoryProducts]) => (
                  <div
                    key={category}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <div className="p-2 bg-gray-50 font-medium text-sm text-gray-700 border-b border-gray-100">
                      {category} ({categoryProducts.length})
                    </div>
                    {categoryProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(
                        product._id,
                      );
                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleProductToggle(product._id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleProductToggle(product._id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {product.name}
                              </span>
                              {!product.isActive && (
                                <Badge variant="outline" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {product.price && (
                              <div className="text-xs text-gray-500">
                                ₹{product.price.toLocaleString("en-IN")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMultiSelect;
