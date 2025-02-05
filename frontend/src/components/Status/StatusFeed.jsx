function StatusFeed() {
    const { data: statuses } = useQuery('statuses', () => 
      api.get('/status').then(res => res.data)
    );
  
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {statuses?.map(status => (
          <div key={status._id} className="flex-shrink-0 w-24">
            <img 
              src={status.mediaUrl || status.user.avatar} 
              className="rounded-full h-20 w-20 border-2 border-blue-500"
            />
          </div>
        ))}
      </div>
    );
  }