'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, TrendingUp, TrendingDown, BarChart3, Download, Filter } from 'lucide-react';

interface AttendanceStats {
  studentId: number;
  studentName: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

interface ClassStats {
  classId: number;
  className: string;
  totalStudents: number;
  averageAttendanceRate: number;
  totalSessions: number;
}

export default function AttendanceReportsPage() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [studentStats, setStudentStats] = useState<AttendanceStats[]>([]);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockStudentStats: AttendanceStats[] = [
      {
        studentId: 1,
        studentName: 'John Doe',
        totalSessions: 12,
        presentCount: 10,
        lateCount: 1,
        absentCount: 1,
        attendanceRate: 91.7
      },
      {
        studentId: 2,
        studentName: 'Jane Smith',
        totalSessions: 12,
        presentCount: 12,
        lateCount: 0,
        absentCount: 0,
        attendanceRate: 100
      },
      {
        studentId: 3,
        studentName: 'Mike Johnson',
        totalSessions: 12,
        presentCount: 8,
        lateCount: 2,
        absentCount: 2,
        attendanceRate: 83.3
      },
      {
        studentId: 4,
        studentName: 'Sarah Wilson',
        totalSessions: 10,
        presentCount: 9,
        lateCount: 0,
        absentCount: 1,
        attendanceRate: 90
      },
      {
        studentId: 5,
        studentName: 'Tom Brown',
        totalSessions: 10,
        presentCount: 7,
        lateCount: 1,
        absentCount: 2,
        attendanceRate: 80
      }
    ];

    const mockClassStats: ClassStats[] = [
      {
        classId: 1,
        className: 'U12 Beginners',
        totalStudents: 3,
        averageAttendanceRate: 91.7,
        totalSessions: 12
      },
      {
        classId: 2,
        className: 'U16 Advanced',
        totalStudents: 2,
        averageAttendanceRate: 85,
        totalSessions: 10
      }
    ];

    setStudentStats(mockStudentStats);
    setClassStats(mockClassStats);
  }, [selectedClass, selectedPeriod]);

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 bg-green-50';
    if (rate >= 85) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceBadgeColor = (rate: number) => {
    if (rate >= 95) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 85) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const exportReport = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting attendance report...');
    alert('Export functionality will be implemented');
  };

  const overallStats = {
    totalStudents: studentStats.length,
    averageAttendanceRate: studentStats.reduce((sum, student) => sum + student.attendanceRate, 0) / studentStats.length,
    totalSessions: Math.max(...studentStats.map(s => s.totalSessions), 0),
    studentsAbove95: studentStats.filter(s => s.attendanceRate >= 95).length,
    studentsBelow85: studentStats.filter(s => s.attendanceRate < 85).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Reports</h1>
          <p className="text-gray-600">Track student attendance rates and class performance</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="1">U12 Beginners</SelectItem>
                    <SelectItem value="2">U16 Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={exportReport} variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Average Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.averageAttendanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Excellent (≥95%)</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.studentsAbove95}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Needs Attention (&lt;85%)</p>
                  <p className="text-2xl font-bold text-red-600">{overallStats.studentsBelow85}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Class Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classStats.map((classItem) => (
                <div key={classItem.classId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{classItem.className}</h3>
                    <p className="text-sm text-gray-600">{classItem.totalStudents} students • {classItem.totalSessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getAttendanceBadgeColor(classItem.averageAttendanceRate)}>
                      {classItem.averageAttendanceRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Attendance Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Student Attendance Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Sessions</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Present</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Late</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Absent</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((student) => (
                    <tr key={student.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">{student.totalSessions}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {student.presentCount}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          {student.lateCount}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {student.absentCount}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(student.attendanceRate)}`}>
                          {student.attendanceRate.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}