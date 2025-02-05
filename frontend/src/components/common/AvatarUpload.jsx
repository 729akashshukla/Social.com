import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../utils/api';
import { toast } from 'react-hot-toast';

export default function AvatarUpload({ user, onUpdate }) {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpdate(data.avatar);
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  }, [onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    validator: (file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        return {
          code: 'invalid-file-type',
          message: 'Only JPG/JPEG/PNG files are allowed'
        };
      }
      return null;
    },
     onDropRejected: (rejectedFiles) => {
      const reasons = rejectedFiles.map(file => {
        return file.errors.map(error => error.message).join(', ');
      });
      toast.error(`Upload rejected: ${reasons.join('; ')}`);
    }
  });
  return (
    <div {...getRootProps()} className="group relative cursor-pointer">
      <input {...getInputProps()} />
      <img
        src={user.avatar?.url || '/default-avatar.png'}
        alt="Avatar"
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg hover:opacity-75 transition-opacity"
      />
      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-center text-sm">
          {isDragActive ? 'Drop here' : 'Click to upload\nor drag and drop'}
        </span>
      </div>
    </div>
  );
}