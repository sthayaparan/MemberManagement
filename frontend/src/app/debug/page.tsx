'use client';

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Debug Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p className="font-mono">API_BASE_URL: {apiUrl}</p>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={async () => {
            try {
              const res = await fetch(`${apiUrl}/members`);
              console.log('Response status:', res.status);
              const data = await res.json();
              console.log('Response data:', data);
              alert(`Success! Got ${data.data?.length || 0} members`);
            } catch (err) {
              console.error('Error:', err);
              alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test API
        </button>
      </div>
    </div>
  );
}
