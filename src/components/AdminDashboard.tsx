import { useState, useEffect } from 'react';
import { supabase, Submission, CoverageStats } from '../lib/supabase';
import { MapPin, CheckCircle, XCircle, Clock, Filter, Search, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [coverageStats, setCoverageStats] = useState<CoverageStats[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [view, setView] = useState<'gallery' | 'coverage'>('gallery');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedStatus, selectedState, searchTerm]);

  const loadData = async () => {
    setLoading(true);

    const { data: submissionsData } = await supabase
      .from('submissions')
      .select('*, districts(*)')
      .order('submitted_at', { ascending: false });

    const { data: statsData } = await supabase
      .from('coverage_stats')
      .select('*, districts(*)')
      .order('total_submissions', { ascending: false });

    if (submissionsData) setSubmissions(submissionsData);
    if (statsData) setCoverageStats(statsData);

    setLoading(false);
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter(s => s.districts?.state === selectedState);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contributor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.districts?.district_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
        admin_notes: adminNotes || null
      })
      .eq('id', id);

    if (!error) {
      setSelectedSubmission(null);
      setAdminNotes('');
      loadData();
    }
  };

  const states = [...new Set(submissions.map(s => s.districts?.state).filter(Boolean))];

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Review and manage image submissions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('gallery')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'gallery' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setView('coverage')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${
                  view === 'coverage' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Coverage
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-700">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">Approved</div>
              <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-700">Rejected</div>
              <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
            </div>
          </div>

          {view === 'gallery' && (
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search submissions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : view === 'coverage' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pending</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Approved</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rejected</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coverageStats.map(stat => (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{stat.districts?.state}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{stat.districts?.district_name}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold">{stat.total_submissions}</td>
                    <td className="px-6 py-4 text-sm text-center text-yellow-600">{stat.pending_count}</td>
                    <td className="px-6 py-4 text-sm text-center text-green-600">{stat.approved_count}</td>
                    <td className="px-6 py-4 text-sm text-center text-red-600">{stat.rejected_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((stat.approved_count / 1000) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-600">{stat.approved_count}/1000</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map(submission => (
              <div
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <div className="relative h-48">
                  <img
                    src={submission.image_url}
                    alt={submission.description}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {submission.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {submission.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {submission.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{submission.districts?.district_name}</div>
                      <div className="text-gray-600">{submission.districts?.state}</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{submission.description}</p>

                  <div className="text-xs text-gray-500">
                    <div>By: {submission.contributor_name}</div>
                    <div>{new Date(submission.submitted_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Review Submission</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedSubmission.image_url}
                    alt={selectedSubmission.description}
                    className="w-full rounded-lg"
                  />
                </div>

                <div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className={`mt-1 px-3 py-2 rounded-lg inline-block ${
                      selectedSubmission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSubmission.districts?.district_name}, {selectedSubmission.districts?.state}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedSubmission.description}</div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Contributor</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSubmission.contributor_name}
                      {selectedSubmission.contributor_contact && ` (${selectedSubmission.contributor_contact})`}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Submitted</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSubmission.submitted_at).toLocaleString()}
                    </div>
                  </div>

                  {selectedSubmission.latitude && selectedSubmission.longitude && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700">GPS Coordinates</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedSubmission.latitude}, {selectedSubmission.longitude}
                      </div>
                    </div>
                  )}

                  {selectedSubmission.status === 'pending' && (
                    <>
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add review notes..."
                          rows={3}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                          className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center"
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
