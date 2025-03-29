
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Product, useStore } from "@/contexts/StoreContext";

interface ProductFormProps {
  productToEdit?: Product;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProductForm = ({ productToEdit, onCancel, onSuccess }: ProductFormProps) => {
  const { addProduct, updateProduct } = useStore();
  const isEditing = !!productToEdit;
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    inStock: true
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        price: productToEdit.price.toString(),
        image: productToEdit.image,
        category: productToEdit.category,
        description: productToEdit.description,
        inStock: productToEdit.inStock
      });
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (checked: boolean, field: string) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Simple image URL validation
    if (!formData.image.startsWith('http')) {
      toast.error("Please enter a valid image URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        description: formData.description,
        inStock: formData.inStock
      };
      
      if (isEditing && productToEdit) {
        updateProduct(productToEdit.id, productData);
        toast.success("Product updated successfully!");
      } else {
        addProduct(productData);
        toast.success("Product added successfully!");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Groceries", "Beverages", "Fruits & Vegetables", "Ready Meals", 
    "Bakery", "Meat & Poultry", "Dairy", "Snacks", "Electronics", "Fashion"
  ];
  
  // Example image URLs for demo
  const sampleImages = [
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578339850459-76b0ac239aa2?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563536102677-8651f52bace2?w=500&auto=format&fit=crop"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price (P) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image URL *</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
          />
          <div className="text-sm text-gray-500">
            <p>For testing, you can use one of these sample images:</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {sampleImages.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-xs text-left text-getmore-purple hover:underline truncate"
                  onClick={() => setFormData(prev => ({ ...prev, image: url }))}
                >
                  Sample Image {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange(value, 'category')}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your product"
            rows={4}
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="inStock"
            checked={formData.inStock}
            onCheckedChange={(checked) => handleSwitchChange(checked, 'inStock')}
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
