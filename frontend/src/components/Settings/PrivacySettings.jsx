function PrivacySettings() {
    const { user } = useAuth();
    const [isPublic, setIsPublic] = useState(user.isPublic);
    const [isAnonymous, setIsAnonymous] = useState(user.isAnonymous);
  
    const updatePrivacy = async (field, value) => {
      await api.patch('/users/privacy', { [field]: value });
    };
  
    return (
      <div className="space-y-4">
        <Toggle
          label="Public Profile"
          checked={isPublic}
          onChange={(e) => {
            setIsPublic(e.target.checked);
            updatePrivacy('isPublic', e.target.checked);
          }}
        />
        
        <Toggle
          label="Anonymous Mode"
          checked={isAnonymous}
          onChange={(e) => {
            setIsAnonymous(e.target.checked);
            updatePrivacy('isAnonymous', e.target.checked);
          }}
        />
      </div>
    );
  }