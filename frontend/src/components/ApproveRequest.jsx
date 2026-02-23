import { Check, X, Clock, Mail, User, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'sonner';

export function ApproveRequests() {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('borrow_requests')
      .select(`
        *,
        catalog (
          image_url,
          category,
          status
        )
      `)
      .order('request_date', { ascending: false });

    if (error) {
      toast.error('Failed to load requests');
      console.error(error);
    } else {
      setBorrowRequests(data ?? []);
    }

    setLoading(false);
  };

  const updateStatus = async (id, status, studentName) => {
    const { error } = await supabase
      .from('borrow_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update request');
      console.error(error);
      return;
    }

    setBorrowRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );

    if (status === 'approved') {
      toast.success(`Request from ${studentName} approved!`);
    } else {
      toast.error(`Request from ${studentName} rejected.`);
    }
  };

  const filteredRequests = borrowRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount  = borrowRequests.filter(r => r.status === 'pending').length;
  const approvedCount = borrowRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = borrowRequests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{borrowRequests.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approvedCount}</p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
            </div>
            <X className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex gap-1">
        {['pending', 'approved', 'rejected', 'all'].map(tab => {
          const count =
            tab === 'pending'  ? pendingCount  :
            tab === 'approved' ? approvedCount :
            tab === 'rejected' ? rejectedCount :
            borrowRequests.length;

          const activeClass =
            tab === 'pending'  ? 'bg-yellow-100 text-yellow-900' :
            tab === 'approved' ? 'bg-green-100 text-green-900'   :
            tab === 'rejected' ? 'bg-red-100 text-red-900'       :
            'bg-gray-900 text-white';

          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                filter === tab ? activeClass : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'pending'  && 'Pending Approval Requests'}
            {filter === 'approved' && 'Approved Requests'}
            {filter === 'rejected' && 'Rejected Requests'}
            {filter === 'all'      && 'All Requests'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filter === 'pending'  && 'Approve tool borrow requests from students'}
            {filter === 'approved' && 'View all approved borrow requests'}
            {filter === 'rejected' && 'View all rejected borrow requests'}
            {filter === 'all'      && 'Complete history of all borrow requests'}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-2 w-8 h-8" />
            Loading...
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => {
              const tool = request.catalog;

              return (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-6">
                    {tool?.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={tool.image_url}
                          alt={request.tool_name}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {request.tool_name}
                          </h3>
                          {tool && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-blue-600">{tool.category}</span>
                            </div>
                          )}
                        </div>

                        <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1.5 ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'pending'  && <Clock className="w-4 h-4" />}
                          {request.status === 'approved' && <Check className="w-4 h-4" />}
                          {request.status === 'rejected' && <X className="w-4 h-4" />}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Student:</span>
                          <span className="font-medium text-gray-900">{request.student_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">{request.student_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Requested:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(request.request_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Purpose of Use:</span>
                        </div>
                        <div className="pl-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">{request.purpose}</p>
                        </div>
                      </div>

                      {tool?.status === 'unavailable' && request.status === 'pending' && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-orange-800">
                            This tool is currently marked as unavailable. Consider updating tool status before approving.
                          </p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => updateStatus(request.id, 'approved', request.student_name)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            Approve Request
                          </button>
                          <button
                            onClick={() => updateStatus(request.id, 'rejected', request.student_name)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                          >
                            <X className="w-4 h-4" />
                            Reject Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No requests found</p>
                <p className="text-sm text-gray-400">
                  {filter === 'pending'  && 'All caught up! No pending requests at the moment.'}
                  {filter === 'approved' && 'No approved requests yet.'}
                  {filter === 'rejected' && 'No rejected requests yet.'}
                  {filter === 'all'      && 'No borrow requests have been submitted yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApproveRequests;