
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Image, Upload } from "lucide-react";

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
          return;
        }
        
        const bucketExists = buckets.some(b => b.name === 'store-logos');
        setIsBucketReady(bucketExists);
        
        if (!bucketExists) {
          console.warn("store-logos bucket does not exist!");
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
      // Get the updated name even if logo upload fails
      const updatedName = nameRef.current?.value || currentStore.name;
      let logoUrl: string | undefined = currentStore.logo;
      
      // Only attempt to upload if there's a new logo and the bucket exists
      if (logoFile) {
        try {
          // Double-check bucket exists
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          
          if (bucketsError) {
            console.error("Error checking buckets:", bucketsError);
            toast.error("Failed to access storage. Please try again later.");
            // Continue with store update without logo
          } else {
            const bucketExists = buckets.some(b => b.name === 'store-logos');
            
            if (!bucketExists) {
              toast.error("Storage bucket 'store-logos' not found. Store info will be updated without logo.");
              // Continue with store update without logo
            } else {
              // Generate unique path using timestamp and file name
              const path = `${currentStore.id}_${Date.now()}_${logoFile.name}`;
              
              // Upload new logo
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from("store-logos")
                .upload(path, logoFile, { upsert: true });

              if (uploadError) {
                console.error("Upload error:", uploadError);
                toast.error(`Logo upload failed: ${uploadError.message}. Store info will be updated without logo.`);
                // Continue with store update without logo
              } else {
                // Get the public URL if upload succeeded
                const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
                logoUrl = data.publicUrl;
                toast.success("Logo uploaded successfully!");
              }
            }
          }
        } catch (uploadException) {
          console.error("Logo upload exception:", uploadException);
          toast.error("An error occurred during logo upload. Store info will be updated without logo.");
          // Continue with store update without logo
        }
      }

      // Always update the store info even if logo upload fails
      const { error } = await supabase
        .from("stores")
        .update({
          name: updatedName,
          logo: logoUrl,
        })
        .eq("id", currentStore.id);

      if (error) {
        console.error("Database update error:", error);
        toast.error(`Failed to update store: ${error.message}`);
        setIsUploading(false);
        return;
      }

      toast.success("Store profile updated successfully!");
      // Update context and localStorage for immediate UI feedback
      const updatedStore = { ...currentStore, name: updatedName, logo: logoUrl };
      login(updatedStore);

      setIsUploading(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">
              Warning: Storage may not be properly configured. Logo uploads might not work, but you can still update your store name.
            </p>
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
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-getmore-purple text-white text-xs rounded shadow cursor-pointer hover:bg-getmore-purple/80"
              >
                <Upload size={16} />
                {logoFile ? "Change Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={isUploading}
                />
              </label>
            </div>
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
