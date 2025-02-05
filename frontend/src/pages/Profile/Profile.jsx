import { useState } from 'react';
import AvatarUpload from '../components/AvatarUpload';

export default function Profile() {
  const [user, setUser] = useState(/* get from Redux */);

  const handleAvatarUpdate = (newAvatar) => {
    setUser(prev => ({ ...prev, avatar: { url: newAvatar } }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <AvatarUpload user={user} onUpdate={handleAvatarUpdate} />
        {/* Rest of profile form */}
      </div>
    </div>
  );
}