'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: number;
  name: string;
  contactNumber: string;
  guardianName: string;
}

interface Class {
  id: number;
  name: string;
  coach: {
    name: string;
  };
  court: {
    name: string;
  };
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
  enrollment: {
    student: Student;
  };
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [session, setSession] = useState<ClassSession | null>(null);
  const [attendance, setAttendance] = useState<Record<number, { status: string; remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch session when class or date changes
  useEffect(() => {
    if (selectedClassId && selectedDate) {
      fetchSession();
    }
  }, [selectedClassId, selectedDate]);

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
        sessionData.attendance?.forEach((record: AttendanceRecord) => {
          attendanceState[record.enrollment.student.id] = {
            status: record.status,
            remarks: record.remarks || ''
          };
        });
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



  const saveAttendance = async () => {
    if (!session) return;

    setSaving(true);
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, data]) => ({
        studentId: parseInt(studentId),
        status: data.status,
        remarks: data.remarks
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          attendance: attendanceData,
          markedBy: 1 // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        alert('Attendance saved successfully!');
        fetchSession(); // Refresh the session data
      } else {
        alert('Error saving attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
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
        alert(`Generated ${result.data.generatedCount} sessions`);
        fetchSession(); // Refresh current session
      }
    } catch (error) {
      console.error('Error generating sessions:', error);
      alert('Error generating sessions');
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
                  {cls.name} - {cls.coach.name} ({cls.court.name})
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
              <span className="font-medium">Court:</span> {session.class.court.name}
            </div>
            <div>
              <span className="font-medium">Date:</span> {new Date(session.date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Time:</span> {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-8">Loading session data...</div>
      ) : session ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Mark Attendance</h2>
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
                {session.attendance?.map((record) => {
                  const student = record.enrollment.student;
                  const currentAttendance = attendance[student.id] || { status: record.status, remarks: record.remarks || '' };
                  
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
    </div>
  );
}