import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

export function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    onDrop: (files) => files[0] && onFile(files[0]),
    noClick: false,
  });

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  const openCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-2xl"
    >
      <div
        {...getRootProps()}
        className={`group relative cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition-all sm:p-12 ${
          isDragActive
            ? "border-cyan bg-cyan/5"
            : "border-border hover:border-cyan/50 hover:bg-white/[0.02]"
        }`}
      >
        <input {...getInputProps()} />

        {/* Hidden camera input — opens rear camera on phones/tablets */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraChange}
        />

        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan/20 to-bio/20 text-cyan transition-transform group-hover:scale-110 sm:h-16 sm:w-16">
          {isDragActive ? <Upload className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
        </div>
        <h3 className="font-display text-lg font-semibold sm:text-xl">
          {isDragActive ? "Drop the image" : "Upload a skin photo"}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          Drag &amp; drop or choose an option below · PNG, JPG, WEBP up to 10MB
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan to-bio px-5 py-2.5 text-sm font-medium text-background">
            <ImageIcon className="h-4 w-4" />
            Choose photo
          </div>
          <button
            type="button"
            onClick={openCamera}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/5 px-5 py-2.5 text-sm font-medium text-cyan transition-colors hover:bg-cyan/10"
          >
            <Camera className="h-4 w-4" />
            Take photo
          </button>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground sm:text-xs">
          🔒 Photos stay on your device until analysis. Never used for training.
        </p>
      </div>
    </motion.div>
  );
}
