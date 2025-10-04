'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dialog from '@/components/ui/Dialog';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: number;
  name: string;
  contactNumber: string;
  guardianName: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
}

interface Class {
  id: number;
  name: string;
  coach: {
    id: number;
    name: string;
  };
  location: Location;
  // Some API responses include schedule details directly on Class
  startTime?: string | Date;
  endTime?: string | Date;
  dayOfWeek?: number;
  students?: ClassEnrollment[];
}

interface ClassEnrollment {
  id: number;
  studentId: number;
  classId: number;
  student: Student;
}

interface ClassSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  class: Class;
  attendance: AttendanceRecord[];
}

interface AttendanceRecord {
  id: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  remarks?: string;
  sessionId: number;
  enrollmentId: number;
  enrollment: ClassEnrollment;
}

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['ACADEMY_ADMIN', 'COACH']}>
      <AttendancePageContent />
    </ProtectedRoute>
  );
}

function AttendancePageContent() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [session, setSession] = useState<ClassSession | null>(null);
  const [attendance, setAttendance] = useState<Record<number, { status: string; remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
    showConfirmButton: false,
    confirmText: '',
    onConfirm: () => {}
  });

  // Fetch classes and all students on component mount
  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  // Fetch session when class or date changes
  useEffect(() => {
    if (selectedClassId && selectedDate) {
      fetchSession();
    }
  }, [selectedClassId, selectedDate]);
  
  // Fetch all students on component mount
  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Filter students when search query changes
  useEffect(() => {
    if (showAddStudentModal) {
      console.log('Search query changed:', searchQuery);
      // Use the API to search for students
      fetchAllStudents(searchQuery);
    }
  }, [searchQuery, showAddStudentModal]);

  // Open add student modal
  const openAddStudentModal = () => {
    setShowAddStudentModal(true);
    setSearchQuery('');
    fetchAllStudents(''); // Fetch all students when opening modal
  };

  // Fetch all students from API
  const fetchAllStudents = async (query = '') => {
    try {
      console.log('Fetching all students with query:', query);
      // Use academyId from AuthContext
      const academyId = user?.academyId || 1;
      const response = await fetch(`/api/students?academyId=${academyId}${query ? `&search=${encodeURIComponent(query)}` : ''}`);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data: Student[] = await response.json();
        console.log('Students fetched successfully:', data.length);
        
        // Store all students
        setAllStudents(data);
        
        // Apply client-side filtering if there's a query
        if (query && query.trim() !== '') {
          const lowerQuery = query.toLowerCase();
          const filtered = data.filter((student: Student) => 
            (student.name && student.name.toLowerCase().includes(lowerQuery)) ||
            (student.guardianName && student.guardianName.toLowerCase().includes(lowerQuery)) ||
            (student.contactNumber && student.contactNumber.includes(query)) ||
            (student.id && student.id.toString() === query)
          );
          console.log('Filtered students:', filtered.length);
          setFilteredStudents(filtered);
        } else {
          setFilteredStudents(data);
        }
      } else {
        console.error('Failed to fetch students:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        if (data.length > 0 && !selectedClassId) {
          setSelectedClassId(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSession = async () => {
    if (!selectedClassId || !selectedDate) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/attendance?classId=${selectedClassId}&date=${selectedDate}`
      );
      
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
        
        // Initialize attendance state
        const attendanceState: Record<number, { status: string; remarks: string }> = {};
        if (sessionData.attendance && sessionData.attendance.length > 0) {
          sessionData.attendance.forEach((record: AttendanceRecord) => {
            attendanceState[record.enrollment.student.id] = {
              status: record.status,
              remarks: record.remarks || ''
            };
          });
        } else {
          // If no attendance records exist yet, initialize with enrolled students
          sessionData.class.students?.forEach((enrollment: ClassEnrollment) => {
            attendanceState[enrollment.student.id] = {
              status: 'PRESENT',
              remarks: ''
            };
          });
        }
        setAttendance(attendanceState);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: number, field: 'status' | 'remarks', value: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };



  const addStudentToAttendance = (studentId: number) => {
    if (!session || !studentId) return;
    
    // Add student to attendance state
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        status: 'PRESENT',
        remarks: 'Ad-hoc attendance'
      }
    }));
    
    // Close the modal
    setShowAddStudentModal(false);
    setSelectedStudent(null);
    setSearchQuery('');
  };
  
  const saveAttendance = async () => {
    if (!session) return;

    setSaving(true);
    try {
      // Find enrollment IDs for each student
      const attendanceData = [];
      
      for (const [studentId, data] of Object.entries(attendance)) {
        // Find the enrollment for this student in the current class
        const enrollment = session.class.students?.find(
          e => e.student.id === parseInt(studentId)
        );
        
        // If student is enrolled, use enrollment ID
        if (enrollment) {
          attendanceData.push({
            studentId: parseInt(studentId),
            enrollmentId: enrollment.id,
            status: data.status,
            remarks: data.remarks
          });
        } else {
          // For ad-hoc students (not enrolled)
          attendanceData.push({
            studentId: parseInt(studentId),
            enrollmentId: 0, // Use 0 for ad-hoc students
            status: data.status,
            remarks: data.remarks
          });
        }
      }

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          attendance: attendanceData,
          markedBy: user?.id || 1 // Use authenticated user's ID
        }),
      });

      if (response.ok) {
        // Show success dialog
        setDialogProps({
          title: 'Success',
          message: 'Attendance saved successfully.',
          type: 'success',
          showConfirmButton: false,
          confirmText: '',
          onConfirm: () => {}
        });
        setDialogOpen(true);
        fetchSession(); // Refresh the session data
      } else {
        // Show error dialog with detailed error message
        const errorData = await response.json();
        setDialogProps({
          title: 'Error',
          message: `Failed to save attendance. ${errorData.details || errorData.error || 'Unknown error'}`,
          type: 'error',
          showConfirmButton: false,
          confirmText: '',
          onConfirm: () => {}
        });
        setDialogOpen(true);
        console.error('Error saving attendance:', errorData);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      // Show error dialog
      setDialogProps({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
        showConfirmButton: false,
        confirmText: '',
        onConfirm: () => {}
      });
      setDialogOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const generateSessions = async () => {
    if (!selectedClassId) return;

    try {
      const response = await fetch('/api/classes/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: parseInt(selectedClassId),
          weeksAhead: 4,
          action: 'generate'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show custom dialog with results
        setDialogProps({
          title: 'Sessions Generated',
          message: result.data.skippedSessions && result.data.skippedSessions.length > 0 
            ? `Generated ${result.data.generatedCount} sessions. Skipped ${result.data.skippedSessions.length} sessions that already have attendance records. Previous sessions without attendance were overwritten.`
            : `Generated ${result.data.generatedCount} sessions successfully. Previous sessions without attendance were overwritten.`,
          type: 'success',
          showConfirmButton: false,
          confirmText: '',
          onConfirm: () => {}
        });
        setDialogOpen(true);
        
        fetchSession(); // Refresh current session
      }
    } catch (error) {
      console.error('Error generating sessions:', error);
      
      // Show error dialog
      setDialogProps({
        title: 'Error',
        message: 'Failed to generate sessions. Please try again.',
        type: 'error',
        showConfirmButton: false,
        confirmText: '',
        onConfirm: () => {}
      });
      setDialogOpen(true);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <button
          onClick={generateSessions}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Generate Sessions
        </button>
      </div>

      {/* Class and Date Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.location?.name || 'No location'} - {cls.name} - {cls.coach.name} - {
                    (() => {
                      // First try to use the class's own start and end time
                      if (cls.startTime && cls.endTime) {
                        // Format time function
                        const formatTime = (timeString: string | Date) => {
                          let hours = 0;
                          let minutes = 0;
                          
                          // Handle Date objects
                          if (timeString instanceof Date) {
                            hours = timeString.getHours();
                            minutes = timeString.getMinutes();
                          } 
                          // Handle string inputs
                          else if (typeof timeString === 'string') {
                            // For ISO format strings with T separator
                            if (timeString.includes('T')) {
                              const timePart = timeString.split('T')[1];
                              const [h, m] = timePart.split(':').map(Number);
                              hours = h;
                              minutes = m;
                            } 
                            // For simple time strings like "10:00:00"
                            else if (timeString.includes(':')) {
                              const [h, m] = timeString.split(':').map(Number);
                              hours = h;
                              minutes = m;
                            }
                          }
                          
                          // Format with AM/PM
                          const period = hours >= 12 ? 'PM' : 'AM';
                          const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
                          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                        };
                        
                        return `${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}`;
                      }
                      
                      // Fallback to session time if available
                      const classSession = session && session.class.id === cls.id ? session : null;
                      if (classSession) {
                        // Extract time parts from ISO string without timezone conversion
                        const startParts = classSession.startTime.split('T')[1].split(':');
                        const endParts = classSession.endTime.split('T')[1].split(':');
                        
                        // Create time strings directly from hours and minutes
                        const startHour = parseInt(startParts[0]);
                        const startMinute = parseInt(startParts[1]);
                        const endHour = parseInt(endParts[0]);
                        const endMinute = parseInt(endParts[1]);
                        
                        // Format time strings with AM/PM
                        const formatTimeString = (hour: number, minute: number) => {
                          const period = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
                          return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                        };
                        
                        return `${formatTimeString(startHour, startMinute)} - ${formatTimeString(endHour, endMinute)}`;
                      }
                      return "Time not available";
                    })()
                  }
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Session Information */}
      {session && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Session Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Class:</span> {session.class.name}
            </div>
            <div>
              <span className="font-medium">Coach:</span> {session.class.coach.name}
            </div>
            <div>
              <span className="font-medium">Location:</span> {session.class.location?.name || 'No location'}
            </div>
            <div>
              <span className="font-medium">Date:</span> {new Date(session.date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}
            </div>
            <div>
              <span className="font-medium">Time:</span> {
                (() => {
                  // Extract time parts from ISO string without timezone conversion
                  const startParts = session.startTime.split('T')[1].split(':');
                  const endParts = session.endTime.split('T')[1].split(':');
                  
                  // Create time strings directly from hours and minutes
                  const startHour = parseInt(startParts[0]);
                  const startMinute = parseInt(startParts[1]);
                  const endHour = parseInt(endParts[0]);
                  const endMinute = parseInt(endParts[1]);
                  
                  // Format time strings with AM/PM
                  const formatTimeString = (hour: number, minute: number) => {
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
                    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                  };
                  
                  return `${formatTimeString(startHour, startMinute)} - ${formatTimeString(endHour, endMinute)}`;
                })()
              }
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-8">Loading session data...</div>
      ) : session ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Mark Attendance</h2>
            <button
              onClick={openAddStudentModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Ad-hoc Student
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guardian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Render all enrolled students */}
                {session.class.students?.map((enrollment) => {
                  const student = enrollment.student;
                  // Find existing attendance record if any
                  const existingRecord = session.attendance?.find(record => 
                    record.enrollment?.student?.id === student.id
                  );
                  const currentAttendance = attendance[student.id] || 
                    (existingRecord 
                      ? { status: existingRecord.status, remarks: existingRecord.remarks || '' }
                      : { status: 'PRESENT', remarks: '' });
                  
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.guardianName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.contactNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={currentAttendance.status}
                          onChange={(e) => handleAttendanceChange(student.id, 'status', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="LATE">Late</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={currentAttendance.remarks}
                          onChange={(e) => handleAttendanceChange(student.id, 'remarks', e.target.value)}
                          placeholder="Optional remarks..."
                          className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
                
                {/* Render ad-hoc students (not enrolled but added to attendance) */}
                {Object.entries(attendance)
                  .filter(([studentId]) => {
                    // Check if this student is not enrolled in the class
                    return !session.class.students?.some(enrollment => 
                      enrollment.student.id === parseInt(studentId)
                    );
                  })
                  .map(([studentId, data]) => {
                    // Find student details from allStudents
                    const student = allStudents.find(s => s.id === parseInt(studentId));
                    if (!student) return null;
                    
                    return (
                      <tr key={`adhoc-${student.id}`} className="bg-blue-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name} <span className="text-xs text-blue-600 ml-2">(Ad-hoc)</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.guardianName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.contactNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={data.status}
                            onChange={(e) => handleAttendanceChange(student.id, 'status', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={data.remarks}
                            onChange={(e) => handleAttendanceChange(student.id, 'remarks', e.target.value)}
                            placeholder="Optional remarks..."
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      ) : selectedClassId && selectedDate ? (
        <div className="text-center py-8 text-gray-500">
          No session found for the selected class and date.
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Please select a class and date to view attendance.
        </div>
      )}
      
      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Ad-hoc Student</h3>
              <button 
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSearchQuery('');
                  setSelectedStudent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type student name, guardian name or contact..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            
            {filteredStudents.length > 0 ? (
              <div className="max-h-60 overflow-y-auto mb-4">
                <ul className="divide-y divide-gray-200">
                  {filteredStudents.map(student => (
                    <li 
                      key={student.id}
                      className={`py-2 px-3 cursor-pointer hover:bg-gray-100 ${selectedStudent === student.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.guardianName} • {student.contactNumber}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-4 text-gray-500">No students found</div>
            ) : null}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSearchQuery('');
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedStudent && addStudentToAttendance(selectedStudent)}
                disabled={!selectedStudent}
                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedStudent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for notifications */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogProps.title}
        message={dialogProps.message}
        type={dialogProps.type}
        showConfirmButton={dialogProps.showConfirmButton}
        confirmText={dialogProps.confirmText}
        onConfirm={dialogProps.onConfirm}
      />
    </div>
  );
}