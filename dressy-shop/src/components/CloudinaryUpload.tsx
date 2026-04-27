import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const cloudinaryReady = CLOUD_NAME && CLOUD_NAME !== 'your_cloud_name';

interface Props {
  onUploaded: (url: string) => void;
  label?:     string;
}

export default function CloudinaryUpload({ onUploaded, label = 'Upload Image' }: Props) {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState('');

  const handleFile = async (file: File) => {
    if (!cloudinaryReady) {
      setError('Cloudinary is not configured yet. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env.local');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file',         file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder',       'dressy-atelier');

    try {
      // Use XHR to track upload progress
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UPLOAD_URL);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      onUploaded(url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed
                   border-rose/40 text-rose text-sm font-semibold hover:bg-rose/5
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
      >
        {uploading ? (
          <span className="w-4 h-4 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
        ) : '☁️'}
        {uploading ? `Uploading… ${progress}%` : label}
      </button>

      {/* Progress bar */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"
          >
            <motion.div
              className="h-full bg-rose rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Config warning in dev */}
      {!cloudinaryReady && (
        <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚙️ Cloudinary not configured yet — add your credentials to <code className="font-mono">.env.local</code>
        </p>
      )}
    </div>
  );
}
