
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Image, Upload, AlertCircle } from "lucide-react";

interface StoreSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StoreSettings = ({ open, onOpenChange }: StoreSettingsProps) => {
  const { currentStore, login } = useStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBucketReady, setIsBucketReady] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if the bucket exists when the component mounts
    const checkBucketExists = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking buckets:", error);
          toast.error("Failed to check storage configuration");
          return;
        }
        
        const bucketExists = buckets.some(b => b.name === 'store-logos');
        setIsBucketReady(bucketExists);
        
        if (!bucketExists) {
          toast.error("Storage not properly configured", {
            description: "The store-logos bucket doesn't exist. Contact an administrator."
          });
        }
      } catch (err) {
        console.error("Failed to check bucket status:", err);
      }
    };
    
    checkBucketExists();
  }, []);

  if (!currentStore) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Get the updated name
      const updatedName = nameRef.current?.value || currentStore.name;
      let logoUrl = currentStore.logo;
      
      // Only attempt to upload if there's a new logo and the bucket exists
      if (logoFile && isBucketReady) {
        try {
          // Generate unique path using timestamp and file name to avoid collisions
          const filePath = `${currentStore.id}/${Date.now()}_${logoFile.name.replace(/\s+/g, '_')}`;
          
          // Upload the new logo
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("store-logos")
            .upload(filePath, logoFile, { upsert: true });

          if (uploadError) {
            console.error("Logo upload error:", uploadError);
            toast.error(`Logo upload failed: ${uploadError.message}`);
          } else {
            // Get the public URL
            const { data } = supabase.storage.from("store-logos").getPublicUrl(filePath);
            logoUrl = data.publicUrl;
            toast.success("Logo uploaded successfully!");
          }
        } catch (uploadError) {
          console.error("Unexpected upload error:", uploadError);
          toast.error("Failed to upload logo. Please try again later.");
        }
      } else if (logoFile && !isBucketReady) {
        toast.error("Cannot upload logo", { 
          description: "Storage is not properly configured. Your store info will be updated without the logo."
        });
      }

      // Update the store information in the database
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          name: updatedName,
          logo: logoUrl,
        })
        .eq("id", currentStore.id);

      if (updateError) {
        console.error("Store update error:", updateError);
        toast.error(`Failed to update store: ${updateError.message}`);
      } else {
        // Update was successful
        toast.success("Store profile updated successfully!");
        
        // Update context and localStorage for immediate UI feedback
        const updatedStore = { ...currentStore, name: updatedName, logo: logoUrl };
        login(updatedStore);
        
        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Unexpected error during store update:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Store Settings</DialogTitle>
        </DialogHeader>
        
        {!isBucketReady && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Storage not configured properly</p>
              <p className="text-xs mt-1">
                The store-logos storage bucket is not available. Logo uploads won't work, but you can still update your store name.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Store Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border">
                {logoPreview || currentStore.logo ? (
                  <img
                    src={logoPreview || currentStore.logo}
                    alt="Store Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Error loading image");
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Logo";
                    }}
                  />
                ) : (
                  <Image className="text-gray-300" size={36} />
                )}
              </div>
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center gap-2 px-3 py-1.5 ${!isBucketReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-getmore-purple hover:bg-getmore-purple/80 cursor-pointer'} text-white text-xs rounded shadow`}
              >
                <Upload size={16} />
                {logoFile ? "Change Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={isUploading || !isBucketReady}
                />
              </label>
            </div>
            {!isBucketReady && (
              <p className="text-xs text-amber-600 mt-2">
                Logo uploads are currently disabled due to storage configuration issues.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>
            <Input
              id="name"
              type="text"
              defaultValue={currentStore.name}
              ref={nameRef}
              className="w-full"
              disabled={isUploading}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoreSettings;
