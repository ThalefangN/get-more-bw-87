
import { useState, useRef } from "react";
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
  const nameRef = useRef<HTMLInputElement>(null);

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

    let logoUrl: string | undefined = currentStore.logo;

    if (logoFile) {
      // Generate path: store-logos/{storeId}/profile.png
      const path = `store-logos/${currentStore.id}_${Date.now()}_${logoFile.name}`;
      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("store-logos")
        .upload(path, logoFile, { upsert: true });

      if (uploadError) {
        setIsUploading(false);
        toast.error("Failed to upload image. Please try another image.");
        return;
      }
      // Get the public URL
      const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
      logoUrl = data.publicUrl;
    }

    // Update store DB
    const updatedName = nameRef.current?.value || currentStore.name;
    const { error } = await supabase
      .from("stores")
      .update({
        name: updatedName,
        logo: logoUrl,
      })
      .eq("id", currentStore.id);

    if (error) {
      setIsUploading(false);
      toast.error("Failed to update store settings.");
      return;
    }

    toast.success("Store profile updated!");
    // Update context and localStorage for immediate UI feedback
    const updatedStore = { ...currentStore, name: updatedName, logo: logoUrl };
    login(updatedStore);

    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Store Settings</DialogTitle>
        </DialogHeader>
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
          {/* Add more fields here such as address, phone, etc. if desired */}
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
