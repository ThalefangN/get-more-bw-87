
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Product, useStore } from "@/contexts/StoreContext";
import { X, Upload, Plus } from "lucide-react";

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
    images: [] as string[],
    category: "",
    description: "",
    inStock: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [imageInput, setImageInput] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        price: productToEdit.price.toString(),
        images: productToEdit.images || [productToEdit.image],
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

  const handleAddImage = () => {
    if (!imageInput) {
      toast.error("Please enter an image URL");
      return;
    }
    
    // Simple image URL validation
    if (!imageInput.startsWith('http')) {
      toast.error("Please enter a valid image URL");
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageInput]
    }));
    setImageInput("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (formData.images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: formData.images[0], // Primary image as the first one
        images: formData.images,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        // In a real app, we would upload the file to a server/storage service
        // For this demo, we're creating an object URL to simulate file upload
        const imageUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
      });
      // Reset the input
      event.target.value = '';
    }
  };

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
          <Label className="block mb-2">Product Images *</Label>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative rounded-md overflow-hidden aspect-square border border-gray-200">
                  <img 
                    src={image} 
                    alt={`Product ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                id="imageInput"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImage}
                className="flex-shrink-0"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Label 
                htmlFor="file-upload" 
                className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-md px-4 py-2 w-full text-sm text-gray-500 hover:bg-gray-50"
              >
                <Upload size={16} />
                Upload Images
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-3">
            <p>For testing, you can use one of these sample images:</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {sampleImages.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-xs text-left text-getmore-purple hover:underline truncate"
                  onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, url] }))}
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
