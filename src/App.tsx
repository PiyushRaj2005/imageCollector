import { useState } from 'react';
import ContributorFlow from './components/ContributorFlow';
import AdminDashboard from './components/AdminDashboard';
import { Camera, LayoutDashboard } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<'home' | 'contributor' | 'admin'>('home');

  if (mode === 'contributor') {
    return <ContributorFlow />;
  }

  if (mode === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            India Visual Dataset
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            Building AI that understands India's cultural richness
          </p>
          <p className="text-blue-200">
            Help us collect 1000 images per village across all Indian districts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('contributor')}
            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contribute Images</h2>
            <p className="text-gray-600 mb-4">
              Upload images from your district with descriptions to help train AI models
            </p>
            <div className="text-blue-600 font-medium">Get Started →</div>
          </button>

          <button
            onClick={() => setMode('admin')}
            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
              <LayoutDashboard className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Review submissions, monitor coverage, and manage the image collection process
            </p>
            <div className="text-green-600 font-medium">View Dashboard →</div>
          </button>
        </div>

        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-3">Why This Matters</h3>
          <div className="space-y-2 text-sm text-blue-100">
            <p>
              AI models recognize the Eiffel Tower but may not recognize a Durga Puja pandal or local festivals
            </p>
            <p>
              We need culturally rich, location-verified imagery to make AI inclusive and representative of India
            </p>
            <p>
              Your contributions help train vision-language models like CLIP and GPT-4V on Indian contexts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
